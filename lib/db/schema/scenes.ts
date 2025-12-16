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
  AnyPgColumn,
} from "drizzle-orm/pg-core";

import { chapter } from "./outlines";
import { project } from "./projects";

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
    parentId: uuid("parentId").references((): AnyPgColumn => scene.id),
    isActive: boolean("isActive").notNull().default(true),
  },
  (table) => ({
    chapterIdx: index("scene_chapter_idx").on(table.chapterId),
    sequenceIdx: uniqueIndex("scene_sequence_chapter_idx").on(
      table.chapterId,
      table.sequence
    ),
    parentIdx: index("scene_parent_idx").on(table.parentId),
  })
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
    characterGoals: jsonb("characterGoals").$type<Record<string, string> | null>(),
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
  })
);

export type SceneCard = InferSelectModel<typeof sceneCard>;
