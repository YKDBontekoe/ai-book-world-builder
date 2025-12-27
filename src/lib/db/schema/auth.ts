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

export const APPEARANCE_THEMES = [
	{ id: "violet", color: "bg-violet-500" },
	{ id: "blue", color: "bg-blue-500" },
	{ id: "emerald", color: "bg-emerald-500" },
	{ id: "amber", color: "bg-amber-500" },
	{ id: "rose", color: "bg-rose-500" },
	{ id: "slate", color: "bg-slate-500" },
] as const;

export type Theme = (typeof APPEARANCE_THEMES)[number]["id"];
export type EditorFont = "sans" | "serif" | "mono";

export interface AppearancePreferences {
	theme: Theme;
	editorFont: EditorFont;
	editorFontSize: number;
	editorLineHeight: number;
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
		createdAt: timestamp("createdAt").notNull(),
		updatedAt: timestamp("updatedAt").notNull(),
	},
	(table) => ({
		userIdx: index("user_preferences_user_idx").on(table.userId),
	}),
);

export type UserPreferences = InferSelectModel<typeof userPreferences>;
