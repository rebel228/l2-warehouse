'use server';

import { revalidatePath } from 'next/cache';
import { db } from '../../lib/db';
import { addItemSchema } from '../../lib/validations/item.schema';
import { items } from '../../lib/db/schema';

export type State = {
  errors?: {
    name?: string[];
    grade?: string[];
    type?: string[];
    enchant?: string[];
  };
  message?: string | null;
};

export async function addItem(prevstate: State, formData: FormData) {
  console.log('📦 formData entries:', Array.from(formData.entries()));
  const validatedFields = addItemSchema.safeParse({
    name: formData.get('name'),
    grade: formData.get('grade'),
    type: formData.get('type'),
    enchant: formData.get('enchant'),
  });
  if (!validatedFields.success) {
    console.log('❌ Validation errors:', validatedFields.error.flatten().fieldErrors);
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to Add an Item.',
    };
  }
  const { name, grade, type, enchant } = validatedFields.data;
  console.log('✅ Validated data:', { name, grade, type, enchant });
  try {
    const result = await db
      .insert(items)
      .values({
        name,
        grade,
        type,
        enchantLevel: enchant,
        status: 'in_bank',
      })
      .returning();
    console.log('✅ Inserted item:', result);
    revalidatePath('/dashboard/items');
    return { errors: {}, message: 'Item added successfully' };
  } catch (error) {
    console.error('❌ Database error:', error);
    return {
      errors: {},
      message: 'Database error: failed to add item',
    };
  }
}
