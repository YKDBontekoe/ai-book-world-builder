import type { InferSelectModel } from "drizzle-orm";
import {
	index,
	integer,
	jsonb,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { user } from "@/lib/db/schema/auth";

export const passkeyChallengeType = ["registration", "authentication"] as const;
export type PasskeyChallengeType = (typeof passkeyChallengeType)[number];

export const passkeyChallenge = pgTable(
	"PasskeyChallenge",
	{
		id: uuid("id").primaryKey().notNull().defaultRandom(),
		userId: uuid("userId")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		type: varchar("type", { length: 24, enum: passkeyChallengeType }).notNull(),
		challenge: text("challenge").notNull(),
		expiresAt: timestamp("expiresAt", { mode: "date" }).notNull(),
		createdAt: timestamp("createdAt", { mode: "date" }).notNull(),
	},
	(table) => ({
		userIdx: index("passkey_challenge_user_idx").on(table.userId),
		typeIdx: index("passkey_challenge_type_idx").on(table.type),
	}),
);

export type PasskeyChallenge = InferSelectModel<typeof passkeyChallenge>;

export const passkeyCredential = pgTable(
	"PasskeyCredential",
	{
		id: uuid("id").primaryKey().notNull().defaultRandom(),
		userId: uuid("userId")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		credentialId: text("credentialId").notNull().unique(),
		publicKey: text("publicKey").notNull(),
		counter: integer("counter").notNull().default(0),
		transports: jsonb("transports").$type<string[]>().notNull().default([]),
		createdAt: timestamp("createdAt", { mode: "date" }).notNull(),
	},
	(table) => ({
		userIdx: index("passkey_credential_user_idx").on(table.userId),
		credentialIdx: index("passkey_credential_id_idx").on(table.credentialId),
	}),
);

export type PasskeyCredential = InferSelectModel<typeof passkeyCredential>;
