import type { InferSelectModel } from "drizzle-orm";
import {
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

import { user } from "./auth";
import { project } from "./projects";

export const sourceMaterialStatus = [
  "pending",
  "uploaded",
  "processing",
  "processed",
  "failed",
] as const;
export type SourceMaterialStatus = (typeof sourceMaterialStatus)[number];

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
  })
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
      "source_material_processing_material_idx"
    ).on(table.sourceMaterialId),
    projectIdx: index("source_material_processing_project_idx").on(
      table.projectId
    ),
  })
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
      table.sourceMaterialId
    ),
    projectIdx: index("source_material_chapter_project_idx").on(
      table.projectId
    ),
  })
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
  })
);

export type SourceMaterialChunk = InferSelectModel<typeof sourceMaterialChunk>;

export type NewSourceMaterialChunk = {
  id: string;
  chapterId: string;
  sequence: number;
  text: string;
  metadata?: Record<string, unknown>;
};
