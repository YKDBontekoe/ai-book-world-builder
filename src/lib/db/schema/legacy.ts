import type { InferSelectModel } from "drizzle-orm";
import { boolean, json, pgTable, primaryKey, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import { chat } from "./chat";

/**
 * @deprecated Legacy message schema kept for data migration only.
 * Migrate to `message` defined in chat.ts once historical rows are ported.
 */
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

/**
 * @deprecated Legacy vote schema retained for backward compatibility.
 * Use `vote` with `Message_v2` rows and migrate existing data before removal.
 */
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

export const legacySchemas = {
  messageDeprecated,
  voteDeprecated,
} as const;
