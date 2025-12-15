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

import { project } from "./projects";
import { scene } from "./scenes";

export const timelineBranch = pgTable(
  "TimelineBranch",
  {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    name: text("name").notNull(),
    projectId: uuid("projectId")
      .notNull()
      .references(() => project.id),
    parentBranchId: uuid("parentBranchId"), // Self-reference added in foreign keys
    createdAt: timestamp("createdAt").notNull(),
    updatedAt: timestamp("updatedAt").notNull(),
  },
  (table) => ({
    projectIdx: index("timeline_branch_project_idx").on(table.projectId),
    parentBranchIdx: index("timeline_branch_parent_branch_idx").on(
      table.parentBranchId
    ),
  })
);

export type TimelineBranch = InferSelectModel<typeof timelineBranch>;

export const timelineNodeType = ["canon", "divergent"] as const;
export type TimelineNodeType = (typeof timelineNodeType)[number];

export const timelineNode = pgTable(
  "TimelineNode",
  {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    branchId: uuid("branchId")
      .notNull()
      .references(() => timelineBranch.id),
    projectId: uuid("projectId")
      .notNull()
      .references(() => project.id),
    type: varchar("type", { enum: timelineNodeType }).notNull(),
    originalSceneId: uuid("originalSceneId").references(() => scene.id),
    content: text("content"),
    summary: text("summary"),
    parentNodeId: uuid("parentNodeId"), // Self-reference
    depth: integer("depth").default(0),
    order: integer("order").default(0),
    data: jsonb("data").$type<Record<string, unknown>>(),
    createdAt: timestamp("createdAt").notNull(),
    updatedAt: timestamp("updatedAt").notNull(),
  },
  (table) => ({
    branchIdx: index("timeline_node_branch_idx").on(table.branchId),
    projectIdx: index("timeline_node_project_idx").on(table.projectId),
    originalSceneIdx: index("timeline_node_original_scene_idx").on(
      table.originalSceneId
    ),
    parentNodeIdx: index("timeline_node_parent_node_idx").on(
      table.parentNodeId
    ),
  })
);

export type TimelineNode = InferSelectModel<typeof timelineNode>;
