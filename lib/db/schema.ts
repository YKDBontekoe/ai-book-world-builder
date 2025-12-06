import type { InferSelectModel } from "drizzle-orm";
import {
  boolean,
  foreignKey,
  index,
  integer,
  json,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import type { AppUsage } from "../usage";

export const user = pgTable("User", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  email: varchar("email", { length: 64 }).notNull(),
  password: varchar("password", { length: 64 }),
});

export type User = InferSelectModel<typeof user>;

export const chat = pgTable("Chat", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  createdAt: timestamp("createdAt").notNull(),
  title: text("title").notNull(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id),
  visibility: varchar("visibility", { enum: ["public", "private"] })
    .notNull()
    .default("private"),
  lastContext: jsonb("lastContext").$type<AppUsage | null>(),
});

export type Chat = InferSelectModel<typeof chat>;

// DEPRECATED: The following schema is deprecated and will be removed in the future.
// Read the migration guide at https://chat-sdk.dev/docs/migration-guides/message-parts
export const messageDeprecated = pgTable("Message", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  chatId: uuid("chatId")
    .notNull()
    .references(() => chat.id),
  role: varchar("role").notNull(),
  content: json("content").notNull(),
  createdAt: timestamp("createdAt").notNull(),
});

export type MessageDeprecated = InferSelectModel<typeof messageDeprecated>;

export const message = pgTable("Message_v2", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  chatId: uuid("chatId")
    .notNull()
    .references(() => chat.id),
  role: varchar("role").notNull(),
  parts: json("parts").notNull(),
  attachments: json("attachments").notNull(),
  createdAt: timestamp("createdAt").notNull(),
});

export type DBMessage = InferSelectModel<typeof message>;

// DEPRECATED: The following schema is deprecated and will be removed in the future.
// Read the migration guide at https://chat-sdk.dev/docs/migration-guides/message-parts
export const voteDeprecated = pgTable(
  "Vote",
  {
    chatId: uuid("chatId")
      .notNull()
      .references(() => chat.id),
    messageId: uuid("messageId")
      .notNull()
      .references(() => messageDeprecated.id),
    isUpvoted: boolean("isUpvoted").notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.chatId, table.messageId] }),
    };
  }
);

export type VoteDeprecated = InferSelectModel<typeof voteDeprecated>;

export const vote = pgTable(
  "Vote_v2",
  {
    chatId: uuid("chatId")
      .notNull()
      .references(() => chat.id),
    messageId: uuid("messageId")
      .notNull()
      .references(() => message.id),
    isUpvoted: boolean("isUpvoted").notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.chatId, table.messageId] }),
    };
  }
);

export type Vote = InferSelectModel<typeof vote>;

export type ProjectFolder = {
  id: string;
  name: string;
  slug: string;
  description: string;
};

export const sourceMaterialStatus = [
  "pending",
  "uploaded",
  "processing",
  "processed",
  "failed",
] as const;
export type SourceMaterialStatus = (typeof sourceMaterialStatus)[number];

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
});

export type Project = InferSelectModel<typeof project>;

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
    sourceMaterialIdx: uniqueIndex("source_material_processing_material_idx").on(
      table.sourceMaterialId
    ),
    projectIdx: index("source_material_processing_project_idx").on(
      table.projectId
    ),
  })
);

export type SourceMaterialProcessing = InferSelectModel<
  typeof sourceMaterialProcessing
>;

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

export type SourceMaterialChapter = InferSelectModel<typeof sourceMaterialChapter>;

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

export const entity = pgTable(
  "Entity",
  {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    createdAt: timestamp("createdAt").notNull(),
    updatedAt: timestamp("updatedAt").notNull(),
    name: text("name").notNull(),
    kind: varchar("kind", { length: 48 }).notNull(),
    summary: text("summary"),
    startDate: timestamp("startDate"),
    endDate: timestamp("endDate"),
    projectId: uuid("projectId")
      .notNull()
      .references(() => project.id),
  },
  (table) => ({
    nameByProjectIdx: uniqueIndex("entity_name_project_idx").on(
      table.projectId,
      table.name
    ),
  })
);

export type Entity = InferSelectModel<typeof entity>;

export const entityAttribute = pgTable(
  "EntityAttribute",
  {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    createdAt: timestamp("createdAt").notNull(),
    name: text("name").notNull(),
    value: text("value").notNull(),
    dataType: varchar("dataType", { length: 48 }).notNull(),
    startDate: timestamp("startDate"),
    endDate: timestamp("endDate"),
    entityId: uuid("entityId")
      .notNull()
      .references(() => entity.id),
    projectId: uuid("projectId")
      .notNull()
      .references(() => project.id),
  },
  (table) => ({
    attributeNameIdx: uniqueIndex("entity_attribute_name_idx").on(
      table.entityId,
      table.name
    ),
  })
);

export type EntityAttribute = InferSelectModel<typeof entityAttribute>;

export const relationship = pgTable(
  "Relationship",
  {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    createdAt: timestamp("createdAt").notNull(),
    type: varchar("type", { length: 64 }).notNull(),
    description: text("description"),
    startDate: timestamp("startDate"),
    endDate: timestamp("endDate"),
    projectId: uuid("projectId")
      .notNull()
      .references(() => project.id),
    sourceEntityId: uuid("sourceEntityId")
      .notNull()
      .references(() => entity.id),
    targetEntityId: uuid("targetEntityId")
      .notNull()
      .references(() => entity.id),
  },
  (table) => ({
    relationshipUniqIdx: uniqueIndex("relationship_unique_idx").on(
      table.projectId,
      table.sourceEntityId,
      table.targetEntityId,
      table.type
    ),
  })
);

export type Relationship = InferSelectModel<typeof relationship>;

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

export const stream = pgTable(
  "Stream",
  {
    id: uuid("id").notNull().defaultRandom(),
    chatId: uuid("chatId").notNull(),
    createdAt: timestamp("createdAt").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id] }),
    chatRef: foreignKey({
      columns: [table.chatId],
      foreignColumns: [chat.id],
    }),
  })
);

export type Stream = InferSelectModel<typeof stream>;
