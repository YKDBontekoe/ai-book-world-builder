import type { InferSelectModel } from "drizzle-orm";
import {
	integer,
	sqliteTable,
	text,
	uniqueIndex,
} from "drizzle-orm/sqlite-core";

import { project } from "@/lib/db/schema/sqlite/projects";

export const entity = sqliteTable(
	"Entity",
	{
		id: text("id")
			.primaryKey()
			.notNull()
			.$defaultFn(() => crypto.randomUUID()),
		createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
		updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
		name: text("name").notNull(),
		kind: text("kind").notNull(),
		summary: text("summary"),
		startDate: integer("startDate", { mode: "timestamp" }),
		endDate: integer("endDate", { mode: "timestamp" }),
		projectId: text("projectId")
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

export const entityAttribute = sqliteTable(
	"EntityAttribute",
	{
		id: text("id")
			.primaryKey()
			.notNull()
			.$defaultFn(() => crypto.randomUUID()),
		createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
		name: text("name").notNull(),
		value: text("value").notNull(),
		dataType: text("dataType").notNull(),
		startDate: integer("startDate", { mode: "timestamp" }),
		endDate: integer("endDate", { mode: "timestamp" }),
		entityId: text("entityId")
			.notNull()
			.references(() => entity.id),
		projectId: text("projectId")
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

export const relationship = sqliteTable(
	"Relationship",
	{
		id: text("id")
			.primaryKey()
			.notNull()
			.$defaultFn(() => crypto.randomUUID()),
		createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
		type: text("type").notNull(),
		description: text("description"),
		startDate: integer("startDate", { mode: "timestamp" }),
		endDate: integer("endDate", { mode: "timestamp" }),
		projectId: text("projectId")
			.notNull()
			.references(() => project.id),
		sourceEntityId: text("sourceEntityId")
			.notNull()
			.references(() => entity.id),
		targetEntityId: text("targetEntityId")
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
