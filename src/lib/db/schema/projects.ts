import type { InferSelectModel } from "drizzle-orm";
import {
  boolean,
  foreignKey,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
  index,
} from "drizzle-orm/pg-core";

import { user } from "@/lib/db/schema/auth";

export type ProjectFolder = {
  id: string;
  name: string;
  slug: string;
  description: string;
};

export const project = pgTable("Project", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  createdAt: timestamp("createdAt").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  visibility: varchar("visibility", { enum: ["public", "private"] })
    .notNull()
    .default("private"),
  folders: jsonb("folders").$type<ProjectFolder[]>().notNull(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id),
  forkedFromId: uuid("forkedFromId"),
  lastViewedSceneId: uuid("lastViewedSceneId"),
}, (table) => ({
  forkedFromFk: foreignKey({
    columns: [table.forkedFromId],
    foreignColumns: [table.id],
  }),
  userIdx: index("project_user_idx").on(table.userId),
}));

export type Project = InferSelectModel<typeof project>;

export const document = pgTable(
  "Document",
  {
    id: uuid("id").notNull().defaultRandom(),
    createdAt: timestamp("createdAt").notNull(),
    title: text("title").notNull(),
    content: text("content"),
    kind: varchar("text", { enum: ["text", "code", "image", "sheet"] })
      .notNull()
      .default("text"),
    userId: uuid("userId")
      .notNull()
      .references(() => user.id),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.id, table.createdAt] }),
      userIdx: index("document_user_idx").on(table.userId),
    };
  }
);

export type Document = InferSelectModel<typeof document>;

export const suggestion = pgTable(
  "Suggestion",
  {
    id: uuid("id").notNull().defaultRandom(),
    documentId: uuid("documentId").notNull(),
    documentCreatedAt: timestamp("documentCreatedAt").notNull(),
    originalText: text("originalText").notNull(),
    suggestedText: text("suggestedText").notNull(),
    description: text("description"),
    isResolved: boolean("isResolved").notNull().default(false),
    userId: uuid("userId")
      .notNull()
      .references(() => user.id),
    createdAt: timestamp("createdAt").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id] }),
    documentRef: foreignKey({
      columns: [table.documentId, table.documentCreatedAt],
      foreignColumns: [document.id, document.createdAt],
    }),
  })
);

export type Suggestion = InferSelectModel<typeof suggestion>;
