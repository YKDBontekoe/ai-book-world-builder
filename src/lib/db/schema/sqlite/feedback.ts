import type { InferSelectModel } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "@/lib/db/schema/sqlite/auth";

export const feedbackType = ["feedback", "crash"] as const;
export type FeedbackType = (typeof feedbackType)[number];

export const feedbackStatus = ["pending", "processed", "ignored"] as const;
export type FeedbackStatus = (typeof feedbackStatus)[number];

export const feedback = sqliteTable("feedback", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	userId: text("userId").references(() => user.id, { onDelete: "set null" }),
	type: text("type").notNull(),
	content: text("content").notNull(),
	meta: text("meta", { mode: "json" }),
	status: text("status").notNull().default("pending"),
	createdAt: integer("createdAt", { mode: "timestamp" })
		.notNull()
		.$defaultFn(() => new Date()),
	processedAt: integer("processedAt", { mode: "timestamp" }),
});

export type Feedback = InferSelectModel<typeof feedback>;
