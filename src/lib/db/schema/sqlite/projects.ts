import type { InferSelectModel } from "drizzle-orm";
import {
	foreignKey,
	index,
	integer,
	primaryKey,
	sqliteTable,
	text,
} from "drizzle-orm/sqlite-core";

import { user } from "@/lib/db/schema/sqlite/auth";

export type ProjectFolder = {
	id: string;
	name: string;
	slug: string;
	description: string;
};

export const project = sqliteTable(
	"Project",
	{
		id: text("id").primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
		createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
		name: text("name").notNull(),
		description: text("description"),
		visibility: text("visibility", { enum: ["public", "private"] })
			.notNull()
			.default("private"),
		folders: text("folders", { mode: "json" })
			.$type<ProjectFolder[]>()
			.notNull(),
		userId: text("userId")
			.notNull()
			.references(() => user.id),
		forkedFromId: text("forkedFromId"),
		lastViewedSceneId: text("lastViewedSceneId"),
	},
	(table) => ({
		forkedFromFk: foreignKey({
			columns: [table.forkedFromId],
			foreignColumns: [table.id],
		}),
		userIdx: index("project_user_idx").on(table.userId),
	}),
);

export type Project = InferSelectModel<typeof project>;

export const document = sqliteTable(
	"Document",
	{
		id: text("id").notNull().$defaultFn(() => crypto.randomUUID()),
		createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
		title: text("title").notNull(),
		content: text("content"),
		kind: text("text", { enum: ["text", "code", "image", "sheet"] })
			.notNull()
			.default("text"),
		userId: text("userId")
			.notNull()
			.references(() => user.id),
	},
	(table) => {
		return {
			pk: primaryKey({ columns: [table.id, table.createdAt] }),
			userIdx: index("document_user_idx").on(table.userId),
		};
	},
);

export type Document = InferSelectModel<typeof document>;

export const suggestion = sqliteTable(
	"Suggestion",
	{
		id: text("id").notNull().$defaultFn(() => crypto.randomUUID()),
		documentId: text("documentId").notNull(),
		documentCreatedAt: integer("documentCreatedAt", { mode: "timestamp" })
			.notNull(),
		originalText: text("originalText").notNull(),
		suggestedText: text("suggestedText").notNull(),
		description: text("description"),
		isResolved: integer("isResolved", { mode: "boolean" })
			.notNull()
			.default(false),
		userId: text("userId")
			.notNull()
			.references(() => user.id),
		createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
	},
	(table) => ({
		pk: primaryKey({ columns: [table.id] }),
		documentRef: foreignKey({
			columns: [table.documentId, table.documentCreatedAt],
			foreignColumns: [document.id, document.createdAt],
		}),
	}),
);

export type Suggestion = InferSelectModel<typeof suggestion>;
