import type { InferSelectModel } from "drizzle-orm";
import {
	index,
	integer,
	sqliteTable,
	text,
	uniqueIndex,
} from "drizzle-orm/sqlite-core";

import { user } from "@/lib/db/schema/sqlite/auth";
import { project } from "@/lib/db/schema/sqlite/projects";

export const sourceMaterialStatus = [
	"pending",
	"uploaded",
	"processing",
	"processed",
	"failed",
] as const;
export type SourceMaterialStatus = (typeof sourceMaterialStatus)[number];

export const sourceMaterial = sqliteTable(
	"SourceMaterial",
	{
		id: text("id").primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
		createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
		updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
		filename: text("filename").notNull(),
		mimeType: text("mimeType").notNull(),
		size: integer("size").notNull(),
		status: text("status", { enum: sourceMaterialStatus })
			.notNull()
			.default("pending"),
		blobUrl: text("blobUrl"),
		projectId: text("projectId")
			.notNull()
			.references(() => project.id),
		userId: text("userId")
			.notNull()
			.references(() => user.id),
	},
	(table) => ({
		projectIdx: index("source_material_project_idx").on(table.projectId),
		userIdx: index("source_material_user_idx").on(table.userId),
	}),
);

export type SourceMaterial = InferSelectModel<typeof sourceMaterial>;

export const sourceMaterialProcessing = sqliteTable(
	"SourceMaterialProcessing",
	{
		id: text("id").primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
		createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
		updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
		status: text("status", { enum: sourceMaterialStatus })
			.notNull()
			.default("pending"),
		attempts: integer("attempts").notNull().default(0),
		nextAttemptAt: integer("nextAttemptAt", { mode: "timestamp" }).notNull(),
		lastError: text("lastError"),
		startedAt: integer("startedAt", { mode: "timestamp" }),
		completedAt: integer("completedAt", { mode: "timestamp" }),
		bytesProcessed: integer("bytesProcessed").notNull().default(0),
		chapters: integer("chapters").notNull().default(0),
		chunks: integer("chunks").notNull().default(0),
		normalizedCharacters: integer("normalizedCharacters").notNull().default(0),
		durationMs: integer("durationMs").notNull().default(0),
		metadata: text("metadata", { mode: "json" }),
		sourceMaterialId: text("sourceMaterialId")
			.notNull()
			.references(() => sourceMaterial.id),
		projectId: text("projectId")
			.notNull()
			.references(() => project.id),
		userId: text("userId")
			.notNull()
			.references(() => user.id),
	},
	(table) => ({
		sourceMaterialIdx: uniqueIndex(
			"source_material_processing_material_idx",
		).on(table.sourceMaterialId),
		projectIdx: index("source_material_processing_project_idx").on(
			table.projectId,
		),
	}),
);

export type SourceMaterialProcessing = InferSelectModel<
	typeof sourceMaterialProcessing
>;

export type NewSourceMaterialChapter = {
	id: string;
	title: string;
	sequence: number;
	headings: string[];
	metadata?: Record<string, unknown>;
};

export const sourceMaterialChapter = sqliteTable(
	"SourceMaterialChapter",
	{
		id: text("id").primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
		createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
		updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
		title: text("title").notNull(),
		sequence: integer("sequence").notNull(),
		headings: text("headings", { mode: "json" }).notNull(),
		metadata: text("metadata", { mode: "json" }),
		sourceMaterialId: text("sourceMaterialId")
			.notNull()
			.references(() => sourceMaterial.id),
		projectId: text("projectId")
			.notNull()
			.references(() => project.id),
		userId: text("userId")
			.notNull()
			.references(() => user.id),
	},
	(table) => ({
		sourceMaterialIdx: index("source_material_chapter_material_idx").on(
			table.sourceMaterialId,
		),
		projectIdx: index("source_material_chapter_project_idx").on(
			table.projectId,
		),
	}),
);

export type SourceMaterialChapter = InferSelectModel<
	typeof sourceMaterialChapter
>;

export const sourceMaterialChunk = sqliteTable(
	"SourceMaterialChunk",
	{
		id: text("id").primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
		createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
		updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
		sequence: integer("sequence").notNull(),
		text: text("text").notNull(),
		metadata: text("metadata", { mode: "json" }),
		chapterId: text("chapterId")
			.notNull()
			.references(() => sourceMaterialChapter.id),
		sourceMaterialId: text("sourceMaterialId")
			.notNull()
			.references(() => sourceMaterial.id),
		projectId: text("projectId")
			.notNull()
			.references(() => project.id),
		userId: text("userId")
			.notNull()
			.references(() => user.id),
	},
	(table) => ({
		chapterIdx: index("source_material_chunk_chapter_idx").on(table.chapterId),
		projectIdx: index("source_material_chunk_project_idx").on(table.projectId),
	}),
);

export type SourceMaterialChunk = InferSelectModel<typeof sourceMaterialChunk>;

export type NewSourceMaterialChunk = {
	id: string;
	chapterId: string;
	sequence: number;
	text: string;
	metadata?: Record<string, unknown>;
};
