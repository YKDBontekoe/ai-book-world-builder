import type { InferSelectModel } from "drizzle-orm";
import {
	index,
	pgTable,
	real,
	timestamp,
	uniqueIndex,
	uuid,
} from "drizzle-orm/pg-core";

import { user } from "@/lib/db/schema/auth";
import { chapter } from "@/lib/db/schema/outlines";
import { project } from "@/lib/db/schema/projects";

export const readingProgress = pgTable(
	"ReadingProgress",
	{
		id: uuid("id").primaryKey().notNull().defaultRandom(),
		userId: uuid("userId")
			.notNull()
			.references(() => user.id),
		projectId: uuid("projectId")
			.notNull()
			.references(() => project.id),
		chapterId: uuid("chapterId")
			.notNull()
			.references(() => chapter.id),
		progress: real("progress").notNull().default(0),
		updatedAt: timestamp("updatedAt").notNull(),
	},
	(table) => ({
		userProjectIdx: uniqueIndex("reading_progress_user_project_idx").on(
			table.userId,
			table.projectId,
		),
		userIdx: index("reading_progress_user_idx").on(table.userId),
	}),
);

export type ReadingProgress = InferSelectModel<typeof readingProgress>;
