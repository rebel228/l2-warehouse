import { pgEnum } from 'drizzle-orm/pg-core';

export const userRole = pgEnum('user_role', ['member', 'admin', 'superadmin']);
export const itemStatus = pgEnum('item_status', ['in_bank', 'assigned', 'held']);
