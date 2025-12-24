import type { InferSelectModel } from "drizzle-orm";
import {
	jsonb,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { user } from "@/lib/db/schema/auth";

export const feedbackType = ["feedback", "crash"] as const;
export type FeedbackType = (typeof feedbackType)[number];

export const feedbackStatus = ["pending", "processed", "ignored"] as const;
export type FeedbackStatus = (typeof feedbackStatus)[number];

export const feedback = pgTable("feedback", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("userId").references(() => user.id, { onDelete: "set null" }),
	type: varchar("type", { length: 32 }).notNull(), // feedback or crash
	content: text("content").notNull(),
	meta: jsonb("meta"), // Extra info (url, component stack, etc)
	status: varchar("status", { length: 32 }).notNull().default("pending"),
	createdAt: timestamp("createdAt").notNull().defaultNow(),
	processedAt: timestamp("processedAt"),
});

export type Feedback = InferSelectModel<typeof feedback>;
