import { z } from 'zod';
import { CHARACTER_CLASSES } from '../constants';

export const addCharacterSchema = z.object({
  name: z.string().trim().min(1, 'Character name is required'),
  class: z.enum(CHARACTER_CLASSES, 'Select a class'),
  userId: z.coerce.number().positive('Please select a valid user'),
});

export type AddCharacterSchema = z.infer<typeof addCharacterSchema>;
