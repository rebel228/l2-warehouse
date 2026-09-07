'use server';

import { db } from '@/lib/db';
import { characters, items, reassignments, transfers, users } from '@/lib/db/schema';
import { getItemStatus } from '@/lib/helpers/item-helpers';
import { ActionResult, CharacterFieldErrors } from '@/lib/types/mutations-results';
import { addCharacterSchema } from '@/lib/validations/character.schema';
import { eq, ilike, or } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export type CharacterWithRelations = Awaited<ReturnType<typeof getCharacters>>[number];

const getCurrentUserId = () => 1; // temporary, change to user after adding auth

export async function addCharacter(
  formData: FormData
): Promise<ActionResult<CharacterFieldErrors>> {
  const validatedFields = addCharacterSchema.safeParse({
    name: formData.get('name'),
    class: formData.get('class'),
    userId: formData.get('userId'),
  });
  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Please correct the highlighted fields.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  const { name, class: characterClass, userId } = validatedFields.data;
  try {
    await db.insert(characters).values({
      name,
      class: characterClass,
      userId,
    });

    revalidatePath('/dashboard/characters');

    return { message: 'Character added successfully', success: true };
  } catch (error) {
    console.error('addCharacter failed', error);
    return {
      success: false,
      message: 'Failed to create character. Please try again.',
    };
  }
}

export async function updateCharacter(
  id: number,
  formData: FormData
): Promise<ActionResult<CharacterFieldErrors>> {
  const validatedFields = addCharacterSchema.safeParse({
    name: formData.get('name'),
    class: formData.get('class'),
    userId: formData.get('userId') ? Number(formData.get('userId')) : null,
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Please correct the highlighted fields.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { name, class: characterClass, userId } = validatedFields.data;

  try {
    if (userId !== null) {
      const userExists = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (!userExists.length) {
        return {
          success: false,
          errors: { userId: ['User does not exist'] },
          message: 'Please correct the highlighted fields.',
        };
      }
    }

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
    console.error('updateCharacter failed', error);
    return { success: false, message: 'Failed to update character. Please try again.' };
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

export async function deleteCharacter(id: number): Promise<ActionResult> {
  try {
    const userId = getCurrentUserId();

    const relatedItems = await db
      .select()
      .from(items)
      .where(or(eq(items.assignedId, id), eq(items.holderId, id)));

    if (relatedItems.length === 0) {
      await db.delete(characters).where(eq(characters.id, id));
      revalidatePath('/dashboard/characters');
      revalidatePath('/dashboard/items');
      return {
        success: true,
        message: 'Character deleted successfully.',
      };
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

    return {
      success: true,
      message: 'Character deleted successfully.',
    };
  } catch (error) {
    console.error('deleteCharacter failed', error);
    return { success: false, message: 'Failed to delete character. Please try again.' };
  }
}
