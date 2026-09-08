import { z } from 'zod';
import { GRADES, ITEM_TYPES } from '../constants';

export const addItemSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  grade: z.enum(GRADES, 'Select a grade'),
  type: z.enum(ITEM_TYPES, 'Select a type'),
  enchant: z.coerce.number().min(0, { message: 'Min 0' }).max(25, { message: 'Max 25' }).default(0),
  ownerUserId: z.coerce.number().positive().nullable().optional(),
  assignedId: z.coerce.number().positive().nullable().optional(),
  holderId: z.coerce.number().positive().nullable().optional(),
});

export type AddItemSchema = z.infer<typeof addItemSchema>;
