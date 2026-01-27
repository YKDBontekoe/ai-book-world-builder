import { jsonb, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const factoryTycoonSaves = pgTable("factory_tycoon_saves", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	state: jsonb("state").notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});
