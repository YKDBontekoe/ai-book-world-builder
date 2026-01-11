import type { InferSelectModel } from "drizzle-orm";
import {
	index,
	integer,
	real,
	sqliteTable,
	text,
	uniqueIndex,
} from "drizzle-orm/sqlite-core";

import { user } from "@/lib/db/schema/sqlite/auth";
import { chapter } from "@/lib/db/schema/sqlite/outlines";
import { project } from "@/lib/db/schema/sqlite/projects";

export const readingProgress = sqliteTable(
	"ReadingProgress",
	{
		id: text("id")
			.primaryKey()
			.notNull()
			.$defaultFn(() => crypto.randomUUID()),
		userId: text("userId")
			.notNull()
			.references(() => user.id),
		projectId: text("projectId")
			.notNull()
			.references(() => project.id),
		chapterId: text("chapterId")
			.notNull()
			.references(() => chapter.id),
		progress: real("progress").notNull().default(0),
		updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
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
