import type { InferSelectModel } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const userRole = ["user", "admin"] as const;
export type UserRole = (typeof userRole)[number];

export const user = sqliteTable("User", {
	id: text("id").primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
	name: text("name"),
	email: text("email").notNull().unique(),
	emailVerified: integer("emailVerified", { mode: "timestamp" }),
	image: text("image"),
	password: text("password"),
	role: text("role", { enum: userRole }).notNull().default("user"),
	bannedAt: integer("bannedAt", { mode: "timestamp" }),
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

export const userPreferences = sqliteTable(
	"UserPreferences",
	{
		id: text("id").primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
		userId: text("userId")
			.notNull()
			.references(() => user.id)
			.unique(),
		favoriteModels: text("favoriteModels", { mode: "json" })
			.$type<string[]>()
			.notNull()
			.default([]),
		recentModels: text("recentModels", { mode: "json" })
			.$type<string[]>()
			.notNull()
			.default([]),
		modelPreferences: text("modelPreferences", { mode: "json" })
			.$type<ModelPreferences>()
			.default({ light: null, middle: null, large: null }),
		appearancePreferences: text("appearancePreferences", { mode: "json" })
			.$type<AppearancePreferences>()
			.default({
				theme: "violet",
				editorFont: "sans",
				editorFontSize: 16,
				editorLineHeight: 1.6,
			}),
		createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
		updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
	},
	(table) => ({
		userIdx: index("user_preferences_user_idx").on(table.userId),
	}),
);

export type UserPreferences = InferSelectModel<typeof userPreferences>;
