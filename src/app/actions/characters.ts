'use server';

import { db } from '@/lib/db';
import { characters } from '@/lib/db/schema';
import { addCharacterSchema } from '@/lib/validations/character.schema';
import { ilike } from 'drizzle-orm';
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
          // можно добавить и другие поля, если нужны
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
