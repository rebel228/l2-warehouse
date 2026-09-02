import { defineRelations } from 'drizzle-orm';
import { index, integer, snakeCase, timestamp, varchar } from 'drizzle-orm/pg-core';
import { userRole, itemStatus } from './enums';

// ==============================================
// TABLES (camelCase keys → snake_case columns)
// ==============================================

export const users = snakeCase.table('users', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  username: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  role: userRole().default('member').notNull(),
  createdAt: timestamp().defaultNow().notNull(),
});

export const clans = snakeCase.table('clans', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull().unique(),
  createdAt: timestamp().defaultNow().notNull(),
});

export const characters = snakeCase.table(
  'characters',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 255 }).notNull(),
    class: varchar({ length: 255 }).notNull(),
    userId: integer()
      .notNull()
      .references(() => users.id),
    clanId: integer().references(() => clans.id),
    createdAt: timestamp().defaultNow().notNull(),
  },
  (table) => [
    index('characters_user_id_idx').on(table.userId),
    index('characters_clan_id_idx').on(table.clanId),
  ]
);

export const items = snakeCase.table(
  'items',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 255 }).notNull(),
    type: varchar({ length: 255 }).notNull(),
    imageUrl: varchar({ length: 500 }),
    status: itemStatus().default('in_bank').notNull(),
    updatedAt: timestamp().defaultNow().notNull(),

    // Owner (only one of the two should be non-null)
    ownerUserId: integer().references(() => users.id),
    ownerClanId: integer().references(() => clans.id),

    assignedId: integer().references(() => characters.id),
    holderId: integer().references(() => characters.id),
  },
  (table) => [
    index('items_owner_user_id_idx').on(table.ownerUserId),
    index('items_owner_clan_id_idx').on(table.ownerClanId),
    index('items_assigned_id_idx').on(table.assignedId),
    index('items_holder_id_idx').on(table.holderId),
    index('items_status_idx').on(table.status),
  ]
);

export const transfers = snakeCase.table(
  'transfers',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    itemId: integer()
      .notNull()
      .references(() => items.id),
    fromHolderId: integer().references(() => characters.id),
    toHolderId: integer().references(() => characters.id),
    changedByUserId: integer()
      .notNull()
      .references(() => users.id),
    transferredAt: timestamp().defaultNow().notNull(),
  },
  (table) => [
    index('transfers_item_id_idx').on(table.itemId),
    index('transfers_from_holder_id_idx').on(table.fromHolderId),
    index('transfers_to_holder_id_idx').on(table.toHolderId),
  ]
);

export const reassignments = snakeCase.table(
  'reassignments',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    itemId: integer()
      .notNull()
      .references(() => items.id),
    fromAssignedId: integer().references(() => characters.id),
    toAssignedId: integer().references(() => characters.id),
    changedByUserId: integer()
      .notNull()
      .references(() => users.id),
    reassignedAt: timestamp().defaultNow().notNull(),
  },
  (table) => [
    index('reassignments_item_id_idx').on(table.itemId),
    index('reassignments_from_assigned_id_idx').on(table.fromAssignedId),
    index('reassignments_to_assigned_id_idx').on(table.toAssignedId),
  ]
);

const schema = {
  users,
  clans,
  characters,
  items,
  transfers,
  reassignments,
};

// ==============================================
// RELATIONS
// ==============================================

export const relations = defineRelations(schema, (r) => ({
  users: {
    characters: r.many.characters(),
    ownedItems: r.many.items(),
    transfers: r.many.transfers(),
    reassignments: r.many.reassignments(),
  },
  clans: {
    characters: r.many.characters(),
    items: r.many.items(),
  },
  characters: {
    user: r.one.users({
      from: r.characters.userId,
      to: r.users.id,
      optional: false,
    }),
    clan: r.one.clans({
      from: r.characters.clanId,
      to: r.clans.id,
    }),
    assignedItems: r.many.items({
      from: r.characters.id,
      to: r.items.assignedId,
      alias: 'assignedItems',
    }),
    heldItems: r.many.items({
      from: r.characters.id,
      to: r.items.holderId,
      alias: 'heldItems',
    }),
    transfersFrom: r.many.transfers({
      from: r.characters.id,
      to: r.transfers.fromHolderId,
      alias: 'transferFrom',
    }),
    transfersTo: r.many.transfers({
      from: r.characters.id,
      to: r.transfers.toHolderId,
      alias: 'transferTo',
    }),
    reassignFrom: r.many.reassignments({
      from: r.characters.id,
      to: r.reassignments.fromAssignedId,
      alias: 'reassignFrom',
    }),
    reassignTo: r.many.reassignments({
      from: r.characters.id,
      to: r.reassignments.toAssignedId,
      alias: 'reassignTo',
    }),
  },
  items: {
    ownerUser: r.one.users({
      from: r.items.ownerUserId,
      to: r.users.id,
    }),
    ownerClan: r.one.clans({
      from: r.items.ownerClanId,
      to: r.clans.id,
    }),
    assignedChar: r.one.characters({
      from: r.items.assignedId,
      to: r.characters.id,
      alias: 'assignedItems',
    }),
    holderChar: r.one.characters({
      from: r.items.holderId,
      to: r.characters.id,
      alias: 'heldItems',
    }),
    transfers: r.many.transfers(),
    reassignments: r.many.reassignments(),
  },
  transfers: {
    item: r.one.items({
      from: r.transfers.itemId,
      to: r.items.id,
      optional: false,
    }),
    fromHolder: r.one.characters({
      from: r.transfers.fromHolderId,
      to: r.characters.id,
      alias: 'transferFrom',
    }),
    toHolder: r.one.characters({
      from: r.transfers.toHolderId,
      to: r.characters.id,
      alias: 'transferTo',
    }),
    changedByUser: r.one.users({
      from: r.transfers.changedByUserId,
      to: r.users.id,
      optional: false,
    }),
  },
  reassignments: {
    item: r.one.items({
      from: r.reassignments.itemId,
      to: r.items.id,
      optional: false,
    }),
    fromAssigned: r.one.characters({
      from: r.reassignments.fromAssignedId,
      to: r.characters.id,
      alias: 'reassignFrom',
    }),
    toAssigned: r.one.characters({
      from: r.reassignments.toAssignedId,
      to: r.characters.id,
      alias: 'reassignTo',
    }),
    changedByUser: r.one.users({
      from: r.reassignments.changedByUserId,
      to: r.users.id,
      optional: false,
    }),
  },
}));

// ==============================================
// TYPES
// ==============================================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Clan = typeof clans.$inferSelect;
export type NewClan = typeof clans.$inferInsert;

export type Character = typeof characters.$inferSelect;
export type NewCharacter = typeof characters.$inferInsert;

export type Item = typeof items.$inferSelect;
export type NewItem = typeof items.$inferInsert;

export type Transfer = typeof transfers.$inferSelect;
export type NewTransfer = typeof transfers.$inferInsert;

export type Reassignment = typeof reassignments.$inferSelect;
export type NewReassignment = typeof reassignments.$inferInsert;
