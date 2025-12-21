import type { InferSelectModel } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const user = pgTable("User", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  name: text("name"),
  email: varchar("email", { length: 64 }).notNull().unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  password: varchar("password", { length: 64 }),
});

export type User = InferSelectModel<typeof user>;

export interface ModelPreferences {
  light: string | null;
  middle: string | null;
  large: string | null;
}

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
    modelPreferences: jsonb("modelPreferences")
      .$type<ModelPreferences>()
      .default({ light: null, middle: null, large: null }),
    createdAt: timestamp("createdAt").notNull(),
    updatedAt: timestamp("updatedAt").notNull(),
  },
  (table) => ({
    userIdx: index("user_preferences_user_idx").on(table.userId),
  })
);

export type UserPreferences = InferSelectModel<typeof userPreferences>;
