'use server';

import { revalidatePath } from 'next/cache';
import { db } from '../../lib/db';
import { addItemSchema } from '../../lib/validations/item.schema';
import { characters, items, users } from '../../lib/db/schema';
import { eq } from 'drizzle-orm';
import { getItemStatus } from '@/lib/helpers/item-helpers';

export type State = {
  errors?: {
    name?: string[];
    grade?: string[];
    type?: string[];
    enchant?: string[];
    ownerUserId?: string[];
    assignedId?: string[];
    holderId?: string[];
  };
  message?: string | null;
  success?: boolean;
};

export type ItemWithRelations = Awaited<ReturnType<typeof getItems>>[number];

export async function addItem(formData: FormData) {
  console.log('📦 formData entries:', Array.from(formData.entries()));
  const validatedFields = addItemSchema.safeParse({
    name: formData.get('name'),
    grade: formData.get('grade'),
    type: formData.get('type'),
    enchant: formData.get('enchant'),
    ownerUserId: formData.get('ownerUserId') ? Number(formData.get('ownerUserId')) : null,
    assignedId: formData.get('assignedId') ? Number(formData.get('assignedId')) : null,
    holderId: formData.get('holderId') ? Number(formData.get('holderId')) : null,
  });
  if (!validatedFields.success) {
    console.log('❌ Validation errors:', validatedFields.error.flatten().fieldErrors);
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to Add an Item.',
      success: false,
    };
  }
  const { name, grade, type, enchant, ownerUserId, assignedId, holderId } = validatedFields.data;
  console.log('✅ Validated data:', {
    name,
    grade,
    type,
    enchant,
    ownerUserId,
    assignedId,
    holderId,
  });
  if (ownerUserId) {
    const userExists = await db.select().from(users).where(eq(users.id, ownerUserId)).limit(1);
    if (!userExists.length) {
      return {
        errors: { ownerUserId: ['User does not exist'] },
        message: 'Invalid user',
        success: false,
      };
    }
  }
  if (assignedId) {
    const charExists = await db
      .select()
      .from(characters)
      .where(eq(characters.id, assignedId))
      .limit(1);
    if (!charExists.length) {
      return {
        errors: { assignedId: ['Character does not exist'] },
        message: 'Invalid character',
        success: false,
      };
    }
  }
  if (holderId) {
    const charExists = await db
      .select()
      .from(characters)
      .where(eq(characters.id, holderId))
      .limit(1);
    if (!charExists.length) {
      return {
        errors: { holderId: ['Character does not exist'] },
        message: 'Invalid character',
        success: false,
      };
    }
  }

  const status = getItemStatus(assignedId, holderId);

  try {
    const result = await db
      .insert(items)
      .values({
        name,
        grade,
        type,
        enchantLevel: enchant,
        ownerUserId,
        assignedId,
        holderId,
        status,
      })
      .returning();
    console.log('✅ Inserted item:', result);
    revalidatePath('/dashboard/items');
    console.log('Returning success: true');
    return { errors: {}, message: 'Item added successfully', success: true };
  } catch (error) {
    console.error('❌ Database error:', error);
    return {
      errors: {},
      message: 'Database error: failed to add item',
      success: false,
    };
  }
}

export async function getItems() {
  const result = await db.query.items.findMany({
    with: {
      ownerUser: {
        columns: {
          id: true,
          username: true,
          email: true,
        },
      },
      assignedChar: {
        columns: {
          id: true,
          name: true,
          class: true,
        },
      },
      holderChar: {
        columns: {
          id: true,
          name: true,
          class: true,
        },
      },
    },
    orderBy: { id: 'desc' },
  });

  return result;
}

export async function deleteItem(id: number) {
  await db.delete(items).where(eq(items.id, id));
  revalidatePath('/dashboard/items');
}

export async function updateItem(id: number, formData: FormData) {
  const validatedFields = addItemSchema.safeParse({
    name: formData.get('name'),
    grade: formData.get('grade'),
    type: formData.get('type'),
    enchant: formData.get('enchant'),
    ownerUserId: formData.get('ownerUserId') ? Number(formData.get('ownerUserId')) : null,
    assignedId: formData.get('assignedId') ? Number(formData.get('assignedId')) : null,
    holderId: formData.get('holderId') ? Number(formData.get('holderId')) : null,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  const { name, grade, type, enchant, ownerUserId, assignedId, holderId } = validatedFields.data;

  if (ownerUserId) {
    const userExists = await db.select().from(users).where(eq(users.id, ownerUserId)).limit(1);
    if (!userExists.length) {
      return {
        errors: { ownerUserId: ['User does not exist'] },
        success: false,
      };
    }
  }

  if (assignedId) {
    const charExists = await db
      .select()
      .from(characters)
      .where(eq(characters.id, assignedId))
      .limit(1);
    if (!charExists.length) {
      return {
        errors: { assignedId: ['Character does not exist'] },
        success: false,
      };
    }
  }

  if (holderId) {
    const charExists = await db
      .select()
      .from(characters)
      .where(eq(characters.id, holderId))
      .limit(1);
    if (!charExists.length) {
      return {
        errors: { holderId: ['Character does not exist'] },
        success: false,
      };
    }
  }

  const status = getItemStatus(assignedId, holderId);

  try {
    await db
      .update(items)
      .set({
        name,
        grade,
        type,
        enchantLevel: enchant,
        ownerUserId,
        assignedId,
        holderId,
        status,
        updatedAt: new Date(),
      })
      .where(eq(items.id, id));

    revalidatePath('/dashboard/items');
    return { success: true };
  } catch (error) {
    console.error('Update error:', error);
    return { success: false, message: 'Database error' };
  }
}

export async function updateItemOwner(id: number, userId: number | null) {
  if (userId !== null) {
    const userExists = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!userExists.length) {
      return { success: false, message: 'User not found' };
    }
  }
  await db.update(items).set({ ownerUserId: userId }).where(eq(items.id, id));
  revalidatePath('/dashboard/items');
  return { success: true };
}

export async function updateItemAssigned(id: number, characterId: number | null) {
  if (characterId !== null) {
    const charExists = await db
      .select()
      .from(characters)
      .where(eq(characters.id, characterId))
      .limit(1);
    if (!charExists.length) {
      return { success: false, message: 'Character not found' };
    }
  }
  const item = await db.select().from(items).where(eq(items.id, id)).limit(1);
  const currentHolderId = item[0]?.holderId ?? null;
  const status = getItemStatus(characterId, currentHolderId);
  await db.update(items).set({ assignedId: characterId, status }).where(eq(items.id, id));
  revalidatePath('/dashboard/items');
  return { success: true };
}

export async function updateItemHolder(id: number, characterId: number | null) {
  if (characterId !== null) {
    const charExists = await db
      .select()
      .from(characters)
      .where(eq(characters.id, characterId))
      .limit(1);
    if (!charExists.length) {
      return { success: false, message: 'Character not found' };
    }
  }
  const item = await db.select().from(items).where(eq(items.id, id)).limit(1);
  const currentAssignedId = item[0]?.assignedId ?? null;
  const status = getItemStatus(currentAssignedId, characterId);
  await db.update(items).set({ holderId: characterId, status }).where(eq(items.id, id));
  revalidatePath('/dashboard/items');
  return { success: true };
}
