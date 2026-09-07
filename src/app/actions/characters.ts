'use server';

import { db } from '@/lib/db';
import { characters, items, reassignments, transfers, users } from '@/lib/db/schema';
import { getItemStatus } from '@/lib/helpers/item-helpers';
import { addCharacterSchema } from '@/lib/validations/character.schema';
import { eq, ilike, or } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export type CharacterWithRelations = Awaited<ReturnType<typeof getCharacters>>[number];

export type State = {
  errors?: {
    name?: string[];
    class?: string[];
    userId?: string[];
  };
  message?: string | null;
  success?: boolean;
};

const getCurrentUserId = () => 1; // temporary, change to user after adding auth

export async function addCharacter(formData: FormData): Promise<State> {
  console.log(' formData entries:', Array.from(formData.entries()));
  const validatedFields = addCharacterSchema.safeParse({
    name: formData.get('name'),
    class: formData.get('class'),
    userId: formData.get('userId'),
  });
  if (!validatedFields.success) {
    console.log('❌ Validation errors:', validatedFields.error.flatten().fieldErrors);
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to Add a Character.',
    };
  }
  const { name, class: characterClass, userId } = validatedFields.data;
  console.log('✅ Validated data:', { name, class: characterClass, userId });
  try {
    const result = await db
      .insert(characters)
      .values({
        name,
        class: characterClass,
        userId,
      })
      .returning();
    console.log('✅ Inserted character:', result);
    revalidatePath('/dashboard/characters');
    return { errors: {}, message: 'Character added successfully', success: true };
  } catch (error) {
    console.error('❌ Database error:', error);
    return {
      errors: {},
      message: 'Database error: failed to add character',
      success: false,
    };
  }
}

export async function updateCharacter(id: number, formData: FormData) {
  const validatedFields = addCharacterSchema.safeParse({
    name: formData.get('name'),
    class: formData.get('class'),
    userId: formData.get('userId') ? Number(formData.get('userId')) : null,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  const { name, class: characterClass, userId } = validatedFields.data;

  if (userId) {
    const userExists = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!userExists.length) {
      return {
        errors: { userId: ['User does not exist'] },
        success: false,
      };
    }
  }

  try {
    await db
      .update(characters)
      .set({
        name,
        class: characterClass,
        userId,
      })
      .where(eq(characters.id, id));

    revalidatePath('/dashboard/characters');
    return { success: true };
  } catch (error) {
    console.error('Update error:', error);
    return { success: false, message: 'Database error' };
  }
}

export async function getCharacters() {
  const result = await db.query.characters.findMany({
    with: {
      user: {
        columns: {
          id: true,
          username: true,
          email: true,
        },
      },
      assignedItems: {
        columns: {
          id: true,
          name: true,
          type: true,
          grade: true,
          enchantLevel: true,
          status: true,
        },
      },
      heldItems: {
        columns: {
          id: true,
          name: true,
          type: true,
          grade: true,
          enchantLevel: true,
          status: true,
        },
      },
    },
    orderBy: (characters, { asc }) => asc(characters.name),
  });

  return result;
}

export async function searchCharacters(search: string = '') {
  if (!search || search.length < 1) return [];

  const result = await db
    .select({
      id: characters.id,
      name: characters.name,
      class: characters.class,
      user: {
        id: users.id,
        username: users.username,
      },
    })
    .from(characters)
    .leftJoin(users, eq(characters.userId, users.id))
    .where(ilike(characters.name, `%${search}%`))
    .limit(10);

  return result;
}

export async function deleteCharacter(id: number) {
  const userId = getCurrentUserId();

  const relatedItems = await db
    .select()
    .from(items)
    .where(or(eq(items.assignedId, id), eq(items.holderId, id)));

  if (relatedItems.length === 0) {
    await db.delete(characters).where(eq(characters.id, id));
    revalidatePath('/dashboard/characters');
    revalidatePath('/dashboard/items');
    return;
  }

  await db.transaction(async (tx) => {
    for (const item of relatedItems) {
      const updates: Partial<typeof items.$inferInsert> = {};

      if (item.assignedId === id) {
        updates.assignedId = null;
        await tx.insert(reassignments).values({
          itemId: item.id,
          fromAssignedId: id,
          toAssignedId: null,
          changedByUserId: userId,
        });
      }

      if (item.holderId === id) {
        updates.holderId = null;
        await tx.insert(transfers).values({
          itemId: item.id,
          fromHolderId: id,
          toHolderId: null,
          changedByUserId: userId,
        });
      }

      const newAssignedId = item.assignedId === id ? null : item.assignedId;
      const newHolderId = item.holderId === id ? null : item.holderId;
      updates.status = getItemStatus(newAssignedId, newHolderId);

      await tx.update(items).set(updates).where(eq(items.id, item.id));
    }
    await tx.delete(characters).where(eq(characters.id, id));
  });

  revalidatePath('/dashboard/characters');
  revalidatePath('/dashboard/items');
}
