'use server';

import { revalidatePath } from 'next/cache';
import { db } from '../../lib/db';
import { addItemSchema } from '../../lib/validations/item.schema';
import { items, users, characters, itemEvents } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { createItemSnapshot, getItemStatus } from '@/lib/helpers/item-helpers';
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

    await db.transaction(async (tx) => {
      const [item] = await tx
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

      await tx.insert(itemEvents).values({
        itemId: item.id,
        type: 'item_created',
        changedByUserId: getCurrentUserId(),
        snapshot: createItemSnapshot(item),
      });
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
  const userId = getCurrentUserId();

  try {
    const item = await db.select().from(items).where(eq(items.id, id)).limit(1);
    if (!item.length) {
      return {
        success: false,
        message: 'Item not found.',
      };
    }

    await db.transaction(async (tx) => {
      await tx.insert(itemEvents).values({
        itemId: item[0].id,
        type: 'item_deleted',
        changedByUserId: userId,
        snapshot: createItemSnapshot(item[0]),
      });
      await tx.delete(items).where(eq(items.id, id));
    });
    revalidatePath('/dashboard/items');
    return {
      success: true,
      message: 'Item deleted successfully',
    };
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

    const oldOwnerUserId = currentItem[0].ownerUserId;
    const oldAssignedId = currentItem[0].assignedId;
    const oldHolderId = currentItem[0].holderId;

    const ownerChanged = oldOwnerUserId !== ownerUserId;
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
      const [updatedItem] = await tx
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
        .where(eq(items.id, id))
        .returning();

      if (ownerChanged) {
        await tx.insert(itemEvents).values({
          itemId: id,
          type: 'owner_change',
          fromOwnerUserId: oldOwnerUserId,
          toOwnerUserId: ownerUserId,
          changedByUserId: userId,
          snapshot: createItemSnapshot(updatedItem),
        });
      }

      if (assignedChanged) {
        await tx.insert(itemEvents).values({
          itemId: id,
          type: 'reassignment',
          fromAssignedId: oldAssignedId,
          toAssignedId: assignedId,
          changedByUserId: userId,
          snapshot: createItemSnapshot(updatedItem),
        });
      }

      if (holderChanged) {
        await tx.insert(itemEvents).values({
          itemId: id,
          type: 'transfer',
          fromHolderId: oldHolderId,
          toHolderId: holderId,
          changedByUserId: userId,
          snapshot: createItemSnapshot(updatedItem),
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

    const item = await db.select().from(items).where(eq(items.id, id)).limit(1);
    if (!item.length) return { success: false, message: 'Item not found.' };

    if (item[0].ownerUserId === userId) {
      return {
        success: true,
        message: 'Item is already owned by this user.',
      };
    }
    await db.transaction(async (tx) => {
      const [updatedItem] = await tx
        .update(items)
        .set({
          ownerUserId: userId,
          updatedAt: new Date(),
        })
        .where(eq(items.id, id))
        .returning();

      await tx.insert(itemEvents).values({
        itemId: id,
        type: 'owner_change',
        fromOwnerUserId: item[0].ownerUserId,
        toOwnerUserId: userId,
        changedByUserId: getCurrentUserId(),
        snapshot: createItemSnapshot(updatedItem),
      });
    });
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
      const [updatedItem] = await tx
        .update(items)
        .set({
          assignedId: characterId,
          status,
          updatedAt: new Date(),
        })
        .where(eq(items.id, id))
        .returning();

      await tx.insert(itemEvents).values({
        itemId: id,
        type: 'reassignment',
        fromAssignedId: oldAssignedId,
        toAssignedId: characterId,
        changedByUserId: userId,
        snapshot: createItemSnapshot(updatedItem),
      });
    });

    revalidatePath('/dashboard/items');
    return { success: true, message: 'Item reassigned successfully' };
  } catch (error) {
    console.log('updateItemAssigned failed', error);
    return { success: false, message: 'Failed to reassign the item. Please try again later.' };
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
      const [updatedItem] = await tx
        .update(items)
        .set({
          holderId: characterId,
          status,
          updatedAt: new Date(),
        })
        .where(eq(items.id, id))
        .returning();

      await tx.insert(itemEvents).values({
        itemId: id,
        type: 'transfer',
        fromHolderId: oldHolderId,
        toHolderId: characterId,
        changedByUserId: userId,
        snapshot: createItemSnapshot(updatedItem),
      });
    });

    revalidatePath('/dashboard/items');
    return { success: true, message: 'Item transferred successfully' };
  } catch (error) {
    console.log('updateItemHolder failed', error);
    return { success: false, message: 'Failed to transfer item. Please try again later.' };
  }
}
