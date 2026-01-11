import type { InferSelectModel } from "drizzle-orm";
import {
	foreignKey,
	index,
	integer,
	primaryKey,
	sqliteTable,
	text,
} from "drizzle-orm/sqlite-core";
import { user } from "@/lib/db/schema/sqlite/auth";
import { project } from "@/lib/db/schema/sqlite/projects";
import type { AppUsage } from "@/lib/usage";

export const chat = sqliteTable(
	"Chat",
	{
		id: text("id")
			.primaryKey()
			.notNull()
			.$defaultFn(() => crypto.randomUUID()),
		createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
		title: text("title").notNull(),
		userId: text("userId")
			.notNull()
			.references(() => user.id),
		projectId: text("projectId").references(() => project.id),
		visibility: text("visibility", { enum: ["public", "private"] })
			.notNull()
			.default("private"),
		lastContext: text("lastContext", { mode: "json" })
			.$type<AppUsage | null>()
			.default(null),
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

export const message = sqliteTable(
	"Message_v2",
	{
		id: text("id")
			.primaryKey()
			.notNull()
			.$defaultFn(() => crypto.randomUUID()),
		chatId: text("chatId")
			.notNull()
			.references(() => chat.id),
		role: text("role").notNull(),
		parts: text("parts", { mode: "json" }).notNull(),
		attachments: text("attachments", { mode: "json" }).notNull(),
		usage: text("usage", { mode: "json" }).$type<AppUsage | null>(),
		createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
	},
	(table) => ({
		chatIdCreatedAtIdx: index("message_chat_id_created_at_idx").on(
			table.chatId,
			table.createdAt,
		),
	}),
);

export type DBMessage = InferSelectModel<typeof message>;

export const vote = sqliteTable(
	"Vote_v2",
	{
		chatId: text("chatId")
			.notNull()
			.references(() => chat.id),
		messageId: text("messageId")
			.notNull()
			.references(() => message.id),
		isUpvoted: integer("isUpvoted", { mode: "boolean" }).notNull(),
	},
	(table) => {
		return {
			pk: primaryKey({ columns: [table.chatId, table.messageId] }),
		};
	},
);

export type Vote = InferSelectModel<typeof vote>;

export const stream = sqliteTable(
	"Stream",
	{
		id: text("id")
			.notNull()
			.$defaultFn(() => crypto.randomUUID()),
		chatId: text("chatId").notNull(),
		createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
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
