import { z } from 'zod';
import { GRADES, ITEM_TYPES } from '../constants/itemValues';

export const addItemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  grade: z.enum(GRADES, 'Select a grade'),
  type: z.enum(ITEM_TYPES, 'Select a type'),
  enchant: z.coerce.number().min(0, { message: 'Min 0' }).max(25, { message: 'Max 25' }).default(0),
});

export type AddItemSchema = z.infer<typeof addItemSchema>;
