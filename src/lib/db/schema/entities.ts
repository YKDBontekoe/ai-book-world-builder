import type { InferSelectModel } from "drizzle-orm";
import {
	pgTable,
	text,
	timestamp,
	uniqueIndex,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

import { project } from "@/lib/db/schema/projects";

export const entity = pgTable(
	"Entity",
	{
		id: uuid("id").primaryKey().notNull().defaultRandom(),
		createdAt: timestamp("createdAt").notNull(),
		updatedAt: timestamp("updatedAt").notNull(),
		name: text("name").notNull(),
		kind: varchar("kind", { length: 48 }).notNull(),
		summary: text("summary"),
		startDate: timestamp("startDate"),
		endDate: timestamp("endDate"),
		projectId: uuid("projectId")
			.notNull()
			.references(() => project.id),
	},
	(table) => ({
		nameByProjectIdx: uniqueIndex("entity_name_project_idx").on(
			table.projectId,
			table.name,
		),
	}),
);

export type Entity = InferSelectModel<typeof entity>;

export const entityAttribute = pgTable(
	"EntityAttribute",
	{
		id: uuid("id").primaryKey().notNull().defaultRandom(),
		createdAt: timestamp("createdAt").notNull(),
		name: text("name").notNull(),
		value: text("value").notNull(),
		dataType: varchar("dataType", { length: 48 }).notNull(),
		startDate: timestamp("startDate"),
		endDate: timestamp("endDate"),
		entityId: uuid("entityId")
			.notNull()
			.references(() => entity.id),
		projectId: uuid("projectId")
			.notNull()
			.references(() => project.id),
	},
	(table) => ({
		attributeNameIdx: uniqueIndex("entity_attribute_name_idx").on(
			table.entityId,
			table.name,
		),
	}),
);

export type EntityAttribute = InferSelectModel<typeof entityAttribute>;

export const relationship = pgTable(
	"Relationship",
	{
		id: uuid("id").primaryKey().notNull().defaultRandom(),
		createdAt: timestamp("createdAt").notNull(),
		type: varchar("type", { length: 64 }).notNull(),
		description: text("description"),
		startDate: timestamp("startDate"),
		endDate: timestamp("endDate"),
		projectId: uuid("projectId")
			.notNull()
			.references(() => project.id),
		sourceEntityId: uuid("sourceEntityId")
			.notNull()
			.references(() => entity.id),
		targetEntityId: uuid("targetEntityId")
			.notNull()
			.references(() => entity.id),
	},
	(table) => ({
		relationshipUniqIdx: uniqueIndex("relationship_unique_idx").on(
			table.projectId,
			table.sourceEntityId,
			table.targetEntityId,
			table.type,
		),
	}),
);

export type Relationship = InferSelectModel<typeof relationship>;
