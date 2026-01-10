"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";
import { createUserAction } from "@/lib/action-middleware";
import { db } from "@/lib/db";
import {
	type AppearancePreferences,
	userPreferences,
} from "@/lib/db/schema/auth";

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_APPEARANCE: AppearancePreferences = {
	theme: "violet",
	editorFont: "sans",
	editorFontSize: 16,
	editorLineHeight: 1.6,
};

// ============================================================================
// Validation Schemas
// ============================================================================

const appearanceSchema = z.object({
	theme: z.string().optional(),
	editorFont: z.string().optional(),
	editorFontSize: z.number().min(10).max(32).optional(),
	editorLineHeight: z.number().min(1).max(3).optional(),
});

// ============================================================================
// Actions
// ============================================================================

/**
 * Get appearance preferences for the current user
 */
export const getAppearancePreferences = createUserAction({
	handler: async ({ user }) => {
		const [prefs] = await db
			.select({ appearancePreferences: userPreferences.appearancePreferences })
			.from(userPreferences)
			.where(eq(userPreferences.userId, user.id));

		return prefs?.appearancePreferences || DEFAULT_APPEARANCE;
	},
});

/**
 * Save appearance preferences for the current user
 */
export const saveAppearancePreferences = createUserAction({
	input: appearanceSchema,
	handler: async ({ user, input }) => {
		// Fetch existing to merge
		const [prefs] = await db
			.select({ appearancePreferences: userPreferences.appearancePreferences })
			.from(userPreferences)
			.where(eq(userPreferences.userId, user.id));

		const current = prefs?.appearancePreferences || DEFAULT_APPEARANCE;
		const merged: AppearancePreferences = {
			...current,
			...input,
		} as AppearancePreferences;

		await db
			.insert(userPreferences)
			.values({
				userId: user.id,
				appearancePreferences: merged,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.onConflictDoUpdate({
				target: userPreferences.userId,
				set: {
					appearancePreferences: merged,
					updatedAt: new Date(),
				},
			});

		return { success: true, preferences: merged };
	},
});
