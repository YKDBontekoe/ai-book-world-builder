import type { InferSelectModel } from "drizzle-orm";
import {
	index,
	integer,
	sqliteTable,
	text,
	uniqueIndex,
} from "drizzle-orm/sqlite-core";

import { user } from "@/lib/db/schema/sqlite/auth";
import { chapter, outline } from "@/lib/db/schema/sqlite/outlines";
import { project } from "@/lib/db/schema/sqlite/projects";
import type { AppUsage } from "@/lib/usage";

export const generationStatus = [
	"idle",
	"running",
	"paused",
	"completed",
	"failed",
] as const;
export type GenerationStatus = (typeof generationStatus)[number];

export type CanvasState = {
	activePane:
		| "outline"
		| "scenes"
		| "draft"
		| "diagnostics"
		| "bible"
		| "changes";
	paneState: Record<string, unknown>;
	lastUpdated: string;
};

export type TaskLogEntry = {
	id: string;
	timestamp: string;
	type: "orchestrator" | "tool_call" | "tool_result";
	modelId: string;
	content: string;
	metadata?: Record<string, unknown>;
};

export type GenerationTaskLog = TaskLogEntry[];

export const bookGeneration = sqliteTable(
	"BookGeneration",
	{
		id: text("id").primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
		createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
		updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
		status: text("status").notNull().default("idle"),
		settings: text("settings", { mode: "json" }).$type<Record<string, unknown>>(),
		canvasState: text("canvasState", { mode: "json" })
			.$type<CanvasState | null>()
			.default(null),
		taskLog: text("taskLog", { mode: "json" })
			.$type<GenerationTaskLog | null>()
			.default(null),
		error: text("error"),
		pausedAt: integer("pausedAt", { mode: "timestamp" }),
		currentStepId: text("currentStepId"),
		totalSteps: integer("totalSteps"),
		completedSteps: integer("completedSteps").default(0),
		estimatedCost: text("estimatedCost", { mode: "json" }).$type<{
			inputTokens: number;
			outputTokens: number;
			estimatedUsd: number;
		} | null>(),
		startedAt: integer("startedAt", { mode: "timestamp" }),
		completedAt: integer("completedAt", { mode: "timestamp" }),
		outlineId: text("outlineId").references(() => outline.id),
		templateId: text("templateId"),
		projectId: text("projectId")
			.notNull()
			.references(() => project.id),
	},
	(table) => ({
		projectIdx: uniqueIndex("book_generation_project_idx").on(table.projectId),
	}),
);

export type BookGeneration = InferSelectModel<typeof bookGeneration>;

export type StoryStateData = {
	characterKnowledge?: Record<string, string[]>;
	characterInjuries?: Record<string, string[]>;
	relationshipChanges?: Array<{
		source: string;
		target: string;
		change: string;
	}>;
	openThreads?: string[];
	revealsMade?: string[];
	worldStateChanges?: string[];
};

export const storyState = sqliteTable(
	"StoryState",
	{
		id: text("id").primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
		createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
		updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
		chapterNumber: integer("chapterNumber").notNull(),
		characterKnowledge: text("characterKnowledge", { mode: "json" })
			.$type<Record<string, string[]> | null>()
			.default(null),
		characterInjuries: text("characterInjuries", { mode: "json" })
			.$type<Record<string, string[]> | null>()
			.default(null),
		relationshipChanges: text("relationshipChanges", { mode: "json" })
			.$type<Array<{ source: string; target: string; change: string }> | null>()
			.default(null),
		openThreads: text("openThreads", { mode: "json" })
			.$type<string[] | null>()
			.default(null),
		revealsMade: text("revealsMade", { mode: "json" })
			.$type<string[] | null>()
			.default(null),
		worldStateChanges: text("worldStateChanges", { mode: "json" })
			.$type<string[] | null>()
			.default(null),
		generationId: text("generationId")
			.notNull()
			.references(() => bookGeneration.id),
		projectId: text("projectId")
			.notNull()
			.references(() => project.id),
	},
	(table) => ({
		generationIdx: index("story_state_generation_idx").on(table.generationId),
		chapterIdx: uniqueIndex("story_state_chapter_idx").on(
			table.generationId,
			table.chapterNumber,
		),
	}),
);

export type StoryState = InferSelectModel<typeof storyState>;

export const bookExportFormat = ["pdf", "epub"] as const;
export type BookExportFormat = (typeof bookExportFormat)[number];

export const bookExportStatus = ["pending", "completed", "failed"] as const;
export type BookExportStatus = (typeof bookExportStatus)[number];

export const bookExport = sqliteTable(
	"BookExport",
	{
		id: text("id").primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
		createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
		projectId: text("projectId")
			.notNull()
			.references(() => project.id),
		blobUrl: text("blobUrl"),
		format: text("format", { enum: bookExportFormat }).notNull(),
		status: text("status", { enum: bookExportStatus })
			.notNull()
			.default("pending"),
		error: text("error"),
		userId: text("userId")
			.notNull()
			.references(() => user.id),
	},
	(table) => ({
		projectIdx: index("book_export_project_idx").on(table.projectId),
		userIdx: index("book_export_user_idx").on(table.userId),
	}),
);

export type BookExport = InferSelectModel<typeof bookExport>;

export type ContextSelection = {
	entities: { id: string; name: string; kind: string; included: boolean }[];
	outlines: { id: string; title: string; included: boolean }[];
	scenes: { id: string; title: string; chapterId: string; included: boolean }[];
	drafts: { id: string; chapterTitle: string; included: boolean }[];
	sourceMaterials: { id: string; filename: string; included: boolean }[];
};

export const writingStylePresets = [
	{ id: "hemingway", name: "Hemingway", description: "Sparse, direct prose" },
	{
		id: "tolkien",
		name: "Tolkien",
		description: "Rich, descriptive worldbuilding",
	},
	{
		id: "king",
		name: "Stephen King",
		description: "Suspenseful, character-driven",
	},
	{ id: "rowling", name: "J.K. Rowling", description: "Whimsical, accessible" },
	{
		id: "sanderson",
		name: "Sanderson",
		description: "Systematic magic, epic scope",
	},
	{ id: "custom", name: "Custom", description: "Define your own style" },
] as const;

export type WritingStylePreset = (typeof writingStylePresets)[number]["id"];

export type GenerationSettings = {
	contextSelection: ContextSelection;
	totalChapters: number;
	pagesPerChapter: number;
	writingStylePreset: WritingStylePreset;
	customStyleDescription?: string;
	authorInspirations?: string[];
	writerModelId: string;
	reviewerModelId: string;
	revisionRounds: number;
	chapterDependencies?: Record<string, string[]>;
	includePrologue: boolean;
	includeEpilogue: boolean;
	generateBackCoverBlurb: boolean;
	generateFrontCover: boolean;
	generateCharacterSheets: boolean;
	generateChapterSummaries: boolean;
	generateTableOfContents: boolean;
	runConsistencyCheck: boolean;
	bookTitle?: string;
	bookSubtitle?: string;
	authorName?: string;
	genre?: string;
	targetAudience?: string;
};

export const generationStepStatus = [
	"pending",
	"running",
	"paused",
	"completed",
	"failed",
	"skipped",
] as const;
export type GenerationStepStatus = (typeof generationStepStatus)[number];

export const generationStepType = [
	"prologue",
	"chapter_writing",
	"chapter_reviewing",
	"chapter_revision",
	"epilogue",
	"back_cover",
	"front_cover",
	"character_sheet",
	"chapter_summary",
	"toc",
	"consistency_check",
] as const;
export type GenerationStepType = (typeof generationStepType)[number];

export const bookGenerationStep = sqliteTable(
	"BookGenerationStep",
	{
		id: text("id").primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
		generationId: text("generationId")
			.notNull()
			.references(() => bookGeneration.id),
		chapterId: text("chapterId").references(() => chapter.id),
		sequence: integer("sequence").notNull(),
		stepType: text("stepType").notNull(),
		status: text("status").notNull().default("pending"),
		revisionRound: integer("revisionRound").default(1),
		agentOutput: text("agentOutput"),
		reviewFeedback: text("reviewFeedback"),
		wordCount: integer("wordCount"),
		tokenCount: integer("tokenCount"),
		usage: text("usage", { mode: "json" }).$type<AppUsage>(),
		startedAt: integer("startedAt", { mode: "timestamp" }),
		completedAt: integer("completedAt", { mode: "timestamp" }),
		createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
		updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
	},
	(table) => ({
		generationIdx: index("book_generation_step_generation_idx").on(
			table.generationId,
		),
		sequenceIdx: index("book_generation_step_sequence_idx").on(
			table.generationId,
			table.sequence,
		),
	}),
);

export type BookGenerationStep = InferSelectModel<typeof bookGenerationStep>;

export const generationAssetType = [
	"front_cover",
	"back_cover_blurb",
	"prologue",
	"epilogue",
	"character_sheet",
	"chapter_summary",
	"table_of_contents",
	"consistency_report",
] as const;
export type GenerationAssetType = (typeof generationAssetType)[number];

export const bookGenerationAsset = sqliteTable(
	"BookGenerationAsset",
	{
		id: text("id").primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
		generationId: text("generationId")
			.notNull()
			.references(() => bookGeneration.id),
		assetType: text("assetType").notNull(),
		content: text("content"),
		imageUrl: text("imageUrl"),
		metadata: text("metadata", { mode: "json" }).$type<Record<string, unknown>>(),
		createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
		updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
	},
	(table) => ({
		generationIdx: index("book_generation_asset_generation_idx").on(
			table.generationId,
		),
		typeIdx: index("book_generation_asset_type_idx").on(
			table.generationId,
			table.assetType,
		),
	}),
);

export type BookGenerationAsset = InferSelectModel<typeof bookGenerationAsset>;

export const generationTemplate = sqliteTable(
	"GenerationTemplate",
	{
		id: text("id").primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
		name: text("name").notNull(),
		description: text("description"),
		settings: text("settings", { mode: "json" })
			.$type<Partial<GenerationSettings>>()
			.notNull(),
		isBuiltIn: integer("isBuiltIn", { mode: "boolean" })
			.notNull()
			.default(false),
		userId: text("userId").references(() => user.id),
		createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
		updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
	},
	(table) => ({
		userIdx: index("generation_template_user_idx").on(table.userId),
	}),
);

export type GenerationTemplate = InferSelectModel<typeof generationTemplate>;

export const chapterVersion = sqliteTable(
	"ChapterVersion",
	{
		id: text("id").primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
		chapterId: text("chapterId")
			.notNull()
			.references(() => chapter.id),
		generationId: text("generationId").references(() => bookGeneration.id),
		content: text("content").notNull(),
		wordCount: integer("wordCount"),
		version: integer("version").notNull(),
		createdBy: text("createdBy").default("ai"),
		createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
	},
	(table) => ({
		chapterIdx: index("chapter_version_chapter_idx").on(table.chapterId),
		versionIdx: index("chapter_version_version_idx").on(
			table.chapterId,
			table.version,
		),
	}),
);

export type ChapterVersion = InferSelectModel<typeof chapterVersion>;

export const generationNote = sqliteTable(
	"GenerationNote",
	{
		id: text("id").primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
		generationId: text("generationId")
			.notNull()
			.references(() => bookGeneration.id),
		chapterId: text("chapterId").references(() => chapter.id),
		content: text("content").notNull(),
		isGlobal: integer("isGlobal", { mode: "boolean" })
			.notNull()
			.default(false),
		appliedAt: integer("appliedAt", { mode: "timestamp" }),
		createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
	},
	(table) => ({
		generationIdx: index("generation_note_generation_idx").on(
			table.generationId,
		),
		chapterIdx: index("generation_note_chapter_idx").on(table.chapterId),
	}),
);

export type GenerationNote = InferSelectModel<typeof generationNote>;
