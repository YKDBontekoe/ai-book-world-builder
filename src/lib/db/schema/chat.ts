import type { InferSelectModel } from "drizzle-orm";
import {
	boolean,
	foreignKey,
	index,
	json,
	jsonb,
	pgTable,
	primaryKey,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

import type { AppUsage } from "@/lib/usage";
import { user } from "@/lib/db/schema/auth";
import { project } from "@/lib/db/schema/projects";

export const chat = pgTable(
	"Chat",
	{
		id: uuid("id").primaryKey().notNull().defaultRandom(),
		createdAt: timestamp("createdAt").notNull(),
		title: text("title").notNull(),
		userId: uuid("userId")
			.notNull()
			.references(() => user.id),
		projectId: uuid("projectId").references(() => project.id),
		visibility: varchar("visibility", { enum: ["public", "private"] })
			.notNull()
			.default("private"),
		lastContext: jsonb("lastContext").$type<AppUsage | null>(),
	},
	(table) => ({
		userIdCreatedAtIdx: index("chat_user_id_created_at_idx").on(
			table.userId,
			table.createdAt,
		),
		projectIdIdx: index("chat_project_id_idx").on(table.projectId),
	}),
);

export type Chat = InferSelectModel<typeof chat>;

export const message = pgTable(
	"Message_v2",
	{
		id: uuid("id").primaryKey().notNull().defaultRandom(),
		chatId: uuid("chatId")
			.notNull()
			.references(() => chat.id),
		role: varchar("role").notNull(),
		parts: json("parts").notNull(),
		attachments: json("attachments").notNull(),
		usage: jsonb("usage").$type<AppUsage | null>(),
		createdAt: timestamp("createdAt").notNull(),
	},
	(table) => ({
		chatIdCreatedAtIdx: index("message_chat_id_created_at_idx").on(
			table.chatId,
			table.createdAt,
		),
	}),
);

export type DBMessage = InferSelectModel<typeof message>;

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
	},
);

export type Vote = InferSelectModel<typeof vote>;

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
	}),
);

export type Stream = InferSelectModel<typeof stream>;
