import type { InferSelectModel } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { project } from "@/lib/db/schema/sqlite/projects";
import { scene } from "@/lib/db/schema/sqlite/scenes";

export const consistencyIssueType = [
	"continuity",
	"character",
	"plot",
	"tone",
	"world",
] as const;
export type ConsistencyIssueType = (typeof consistencyIssueType)[number];

export const consistencyIssueSeverity = [
	"low",
	"medium",
	"high",
	"critical",
] as const;
export type ConsistencyIssueSeverity =
	(typeof consistencyIssueSeverity)[number];

export const consistencyIssueStatus = ["open", "resolved", "ignored"] as const;
export type ConsistencyIssueStatus = (typeof consistencyIssueStatus)[number];

export const consistencyIssue = sqliteTable(
	"ConsistencyIssue",
	{
		id: text("id")
			.primaryKey()
			.notNull()
			.$defaultFn(() => crypto.randomUUID()),
		projectId: text("projectId")
			.notNull()
			.references(() => project.id, { onDelete: "cascade" }),
		sceneId: text("sceneId").references(() => scene.id, {
			onDelete: "cascade",
		}),
		type: text("type").notNull(),
		description: text("description").notNull(),
		suggestion: text("suggestion"),
		severity: text("severity").notNull().default("medium"),
		status: text("status").notNull().default("open"),
		createdAt: integer("createdAt", { mode: "timestamp" })
			.notNull()
			.$defaultFn(() => new Date()),
		updatedAt: integer("updatedAt", { mode: "timestamp" })
			.notNull()
			.$defaultFn(() => new Date()),
	},
	(table) => ({
		projectIdx: index("issue_project_idx").on(table.projectId),
		sceneIdx: index("issue_scene_idx").on(table.sceneId),
	}),
);

export type ConsistencyIssue = InferSelectModel<typeof consistencyIssue>;
