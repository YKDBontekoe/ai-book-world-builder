import type { InferSelectModel } from "drizzle-orm";
import {
	boolean,
	foreignKey,
	index,
	integer,
	json,
	jsonb,
	pgTable,
	primaryKey,
	text,
	timestamp,
	uniqueIndex,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import type { AppUsage } from "../usage";

export const user = pgTable("User", {
	id: uuid("id").primaryKey().notNull().defaultRandom(),
	email: varchar("email", { length: 64 }).notNull(),
	password: varchar("password", { length: 64 }),
});

export type User = InferSelectModel<typeof user>;

export const chat = pgTable("Chat", {
	id: uuid("id").primaryKey().notNull().defaultRandom(),
	createdAt: timestamp("createdAt").notNull(),
	title: text("title").notNull(),
	userId: uuid("userId")
		.notNull()
		.references(() => user.id),
	visibility: varchar("visibility", { enum: ["public", "private"] })
		.notNull()
		.default("private"),
	lastContext: jsonb("lastContext").$type<AppUsage | null>(),
});

export type Chat = InferSelectModel<typeof chat>;

// DEPRECATED: The following schema is deprecated and will be removed in the future.
// Read the migration guide at https://chat-sdk.dev/docs/migration-guides/message-parts
export const messageDeprecated = pgTable("Message", {
	id: uuid("id").primaryKey().notNull().defaultRandom(),
	chatId: uuid("chatId")
		.notNull()
		.references(() => chat.id),
	role: varchar("role").notNull(),
	content: json("content").notNull(),
	createdAt: timestamp("createdAt").notNull(),
});

export type MessageDeprecated = InferSelectModel<typeof messageDeprecated>;

export const message = pgTable("Message_v2", {
	id: uuid("id").primaryKey().notNull().defaultRandom(),
	chatId: uuid("chatId")
		.notNull()
		.references(() => chat.id),
	role: varchar("role").notNull(),
	parts: json("parts").notNull(),
	attachments: json("attachments").notNull(),
	usage: jsonb("usage").$type<AppUsage | null>(),
	createdAt: timestamp("createdAt").notNull(),
});

export type DBMessage = InferSelectModel<typeof message>;

// DEPRECATED: The following schema is deprecated and will be removed in the future.
// Read the migration guide at https://chat-sdk.dev/docs/migration-guides/message-parts
export const voteDeprecated = pgTable(
	"Vote",
	{
		chatId: uuid("chatId")
			.notNull()
			.references(() => chat.id),
		messageId: uuid("messageId")
			.notNull()
			.references(() => messageDeprecated.id),
		isUpvoted: boolean("isUpvoted").notNull(),
	},
	(table) => {
		return {
			pk: primaryKey({ columns: [table.chatId, table.messageId] }),
		};
	},
);

export type VoteDeprecated = InferSelectModel<typeof voteDeprecated>;

export const vote = pgTable(
	"Vote_v2",
	{
		chatId: uuid("chatId")
			.notNull()
			.references(() => chat.id),
		messageId: uuid("messageId")
			.notNull()
			.references(() => message.id),
		isUpvoted: boolean("isUpvoted").notNull(),
	},
	(table) => {
		return {
			pk: primaryKey({ columns: [table.chatId, table.messageId] }),
		};
	},
);

export type Vote = InferSelectModel<typeof vote>;

export type ProjectFolder = {
	id: string;
	name: string;
	slug: string;
	description: string;
};

export const sourceMaterialStatus = [
	"pending",
	"uploaded",
	"processing",
	"processed",
	"failed",
] as const;
export type SourceMaterialStatus = (typeof sourceMaterialStatus)[number];

export const project = pgTable("Project", {
	id: uuid("id").primaryKey().notNull().defaultRandom(),
	createdAt: timestamp("createdAt").notNull(),
	name: text("name").notNull(),
	description: text("description"),
	visibility: varchar("visibility", { enum: ["public", "private"] })
		.notNull()
		.default("private"),
	folders: jsonb("folders").$type<ProjectFolder[]>().notNull(),
	userId: uuid("userId")
		.notNull()
		.references(() => user.id),
});

export type Project = InferSelectModel<typeof project>;

export const sourceMaterial = pgTable(
	"SourceMaterial",
	{
		id: uuid("id").primaryKey().notNull().defaultRandom(),
		createdAt: timestamp("createdAt").notNull(),
		updatedAt: timestamp("updatedAt").notNull(),
		filename: text("filename").notNull(),
		mimeType: varchar("mimeType", { length: 128 }).notNull(),
		size: integer("size").notNull(),
		status: varchar("status", { enum: sourceMaterialStatus })
			.notNull()
			.default("pending"),
		blobUrl: text("blobUrl"),
		projectId: uuid("projectId")
			.notNull()
			.references(() => project.id),
		userId: uuid("userId")
			.notNull()
			.references(() => user.id),
	},
	(table) => ({
		projectIdx: index("source_material_project_idx").on(table.projectId),
		userIdx: index("source_material_user_idx").on(table.userId),
	}),
);

export type SourceMaterial = InferSelectModel<typeof sourceMaterial>;

export const sourceMaterialProcessing = pgTable(
	"SourceMaterialProcessing",
	{
		id: uuid("id").primaryKey().notNull().defaultRandom(),
		createdAt: timestamp("createdAt").notNull(),
		updatedAt: timestamp("updatedAt").notNull(),
		status: varchar("status", { enum: sourceMaterialStatus })
			.notNull()
			.default("pending"),
		attempts: integer("attempts").notNull().default(0),
		nextAttemptAt: timestamp("nextAttemptAt").notNull(),
		lastError: text("lastError"),
		startedAt: timestamp("startedAt"),
		completedAt: timestamp("completedAt"),
		bytesProcessed: integer("bytesProcessed").notNull().default(0),
		chapters: integer("chapters").notNull().default(0),
		chunks: integer("chunks").notNull().default(0),
		normalizedCharacters: integer("normalizedCharacters").notNull().default(0),
		durationMs: integer("durationMs").notNull().default(0),
		metadata: jsonb("metadata"),
		sourceMaterialId: uuid("sourceMaterialId")
			.notNull()
			.references(() => sourceMaterial.id),
		projectId: uuid("projectId")
			.notNull()
			.references(() => project.id),
		userId: uuid("userId")
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

export const sourceMaterialChapter = pgTable(
	"SourceMaterialChapter",
	{
		id: uuid("id").primaryKey().notNull().defaultRandom(),
		createdAt: timestamp("createdAt").notNull(),
		updatedAt: timestamp("updatedAt").notNull(),
		title: text("title").notNull(),
		sequence: integer("sequence").notNull(),
		headings: jsonb("headings").notNull(),
		metadata: jsonb("metadata"),
		sourceMaterialId: uuid("sourceMaterialId")
			.notNull()
			.references(() => sourceMaterial.id),
		projectId: uuid("projectId")
			.notNull()
			.references(() => project.id),
		userId: uuid("userId")
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

export const sourceMaterialChunk = pgTable(
	"SourceMaterialChunk",
	{
		id: uuid("id").primaryKey().notNull().defaultRandom(),
		createdAt: timestamp("createdAt").notNull(),
		updatedAt: timestamp("updatedAt").notNull(),
		sequence: integer("sequence").notNull(),
		text: text("text").notNull(),
		metadata: jsonb("metadata"),
		chapterId: uuid("chapterId")
			.notNull()
			.references(() => sourceMaterialChapter.id),
		sourceMaterialId: uuid("sourceMaterialId")
			.notNull()
			.references(() => sourceMaterial.id),
		projectId: uuid("projectId")
			.notNull()
			.references(() => project.id),
		userId: uuid("userId")
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

export const outline = pgTable("Outline", {
	id: uuid("id").primaryKey().notNull().defaultRandom(),
	createdAt: timestamp("createdAt").notNull(),
	updatedAt: timestamp("updatedAt").notNull(),
	title: text("title").notNull(),
	summary: text("summary"),
	pov: varchar("pov", { length: 64 }).notNull(),
	tone: varchar("tone", { length: 64 }).notNull(),
	pacing: varchar("pacing", { length: 64 }).notNull(),
	beats: jsonb("beats").$type<string[] | null>(),
	projectId: uuid("projectId")
		.notNull()
		.references(() => project.id),
});

export type Outline = InferSelectModel<typeof outline>;

export const volume = pgTable("Volume", {
	id: uuid("id").primaryKey().notNull().defaultRandom(),
	createdAt: timestamp("createdAt").notNull(),
	updatedAt: timestamp("updatedAt").notNull(),
	title: text("title").notNull(),
	summary: text("summary"),
	outlineId: uuid("outlineId")
		.notNull()
		.references(() => outline.id),
	projectId: uuid("projectId")
		.notNull()
		.references(() => project.id),
});

export type Volume = InferSelectModel<typeof volume>;

export const chapter = pgTable(
	"Chapter",
	{
		id: uuid("id").primaryKey().notNull().defaultRandom(),
		createdAt: timestamp("createdAt").notNull(),
		updatedAt: timestamp("updatedAt").notNull(),
		title: text("title").notNull(),
		notes: text("notes"),
		status: varchar("status", { length: 32 }).notNull().default("planned"),
		sequence: integer("sequence").notNull(),
		outlineId: uuid("outlineId")
			.notNull()
			.references(() => outline.id),
		volumeId: uuid("volumeId")
			.notNull()
			.references(() => volume.id),
		projectId: uuid("projectId")
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

export const chapterDraft = pgTable("ChapterDraft", {
	id: uuid("id").primaryKey().notNull().defaultRandom(),
	createdAt: timestamp("createdAt").notNull(),
	updatedAt: timestamp("updatedAt").notNull(),
	content: text("content").notNull(),
	chapterId: uuid("chapterId")
		.notNull()
		.references(() => chapter.id),
	volumeId: uuid("volumeId")
		.notNull()
		.references(() => volume.id),
	outlineId: uuid("outlineId")
		.notNull()
		.references(() => outline.id),
	projectId: uuid("projectId")
		.notNull()
		.references(() => project.id),
});

export type ChapterDraft = InferSelectModel<typeof chapterDraft>;

export const document = pgTable(
	"Document",
	{
		id: uuid("id").notNull().defaultRandom(),
		createdAt: timestamp("createdAt").notNull(),
		title: text("title").notNull(),
		content: text("content"),
		kind: varchar("text", { enum: ["text", "code", "image", "sheet"] })
			.notNull()
			.default("text"),
		userId: uuid("userId")
			.notNull()
			.references(() => user.id),
	},
	(table) => {
		return {
			pk: primaryKey({ columns: [table.id, table.createdAt] }),
		};
	},
);

export type Document = InferSelectModel<typeof document>;

export const suggestion = pgTable(
	"Suggestion",
	{
		id: uuid("id").notNull().defaultRandom(),
		documentId: uuid("documentId").notNull(),
		documentCreatedAt: timestamp("documentCreatedAt").notNull(),
		originalText: text("originalText").notNull(),
		suggestedText: text("suggestedText").notNull(),
		description: text("description"),
		isResolved: boolean("isResolved").notNull().default(false),
		userId: uuid("userId")
			.notNull()
			.references(() => user.id),
		createdAt: timestamp("createdAt").notNull(),
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

export const stream = pgTable(
	"Stream",
	{
		id: uuid("id").notNull().defaultRandom(),
		chatId: uuid("chatId").notNull(),
		createdAt: timestamp("createdAt").notNull(),
	},
	(table) => ({
		pk: primaryKey({ columns: [table.id] }),
		chatRef: foreignKey({
			columns: [table.chatId],
			foreignColumns: [chat.id],
		}),
	}),
);

export type Stream = InferSelectModel<typeof stream>;

// Book Generation Pipeline Tables

export const sceneStatus = [
	"planned",
	"drafting",
	"drafted",
	"review",
	"final",
] as const;
export type SceneStatus = (typeof sceneStatus)[number];

export const scene = pgTable(
	"Scene",
	{
		id: uuid("id").primaryKey().notNull().defaultRandom(),
		createdAt: timestamp("createdAt").notNull(),
		updatedAt: timestamp("updatedAt").notNull(),
		title: text("title").notNull(),
		sequence: integer("sequence").notNull(),
		content: text("content"),
		status: varchar("status", { length: 32 }).notNull().default("planned"),
		chapterId: uuid("chapterId")
			.notNull()
			.references(() => chapter.id),
		projectId: uuid("projectId")
			.notNull()
			.references(() => project.id),
	},
	(table) => ({
		chapterIdx: index("scene_chapter_idx").on(table.chapterId),
		sequenceIdx: uniqueIndex("scene_sequence_chapter_idx").on(
			table.chapterId,
			table.sequence,
		),
	}),
);

export type Scene = InferSelectModel<typeof scene>;

export type SceneCardData = {
	emotionalBeats?: string[];
	characterGoals?: Record<string, string>;
	constraints?: string[];
};

export const sceneCard = pgTable(
	"SceneCard",
	{
		id: uuid("id").primaryKey().notNull().defaultRandom(),
		createdAt: timestamp("createdAt").notNull(),
		updatedAt: timestamp("updatedAt").notNull(),
		purpose: text("purpose").notNull(),
		setting: text("setting"),
		atmosphere: text("atmosphere"),
		emotionalBeats: jsonb("emotionalBeats").$type<string[] | null>(),
		characterGoals: jsonb("characterGoals").$type<Record<
			string,
			string
		> | null>(),
		constraints: jsonb("constraints").$type<string[] | null>(),
		plannedReveal: text("plannedReveal"),
		sceneId: uuid("sceneId")
			.notNull()
			.references(() => scene.id),
		projectId: uuid("projectId")
			.notNull()
			.references(() => project.id),
	},
	(table) => ({
		sceneIdx: uniqueIndex("scene_card_scene_idx").on(table.sceneId),
	}),
);

export type SceneCard = InferSelectModel<typeof sceneCard>;

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
	paneState: Record<string, unknown>; // scroll positions, expanded items
	lastUpdated: string;
};

export type TaskLogEntry = {
	id: string;
	timestamp: string;
	type: "orchestrator" | "tool_call" | "tool_result";
	modelId: string;
	content: string; // The thought process or tool output
	metadata?: Record<string, unknown>;
};

export type GenerationTaskLog = TaskLogEntry[];

export const bookGeneration = pgTable(
	"BookGeneration",
	{
		id: uuid("id").primaryKey().notNull().defaultRandom(),
		createdAt: timestamp("createdAt").notNull(),
		updatedAt: timestamp("updatedAt").notNull(),
		status: varchar("status", { length: 32 }).notNull().default("idle"),
		settings: jsonb("settings").$type<Record<string, unknown>>(),
		canvasState: jsonb("canvasState").$type<CanvasState | null>(),
		taskLog: jsonb("taskLog").$type<GenerationTaskLog | null>(),
		error: text("error"),
		pausedAt: timestamp("pausedAt"),
		currentStepId: uuid("currentStepId"),
		totalSteps: integer("totalSteps"),
		completedSteps: integer("completedSteps").default(0),
		estimatedCost: jsonb("estimatedCost").$type<{
			inputTokens: number;
			outputTokens: number;
			estimatedUsd: number;
		} | null>(),
		startedAt: timestamp("startedAt"),
		completedAt: timestamp("completedAt"),
		outlineId: uuid("outlineId").references(() => outline.id),
		templateId: uuid("templateId"),
		projectId: uuid("projectId")
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

export const storyState = pgTable(
	"StoryState",
	{
		id: uuid("id").primaryKey().notNull().defaultRandom(),
		createdAt: timestamp("createdAt").notNull(),
		updatedAt: timestamp("updatedAt").notNull(),
		chapterNumber: integer("chapterNumber").notNull(),
		characterKnowledge: jsonb("characterKnowledge").$type<Record<
			string,
			string[]
		> | null>(),
		characterInjuries: jsonb("characterInjuries").$type<Record<
			string,
			string[]
		> | null>(),
		relationshipChanges: jsonb("relationshipChanges").$type<Array<{
			source: string;
			target: string;
			change: string;
		}> | null>(),
		openThreads: jsonb("openThreads").$type<string[] | null>(),
		revealsMade: jsonb("revealsMade").$type<string[] | null>(),
		worldStateChanges: jsonb("worldStateChanges").$type<string[] | null>(),
		generationId: uuid("generationId")
			.notNull()
			.references(() => bookGeneration.id),
		projectId: uuid("projectId")
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

export const bookExport = pgTable(
	"BookExport",
	{
		id: uuid("id").primaryKey().notNull().defaultRandom(),
		createdAt: timestamp("createdAt").notNull(),
		projectId: uuid("projectId")
			.notNull()
			.references(() => project.id),
		blobUrl: text("blobUrl"),
		format: varchar("format", { enum: bookExportFormat }).notNull(),
		status: varchar("status", { enum: bookExportStatus })
			.notNull()
			.default("pending"),
		error: text("error"),
		userId: uuid("userId")
			.notNull()
			.references(() => user.id),
	},
	(table) => ({
		projectIdx: index("book_export_project_idx").on(table.projectId),
		userIdx: index("book_export_user_idx").on(table.userId),
	}),
);

export type BookExport = InferSelectModel<typeof bookExport>;

// User Preferences for model favorites and recent models
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
		createdAt: timestamp("createdAt").notNull(),
		updatedAt: timestamp("updatedAt").notNull(),
	},
	(table) => ({
		userIdx: index("user_preferences_user_idx").on(table.userId),
	}),
);

export type UserPreferences = InferSelectModel<typeof userPreferences>;

// ============================================
// Book Generation System - Enhanced Schema
// ============================================

// Context selection for generation - user controls what data is used
export type ContextSelection = {
	entities: { id: string; name: string; kind: string; included: boolean }[];
	outlines: { id: string; title: string; included: boolean }[];
	scenes: { id: string; title: string; chapterId: string; included: boolean }[];
	drafts: { id: string; chapterTitle: string; included: boolean }[];
	sourceMaterials: { id: string; filename: string; included: boolean }[];
};

// Writing style presets with author inspirations
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

// Complete generation settings
export type GenerationSettings = {
	// Context Selection
	contextSelection: ContextSelection;

	// Core Settings
	totalChapters: number;
	pagesPerChapter: number;
	writingStylePreset: WritingStylePreset;
	customStyleDescription?: string;
	authorInspirations?: string[];
	writerModelId: string;
	reviewerModelId: string;

	// Revision Settings
	revisionRounds: number;
	chapterDependencies?: Record<string, string[]>;

	// Extended Book Options
	includePrologue: boolean;
	includeEpilogue: boolean;
	generateBackCoverBlurb: boolean;
	generateFrontCover: boolean;
	generateCharacterSheets: boolean;
	generateChapterSummaries: boolean;
	generateTableOfContents: boolean;
	runConsistencyCheck: boolean;

	// Metadata
	bookTitle?: string;
	bookSubtitle?: string;
	authorName?: string;
	genre?: string;
	targetAudience?: string;
};

// Generation step statuses
export const generationStepStatus = [
	"pending",
	"running",
	"paused",
	"completed",
	"failed",
	"skipped",
] as const;
export type GenerationStepStatus = (typeof generationStepStatus)[number];

// Generation step types
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

// Per-step tracking for generation pipeline
export const bookGenerationStep = pgTable(
	"BookGenerationStep",
	{
		id: uuid("id").primaryKey().notNull().defaultRandom(),
		generationId: uuid("generationId")
			.notNull()
			.references(() => bookGeneration.id),
		chapterId: uuid("chapterId").references(() => chapter.id),
		sequence: integer("sequence").notNull(),
		stepType: varchar("stepType", { length: 32 }).notNull(),
		status: varchar("status", { length: 32 }).notNull().default("pending"),
		revisionRound: integer("revisionRound").default(1),
		agentOutput: text("agentOutput"),
		reviewFeedback: text("reviewFeedback"),
		wordCount: integer("wordCount"),
		tokenCount: integer("tokenCount"),
		startedAt: timestamp("startedAt"),
		completedAt: timestamp("completedAt"),
		createdAt: timestamp("createdAt").notNull(),
		updatedAt: timestamp("updatedAt").notNull(),
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

// Asset types for generated book components
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

// Generated assets (covers, blurbs, etc.)
export const bookGenerationAsset = pgTable(
	"BookGenerationAsset",
	{
		id: uuid("id").primaryKey().notNull().defaultRandom(),
		generationId: uuid("generationId")
			.notNull()
			.references(() => bookGeneration.id),
		assetType: varchar("assetType", { length: 32 }).notNull(),
		content: text("content"),
		imageUrl: text("imageUrl"),
		metadata: jsonb("metadata").$type<Record<string, unknown>>(),
		createdAt: timestamp("createdAt").notNull(),
		updatedAt: timestamp("updatedAt").notNull(),
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

// Built-in and custom generation templates
export const generationTemplate = pgTable(
	"GenerationTemplate",
	{
		id: uuid("id").primaryKey().notNull().defaultRandom(),
		name: text("name").notNull(),
		description: text("description"),
		settings: jsonb("settings").$type<Partial<GenerationSettings>>().notNull(),
		isBuiltIn: boolean("isBuiltIn").notNull().default(false),
		userId: uuid("userId").references(() => user.id),
		createdAt: timestamp("createdAt").notNull(),
		updatedAt: timestamp("updatedAt").notNull(),
	},
	(table) => ({
		userIdx: index("generation_template_user_idx").on(table.userId),
	}),
);

export type GenerationTemplate = InferSelectModel<typeof generationTemplate>;

// Chapter version history
export const chapterVersion = pgTable(
	"ChapterVersion",
	{
		id: uuid("id").primaryKey().notNull().defaultRandom(),
		chapterId: uuid("chapterId")
			.notNull()
			.references(() => chapter.id),
		generationId: uuid("generationId").references(() => bookGeneration.id),
		content: text("content").notNull(),
		wordCount: integer("wordCount"),
		version: integer("version").notNull(),
		createdBy: varchar("createdBy", { length: 32 }).default("ai"),
		createdAt: timestamp("createdAt").notNull(),
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

// Collaboration notes during generation
export const generationNote = pgTable(
	"GenerationNote",
	{
		id: uuid("id").primaryKey().notNull().defaultRandom(),
		generationId: uuid("generationId")
			.notNull()
			.references(() => bookGeneration.id),
		chapterId: uuid("chapterId").references(() => chapter.id),
		content: text("content").notNull(),
		isGlobal: boolean("isGlobal").notNull().default(false),
		appliedAt: timestamp("appliedAt"),
		createdAt: timestamp("createdAt").notNull(),
	},
	(table) => ({
		generationIdx: index("generation_note_generation_idx").on(
			table.generationId,
		),
		chapterIdx: index("generation_note_chapter_idx").on(table.chapterId),
	}),
);

export type GenerationNote = InferSelectModel<typeof generationNote>;
