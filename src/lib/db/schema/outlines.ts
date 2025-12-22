import type { InferSelectModel } from "drizzle-orm";
import {
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
  integer,
} from "drizzle-orm/pg-core";

import { project } from "@/lib/db/schema/projects";

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
      table.sequence
    ),
  })
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
