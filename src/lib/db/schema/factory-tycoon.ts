import { pgTable, jsonb, timestamp, uuid, index } from "drizzle-orm/pg-core";
import { user } from "./auth";
import type { GameState } from "@/features/factory-tycoon/types";

export const factoryTycoonSaves = pgTable("factory_tycoon_saves", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  state: jsonb("state").$type<GameState>().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
    userIdIndex: index("idx_factory_tycoon_saves_user_id").on(table.userId),
}));
