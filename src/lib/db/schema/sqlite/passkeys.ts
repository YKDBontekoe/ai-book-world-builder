import type { InferSelectModel } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "@/lib/db/schema/sqlite/auth";

export const passkeyChallengeType = ["registration", "authentication"] as const;
export type PasskeyChallengeType = (typeof passkeyChallengeType)[number];

export const passkeyChallenge = sqliteTable(
	"PasskeyChallenge",
	{
		id: text("id")
			.primaryKey()
			.notNull()
			.$defaultFn(() => crypto.randomUUID()),
		userId: text("userId")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		type: text("type", { enum: passkeyChallengeType }).notNull(),
		challenge: text("challenge").notNull(),
		expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
		createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
	},
	(table) => ({
		userIdx: index("passkey_challenge_user_idx").on(table.userId),
		typeIdx: index("passkey_challenge_type_idx").on(table.type),
	}),
);

export type PasskeyChallenge = InferSelectModel<typeof passkeyChallenge>;

export const passkeyCredential = sqliteTable(
	"PasskeyCredential",
	{
		id: text("id")
			.primaryKey()
			.notNull()
			.$defaultFn(() => crypto.randomUUID()),
		userId: text("userId")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		credentialId: text("credentialId").notNull().unique(),
		publicKey: text("publicKey").notNull(),
		counter: integer("counter").notNull().default(0),
		transports: text("transports", { mode: "json" })
			.$type<string[]>()
			.notNull()
			.default([]),
		createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
	},
	(table) => ({
		userIdx: index("passkey_credential_user_idx").on(table.userId),
		credentialIdx: index("passkey_credential_id_idx").on(table.credentialId),
	}),
);

export type PasskeyCredential = InferSelectModel<typeof passkeyCredential>;
