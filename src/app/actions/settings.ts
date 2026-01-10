"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";
import { createPublicAction, createUserAction } from "@/lib/action-middleware";
import { getOpenRouterModels } from "@/lib/ai/openrouter";
import { db } from "@/lib/db";
import { userPreferences } from "@/lib/db/schema/auth";

// ============================================================================
// Validation Schemas
// ============================================================================

const modelPreferencesSchema = z.object({
	light: z.string().nullable(),
	middle: z.string().nullable(),
	large: z.string().nullable(),
});

// ============================================================================
// Actions
// ============================================================================

/**
 * Get model preferences for the current user
 */
export const getModelPreferences = createUserAction({
	handler: async ({ user }) => {
		const [prefs] = await db
			.select({ modelPreferences: userPreferences.modelPreferences })
			.from(userPreferences)
			.where(eq(userPreferences.userId, user.id));

		return (
			prefs?.modelPreferences || { light: null, middle: null, large: null }
		);
	},
});

/**
 * Save model preferences for the current user
 */
export const saveModelPreferences = createUserAction({
	input: modelPreferencesSchema,
	handler: async ({ user, input }) => {
		await db
			.insert(userPreferences)
			.values({
				userId: user.id,
				modelPreferences: input,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.onConflictDoUpdate({
				target: userPreferences.userId,
				set: {
					modelPreferences: input,
					updatedAt: new Date(),
				},
			});

		return { success: true };
	},
});

/**
 * Get available models from OpenRouter
 */
export const getAvailableModels = createPublicAction({
	handler: async () => {
		return await getOpenRouterModels();
	},
});
