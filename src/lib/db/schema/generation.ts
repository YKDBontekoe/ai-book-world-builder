import type { InferSelectModel } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { user } from "@/lib/db/schema/auth";
import type { AppUsage } from "@/lib/usage";
import { project } from "@/lib/db/schema/projects";
import { chapter, outline } from "@/lib/db/schema/outlines";

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
  })
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
    characterKnowledge: jsonb("characterKnowledge").$type<
      Record<string, string[]> | null
    >(),
    characterInjuries: jsonb("characterInjuries").$type<
      Record<string, string[]> | null
    >(),
    relationshipChanges: jsonb("relationshipChanges").$type<
      Array<{
        source: string;
        target: string;
        change: string;
      }> | null
    >(),
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
      table.chapterNumber
    ),
  })
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
  })
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
    usage: jsonb("usage").$type<AppUsage>(),
    startedAt: timestamp("startedAt"),
    completedAt: timestamp("completedAt"),
    createdAt: timestamp("createdAt").notNull(),
    updatedAt: timestamp("updatedAt").notNull(),
  },
  (table) => ({
    generationIdx: index("book_generation_step_generation_idx").on(
      table.generationId
    ),
    sequenceIdx: index("book_generation_step_sequence_idx").on(
      table.generationId,
      table.sequence
    ),
  })
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
      table.generationId
    ),
    typeIdx: index("book_generation_asset_type_idx").on(
      table.generationId,
      table.assetType
    ),
  })
);

export type BookGenerationAsset = InferSelectModel<typeof bookGenerationAsset>;

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
  })
);

export type GenerationTemplate = InferSelectModel<typeof generationTemplate>;

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
      table.version
    ),
  })
);

export type ChapterVersion = InferSelectModel<typeof chapterVersion>;

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
      table.generationId
    ),
    chapterIdx: index("generation_note_chapter_idx").on(table.chapterId),
  })
);

export type GenerationNote = InferSelectModel<typeof generationNote>;
