import type { InferSelectModel } from "drizzle-orm";
import {
	integer,
	sqliteTable,
	text,
	uniqueIndex,
} from "drizzle-orm/sqlite-core";

import { project } from "@/lib/db/schema/sqlite/projects";

export const outline = sqliteTable("Outline", {
	id: text("id")
		.primaryKey()
		.notNull()
		.$defaultFn(() => crypto.randomUUID()),
	createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
	title: text("title").notNull(),
	summary: text("summary"),
	pov: text("pov").notNull(),
	tone: text("tone").notNull(),
	pacing: text("pacing").notNull(),
	beats: text("beats", { mode: "json" }).$type<string[] | null>(),
	projectId: text("projectId")
		.notNull()
		.references(() => project.id),
});

export type Outline = InferSelectModel<typeof outline>;

export const volume = sqliteTable("Volume", {
	id: text("id")
		.primaryKey()
		.notNull()
		.$defaultFn(() => crypto.randomUUID()),
	createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
	title: text("title").notNull(),
	summary: text("summary"),
	outlineId: text("outlineId")
		.notNull()
		.references(() => outline.id),
	projectId: text("projectId")
		.notNull()
		.references(() => project.id),
});

export type Volume = InferSelectModel<typeof volume>;

export const chapter = sqliteTable(
	"Chapter",
	{
		id: text("id")
			.primaryKey()
			.notNull()
			.$defaultFn(() => crypto.randomUUID()),
		createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
		updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
		title: text("title").notNull(),
		notes: text("notes"),
		status: text("status").notNull().default("planned"),
		sequence: integer("sequence").notNull(),
		outlineId: text("outlineId")
			.notNull()
			.references(() => outline.id),
		volumeId: text("volumeId")
			.notNull()
			.references(() => volume.id),
		projectId: text("projectId")
			.notNull()
			.references(() => project.id),
	},
	(table) => ({
		chapterSequenceIdx: uniqueIndex("chapter_sequence_volume_idx").on(
			table.volumeId,
			table.sequence,
		),
	}),
);

export type Chapter = InferSelectModel<typeof chapter>;

export const chapterDraft = sqliteTable("ChapterDraft", {
	id: text("id")
		.primaryKey()
		.notNull()
		.$defaultFn(() => crypto.randomUUID()),
	createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
	content: text("content").notNull(),
	chapterId: text("chapterId")
		.notNull()
		.references(() => chapter.id),
	volumeId: text("volumeId")
		.notNull()
		.references(() => volume.id),
	outlineId: text("outlineId")
		.notNull()
		.references(() => outline.id),
	projectId: text("projectId")
		.notNull()
		.references(() => project.id),
});

export type ChapterDraft = InferSelectModel<typeof chapterDraft>;
