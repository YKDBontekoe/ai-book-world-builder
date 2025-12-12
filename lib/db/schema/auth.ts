import type { InferSelectModel } from "drizzle-orm";
import { index, jsonb, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const user = pgTable("User", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  email: varchar("email", { length: 64 }).notNull(),
  password: varchar("password", { length: 64 }),
});

export type User = InferSelectModel<typeof user>;

export const userPreferences = pgTable(
  "UserPreferences",
  {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    userId: uuid("userId")
      .notNull()
      .references(() => user.id)
      .unique(),
    favoriteModels: jsonb("favoriteModels")
      .$type<string[]>()
      .notNull()
      .default([]),
    recentModels: jsonb("recentModels").$type<string[]>().notNull().default([]),
    createdAt: timestamp("createdAt").notNull(),
    updatedAt: timestamp("updatedAt").notNull(),
  },
  (table) => ({
    userIdx: index("user_preferences_user_idx").on(table.userId),
  })
);

export type UserPreferences = InferSelectModel<typeof userPreferences>;
