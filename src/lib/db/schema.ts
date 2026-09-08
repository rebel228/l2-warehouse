import { defineRelations } from 'drizzle-orm';
import { index, integer, jsonb, pgEnum, snakeCase, timestamp, varchar } from 'drizzle-orm/pg-core';
import { GRADES } from '../constants';

// ==============================================
// TABLES (camelCase keys → snake_case columns)
// ==============================================

export const userRole = pgEnum('userRole', ['member', 'admin', 'superadmin']);
export const itemStatus = pgEnum('itemStatus', ['in_bank', 'assigned', 'held']);
export const itemGrade = pgEnum('item_grade', GRADES);
export const itemEventType = pgEnum('itemEventType', [
  'item_created',
  'item_deleted',
  'owner_change',
  'reassignment',
  'transfer',
]);
export type ItemEventSnapshot = {
  name: string;
  type: string;
  grade: string;
  enchantLevel: number;
  imageUrl: string | null;
  status: string;

  ownerUserId: number | null;
  ownerName: string | null;
  ownerClanId: number | null;

  assignedId: number | null;
  assignedName: string | null;

  holderId: number | null;
  holderName: string | null;
};

export type ItemEventSnapshotRelations = {
  ownerName: string | null;
  assignedName: string | null;
  holderName: string | null;
};

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
    grade: itemGrade().default('D').notNull(),
    enchantLevel: integer().default(0).notNull(),
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

export const itemEvents = snakeCase.table(
  'item_events',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),

    itemId: integer().notNull(),

    type: itemEventType().notNull(),

    fromOwnerUserId: integer().references(() => users.id),
    fromOwnerName: varchar({ length: 255 }),

    toOwnerUserId: integer().references(() => users.id),
    toOwnerName: varchar({ length: 255 }),

    fromAssignedId: integer(),
    fromAssignedName: varchar({ length: 255 }),

    toAssignedId: integer(),
    toAssignedName: varchar({ length: 255 }),

    fromHolderId: integer(),
    fromHolderName: varchar({ length: 255 }),

    toHolderId: integer(),
    toHolderName: varchar({ length: 255 }),

    changedByUserId: integer()
      .notNull()
      .references(() => users.id),

    snapshot: jsonb().$type<ItemEventSnapshot>().notNull(),

    createdAt: timestamp().defaultNow().notNull(),
  },
  (table) => [
    index('item_events_item_id_idx').on(table.itemId),
    index('item_events_created_at_id_idx').on(table.createdAt, table.id),
  ]
);

export const schema = {
  users,
  clans,
  characters,
  items,
  transfers,
  reassignments,
  itemEvents,
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
    itemEventsChangedBy: r.many.itemEvents({
      from: r.users.id,
      to: r.itemEvents.changedByUserId,
      alias: 'itemEventsChangedBy',
    }),
    itemEventsFromOwner: r.many.itemEvents({
      from: r.users.id,
      to: r.itemEvents.fromOwnerUserId,
      alias: 'itemEventsFromOwner',
    }),
    itemEventsToOwner: r.many.itemEvents({
      from: r.users.id,
      to: r.itemEvents.toOwnerUserId,
      alias: 'itemEventsToOwner',
    }),
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
    itemEventsFromAssigned: r.many.itemEvents({
      from: r.characters.id,
      to: r.itemEvents.fromAssignedId,
      alias: 'itemEventsFromAssigned',
    }),
    itemEventsToAssigned: r.many.itemEvents({
      from: r.characters.id,
      to: r.itemEvents.toAssignedId,
      alias: 'itemEventsToAssigned',
    }),
    itemEventsFromHolder: r.many.itemEvents({
      from: r.characters.id,
      to: r.itemEvents.fromHolderId,
      alias: 'itemEventsFromHolder',
    }),
    itemEventsToHolder: r.many.itemEvents({
      from: r.characters.id,
      to: r.itemEvents.toHolderId,
      alias: 'itemEventsToHolder',
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
    itemEvents: r.many.itemEvents(),
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
  itemEvents: {
    item: r.one.items({
      from: r.itemEvents.itemId,
      to: r.items.id,
    }),
    changedByUser: r.one.users({
      from: r.itemEvents.changedByUserId,
      to: r.users.id,
      optional: false,
    }),
    fromOwner: r.one.users({
      from: r.itemEvents.fromOwnerUserId,
      to: r.users.id,
      alias: 'itemEventsFromOwner',
    }),
    toOwner: r.one.users({
      from: r.itemEvents.toOwnerUserId,
      to: r.users.id,
      alias: 'itemEventsToOwner',
    }),
    fromAssigned: r.one.characters({
      from: r.itemEvents.fromAssignedId,
      to: r.characters.id,
      alias: 'itemEventsFromAssigned',
    }),
    toAssigned: r.one.characters({
      from: r.itemEvents.toAssignedId,
      to: r.characters.id,
      alias: 'itemEventsToAssigned',
    }),
    fromHolder: r.one.characters({
      from: r.itemEvents.fromHolderId,
      to: r.characters.id,
      alias: 'itemEventsFromHolder',
    }),

    toHolder: r.one.characters({
      from: r.itemEvents.toHolderId,
      to: r.characters.id,
      alias: 'itemEventsToHolder',
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

export type ItemEvent = typeof itemEvents.$inferSelect;
export type NewItemEvent = typeof itemEvents.$inferInsert;
