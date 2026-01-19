import type { InferSelectModel } from "drizzle-orm";
import {
	index,
	jsonb,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

export const userRole = ["user", "admin"] as const;
export type UserRole = (typeof userRole)[number];

export const user = pgTable("User", {
	id: uuid("id").primaryKey().notNull().defaultRandom(),
	name: text("name"),
	email: varchar("email", { length: 64 }).notNull().unique(),
	emailVerified: timestamp("emailVerified", { mode: "date" }),
	image: text("image"),
	password: varchar("password", { length: 64 }),
	role: varchar("role", { enum: userRole }).notNull().default("user"),
	bannedAt: timestamp("bannedAt"),
});

export type User = InferSelectModel<typeof user>;

export interface ModelPreferences {
	light: string | null;
	middle: string | null;
	large: string | null;
}

export interface AppearancePreferences {
	theme: "violet" | "blue" | "emerald" | "amber" | "rose" | "slate";
	editorFont: "sans" | "serif" | "mono";
	editorFontSize: number;
	editorLineHeight: number;
}

export interface JulesPreferences {
	repository: string | null;
	branch: string | null;
}

export const userPreferences = pgTable(
	"UserPreferences",
	{
		id: uuid("id").primaryKey().notNull().defaultRandom(),
		userId: uuid("userId")
			.notNull()
			.references(() => user.id)
			.unique(),
		favoriteModels: jsonb("favoriteModels")
			.$type<string[]>()
			.notNull()
			.default([]),
		recentModels: jsonb("recentModels").$type<string[]>().notNull().default([]),
		modelPreferences: jsonb("modelPreferences")
			.$type<ModelPreferences>()
			.default({ light: null, middle: null, large: null }),
		appearancePreferences: jsonb("appearancePreferences")
			.$type<AppearancePreferences>()
			.default({
				theme: "violet",
				editorFont: "sans",
				editorFontSize: 16,
				editorLineHeight: 1.6,
			}),
		julesPreferences: jsonb("julesPreferences")
			.$type<JulesPreferences>()
			.default({
				repository: null,
				branch: null,
			}),
		createdAt: timestamp("createdAt").notNull(),
		updatedAt: timestamp("updatedAt").notNull(),
	},
	(table) => ({
		userIdx: index("user_preferences_user_idx").on(table.userId),
	}),
);

export type UserPreferences = InferSelectModel<typeof userPreferences>;
