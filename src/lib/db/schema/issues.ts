import type { InferSelectModel } from "drizzle-orm";
import {
	index,
	pgTable,
	primaryKey,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

import { project } from "@/lib/db/schema/projects";
import { scene } from "@/lib/db/schema/scenes";

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

export const consistencyIssue = pgTable(
	"ConsistencyIssue",
	{
		id: uuid("id").primaryKey().notNull().defaultRandom(),
		projectId: uuid("projectId")
			.notNull()
			.references(() => project.id, { onDelete: "cascade" }),
		sceneId: uuid("sceneId").references(() => scene.id, {
			onDelete: "cascade",
		}),
		type: varchar("type", { length: 32 }).notNull(),
		description: text("description").notNull(),
		suggestion: text("suggestion"),
		severity: varchar("severity", { length: 32 }).notNull().default("medium"),
		status: varchar("status", { length: 32 }).notNull().default("open"),
		createdAt: timestamp("createdAt").notNull().defaultNow(),
		updatedAt: timestamp("updatedAt").notNull().defaultNow(),
	},
	(table) => ({
		projectIdx: index("issue_project_idx").on(table.projectId),
		sceneIdx: index("issue_scene_idx").on(table.sceneId),
	}),
);

export type ConsistencyIssue = InferSelectModel<typeof consistencyIssue>;
