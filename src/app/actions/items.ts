'use server';

import { revalidatePath } from 'next/cache';
import { db } from '../../lib/db';
import { addItemSchema } from '../../lib/validations/item.schema';
import { items, users } from '../../lib/db/schema';
import { eq } from 'drizzle-orm';

export type State = {
  errors?: {
    name?: string[];
    grade?: string[];
    type?: string[];
    enchant?: string[];
    ownerUserId?: string[];
  };
  message?: string | null;
  success?: boolean;
};

export async function addItem(formData: FormData) {
  console.log('📦 formData entries:', Array.from(formData.entries()));
  const validatedFields = addItemSchema.safeParse({
    name: formData.get('name'),
    grade: formData.get('grade'),
    type: formData.get('type'),
    enchant: formData.get('enchant'),
    ownerUserId: formData.get('ownerUserId') ? Number(formData.get('ownerUserId')) : null,
  });
  if (!validatedFields.success) {
    console.log('❌ Validation errors:', validatedFields.error.flatten().fieldErrors);
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to Add an Item.',
      success: false,
    };
  }
  const { name, grade, type, enchant, ownerUserId } = validatedFields.data;
  console.log('✅ Validated data:', { name, grade, type, enchant, ownerUserId });
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
  try {
    const result = await db
      .insert(items)
      .values({
        name,
        grade,
        type,
        enchantLevel: enchant,
        ownerUserId,
        status: 'in_bank',
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
