'use server';

import { revalidatePath } from 'next/cache';
import { db } from '../../lib/db';
import { addItemSchema } from '../../lib/validations/item.schema';
import { items, users, characters, transfers, reassignments } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getItemStatus } from '@/lib/helpers/item-helpers';
import { ActionResult, ItemFieldErrors } from '@/lib/types/mutations-results';

const getCurrentUserId = () => 1; // temporary, change to user after adding auth

export type ItemWithRelations = Awaited<ReturnType<typeof getItems>>[number];

export async function addItem(formData: FormData): Promise<ActionResult<ItemFieldErrors>> {
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
      success: false,
      message: 'Failed to Add an Item.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const { name, grade, type, enchant, ownerUserId, assignedId, holderId } = validatedFields.data;
    if (ownerUserId != null) {
      const userExists = await db.select().from(users).where(eq(users.id, ownerUserId)).limit(1);
      if (!userExists.length) {
        return {
          success: false,
          message: 'Please correct the highlighted fields.',
          errors: { ownerUserId: ['User does not exist'] },
        };
      }
    }
    if (assignedId != null) {
      const charExists = await db
        .select()
        .from(characters)
        .where(eq(characters.id, assignedId))
        .limit(1);
      if (!charExists.length) {
        return {
          success: false,
          message: 'Please correct the highlighted fields.',
          errors: { assignedId: ['Character does not exist'] },
        };
      }
    }
    if (holderId != null) {
      const charExists = await db
        .select()
        .from(characters)
        .where(eq(characters.id, holderId))
        .limit(1);
      if (!charExists.length) {
        return {
          success: false,
          message: 'Please correct the highlighted fields.',
          errors: { holderId: ['Character does not exist'] },
        };
      }
    }

    const status = getItemStatus(assignedId, holderId);

    await db.insert(items).values({
      name,
      grade,
      type,
      enchantLevel: enchant,
      ownerUserId,
      assignedId,
      holderId,
      status,
    });
    revalidatePath('/dashboard/items');
    return { success: true, message: 'Item added successfully' };
  } catch (error) {
    console.log('addItem failed', error);
    return {
      success: false,
      message: 'Failed to add item',
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

export async function deleteItem(id: number): Promise<ActionResult> {
  try {
    await db.delete(items).where(eq(items.id, id));
    revalidatePath('/dashboard/items');
    return { success: true, message: 'Item deleted successfully' };
  } catch (error) {
    console.log('deleteItem failed', error);
    return {
      success: false,
      message: 'Failed to delete item. Please try again.',
    };
  }
}

export async function updateItem(
  id: number,
  formData: FormData
): Promise<ActionResult<ItemFieldErrors>> {
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
      success: false,
      message: 'Please correct the highlighted fields.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  try {
    const userId = getCurrentUserId();
    const currentItem = await db.select().from(items).where(eq(items.id, id)).limit(1);
    if (!currentItem.length) return { success: false, message: 'Item not found.' };

    const { name, grade, type, enchant, ownerUserId, assignedId, holderId } = validatedFields.data;
    const oldAssignedId = currentItem[0].assignedId;
    const oldHolderId = currentItem[0].holderId;
    const assignedChanged = oldAssignedId !== assignedId;
    const holderChanged = oldHolderId !== holderId;

    if (ownerUserId != null) {
      const userExists = await db.select().from(users).where(eq(users.id, ownerUserId)).limit(1);
      if (!userExists.length) {
        return {
          success: false,
          message: 'Please correct the highlighted fields.',
          errors: { ownerUserId: ['User does not exist'] },
        };
      }
    }

    if (assignedId != null) {
      const charExists = await db
        .select()
        .from(characters)
        .where(eq(characters.id, assignedId))
        .limit(1);
      if (!charExists.length) {
        return {
          success: false,
          message: 'Please correct the highlighted fields.',
          errors: { assignedId: ['Character does not exist'] },
        };
      }
    }

    if (holderId != null) {
      const charExists = await db
        .select()
        .from(characters)
        .where(eq(characters.id, holderId))
        .limit(1);
      if (!charExists.length) {
        return {
          success: false,
          message: 'Please correct the highlighted fields.',
          errors: { holderId: ['Character does not exist'] },
        };
      }
    }

    const status = getItemStatus(assignedId, holderId);

    await db.transaction(async (tx) => {
      await tx
        .update(items)
        .set({
          name,
          grade,
          type,
          enchantLevel: enchant,
          ownerUserId,
          assignedId,
          holderId,
          status: status,
          updatedAt: new Date(),
        })
        .where(eq(items.id, id));

      if (assignedChanged) {
        await tx.insert(reassignments).values({
          itemId: id,
          fromAssignedId: oldAssignedId,
          toAssignedId: assignedId,
          changedByUserId: userId,
        });
      }
      if (holderChanged) {
        await tx.insert(transfers).values({
          itemId: id,
          fromHolderId: oldHolderId,
          toHolderId: holderId,
          changedByUserId: userId,
        });
      }
    });

    revalidatePath('/dashboard/items');
    return { success: true, message: 'Item updated successfully.' };
  } catch (error) {
    console.log('updateItem failed', error);
    return { success: false, message: 'Failed to update item. Please try again.' };
  }
}

export async function updateItemOwner(
  id: number,
  userId: number | null
): Promise<ActionResult<ItemFieldErrors>> {
  try {
    if (userId !== null) {
      const userExists = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (!userExists.length) {
        return {
          success: false,
          message: 'Please correct the highlighted fields.',
          errors: {
            ownerUserId: ['User not found.'],
          },
        };
      }
    }

    await db.update(items).set({ ownerUserId: userId }).where(eq(items.id, id));
    revalidatePath('/dashboard/items');
    return { success: true, message: 'Item owner changed successfully' };
  } catch (error) {
    console.log('updateItemOwner failed', error);
    return { success: false, message: 'Failed to change the owner. Please try again later.' };
  }
}

export async function updateItemAssigned(
  id: number,
  characterId: number | null
): Promise<ActionResult<ItemFieldErrors>> {
  const userId = getCurrentUserId();

  try {
    if (characterId !== null) {
      const charExists = await db
        .select()
        .from(characters)
        .where(eq(characters.id, characterId))
        .limit(1);
      if (!charExists.length) {
        return {
          success: false,
          message: 'Please correct the highlighted fields.',
          errors: {
            assignedId: ['Character not found.'],
          },
        };
      }
    }
    const item = await db.select().from(items).where(eq(items.id, id)).limit(1);
    if (!item.length) return { success: false, message: 'Item not found.' };

    const oldAssignedId = item[0].assignedId;
    if (oldAssignedId === characterId)
      return { success: true, message: 'Item is already assigned to this character.' };

    const currentHolderId = item[0]?.holderId ?? null;
    const status = getItemStatus(characterId, currentHolderId);
    await db.transaction(async (tx) => {
      await tx.update(items).set({ assignedId: characterId, status }).where(eq(items.id, id));
      await tx.insert(reassignments).values({
        itemId: id,
        fromAssignedId: oldAssignedId,
        toAssignedId: characterId,
        changedByUserId: userId,
      });
    });

    revalidatePath('/dashboard/items');
    return { success: true, message: 'Item reassigned successfully' };
  } catch (error) {
    console.log('updateItemAssigned failed', error);
    return { success: false, message: 'Failed to reassign the item. Please ty again later.' };
  }
}

export async function updateItemHolder(
  id: number,
  characterId: number | null
): Promise<ActionResult<ItemFieldErrors>> {
  const userId = getCurrentUserId();

  try {
    if (characterId !== null) {
      const charExists = await db
        .select()
        .from(characters)
        .where(eq(characters.id, characterId))
        .limit(1);
      if (!charExists.length) {
        return {
          success: false,
          message: 'Please correct the highlighted fields.',
          errors: {
            holderId: ['Character not found.'],
          },
        };
      }
    }
    const item = await db.select().from(items).where(eq(items.id, id)).limit(1);
    if (!item.length) return { success: false, message: 'Item not found.' };

    const oldHolderId = item[0].holderId;
    if (oldHolderId === characterId)
      return { success: true, message: 'Item is already transferred to this character.' };

    const currentAssignedId = item[0]?.assignedId ?? null;
    const status = getItemStatus(currentAssignedId, characterId);

    await db.transaction(async (tx) => {
      await tx.update(items).set({ holderId: characterId, status }).where(eq(items.id, id));
      await tx.insert(transfers).values({
        itemId: id,
        fromHolderId: oldHolderId,
        toHolderId: characterId,
        changedByUserId: userId,
      });
    });

    revalidatePath('/dashboard/items');
    return { success: true, message: 'Item transferred successfully' };
  } catch (error) {
    console.log('updateItemHolder failed', error);
    return { success: false, message: 'Failed to transfer item. Please ty again later.' };
  }
}
