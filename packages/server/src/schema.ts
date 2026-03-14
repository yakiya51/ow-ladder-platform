import { OW_MAPS, OW_TEAM_COLORS } from "@ow/shared";
import { relations, sql } from "drizzle-orm";
import {
  mysqlTable,
  timestamp as _timestamp,
  varchar,
  mysqlEnum,
  boolean,
  int,
  decimal,
  uniqueIndex,
  datetime,
} from "drizzle-orm/mysql-core";

// Shared
const uuid = () => varchar({ length: 36 });
const timestamp = () => _timestamp({ fsp: 4 });
const UTC_NOW = sql`(UTC_TIMESTAMP())`;

// Schemas
export const userTable = mysqlTable("user", {
  id: uuid().primaryKey().notNull(),
  battleNetAccountId: varchar({ length: 100 }).unique().notNull(),
  battleTag: varchar({ length: 50 }).unique().notNull(),
  createdAt: timestamp().default(UTC_NOW),
});

export const sessionTable = mysqlTable("session", {
  id: varchar({ length: 255 }).primaryKey(),
  userId: varchar({ length: 36 })
    .notNull()
    .references(() => userTable.id),

  // Since this value is only used server-side
  // we don't need to use string mode.
  // Also we use datetime instead of timestamp since
  // we can ignore timezones.
  expiresAt: datetime().notNull(),
});

export const sessionTableRelations = relations(sessionTable, ({ one }) => ({
  user: one(userTable, {
    fields: [sessionTable.userId],
    references: [userTable.id],
  }),
}));

export type SessionTable = typeof sessionTable.$inferInsert;

export const playerTable = mysqlTable(
  "player",
  {
    userId: uuid()
      .notNull()
      .references(() => userTable.id),
    matchId: uuid()
      .notNull()
      .references(() => matchTable.id),
    team: mysqlEnum(OW_TEAM_COLORS),
    isCaptain: boolean().default(false),
  },
  (table) => [
    uniqueIndex("user_id_match_id_idx").on(table.userId, table.matchId),
  ],
);

export const playerTableRelations = relations(playerTable, ({ one }) => ({
  user: one(userTable, {
    fields: [playerTable.userId],
    references: [userTable.id],
  }),
}));

export const matchResult = mysqlTable(
  "match_result",
  {
    matchId: uuid()
      .notNull()
      .references(() => matchTable.id),
    team: mysqlEnum(OW_TEAM_COLORS),
    primaryScore: int(),
    secondaryScore: decimal(),
  },
  (table) => [uniqueIndex("match_id_team_color").on(table.matchId, table.team)],
);

export const matchTable = mysqlTable("match", {
  id: uuid().primaryKey().notNull(),
  map: mysqlEnum(OW_MAPS),
  createdAt: timestamp().default(UTC_NOW),
  startedAt: timestamp(),
  endedAt: timestamp(),
});

export const matchTableRelations = relations(matchTable, ({ one, many }) => ({
  results: many(matchResult),
  players: many(playerTable),
}));
