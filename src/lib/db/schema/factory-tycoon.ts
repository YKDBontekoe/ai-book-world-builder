import { jsonb, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import type { GameState } from "../../../features/factory-tycoon/types";
import { user } from "./auth";

export const factoryTycoonSaves = pgTable("factory_tycoon_saves", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	state: jsonb("state").$type<GameState>().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});
