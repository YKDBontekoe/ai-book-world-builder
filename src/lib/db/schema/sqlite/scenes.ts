import type { InferSelectModel } from "drizzle-orm";
import {
	index,
	integer,
	sqliteTable,
	text,
	uniqueIndex,
} from "drizzle-orm/sqlite-core";

import { chapter } from "@/lib/db/schema/sqlite/outlines";
import { project } from "@/lib/db/schema/sqlite/projects";

export const sceneStatus = [
	"planned",
	"drafting",
	"drafted",
	"review",
	"final",
] as const;
export type SceneStatus = (typeof sceneStatus)[number];

export const scene = sqliteTable(
	"Scene",
	{
		id: text("id")
			.primaryKey()
			.notNull()
			.$defaultFn(() => crypto.randomUUID()),
		createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
		updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
		title: text("title").notNull(),
		sequence: integer("sequence").notNull(),
		content: text("content"),
		wordCount: integer("wordCount").default(0),
		status: text("status").notNull().default("planned"),
		prevSceneId: text("prevSceneId"),
		chapterId: text("chapterId")
			.notNull()
			.references(() => chapter.id),
		projectId: text("projectId")
			.notNull()
			.references(() => project.id),
	},
	(table) => ({
		prevSceneIdx: index("scene_prev_scene_idx").on(table.prevSceneId),
		chapterIdx: index("scene_chapter_idx").on(table.chapterId),
		projectIdx: index("scene_project_idx").on(table.projectId),
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

export const sceneCard = sqliteTable(
	"SceneCard",
	{
		id: text("id")
			.primaryKey()
			.notNull()
			.$defaultFn(() => crypto.randomUUID()),
		createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
		updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
		purpose: text("purpose").notNull(),
		setting: text("setting"),
		atmosphere: text("atmosphere"),
		emotionalBeats: text("emotionalBeats", { mode: "json" })
			.$type<string[] | null>()
			.default(null),
		characterGoals: text("characterGoals", { mode: "json" })
			.$type<Record<string, string> | null>()
			.default(null),
		constraints: text("constraints", { mode: "json" })
			.$type<string[] | null>()
			.default(null),
		plannedReveal: text("plannedReveal"),
		chronologicalSequence: integer("chronologicalSequence"),
		timeSetting: text("timeSetting"),
		sceneId: text("sceneId")
			.notNull()
			.references(() => scene.id),
		projectId: text("projectId")
			.notNull()
			.references(() => project.id),
	},
	(table) => ({
		sceneIdx: uniqueIndex("scene_card_scene_idx").on(table.sceneId),
	}),
);

export type SceneCard = InferSelectModel<typeof sceneCard>;
