"use server";

import { z } from "zod";
import { createUserAction } from "@/lib/action-middleware";
import {
	addToRecentModels,
	getUserPreferences,
	toggleFavoriteModel,
	updateFavoriteModels,
} from "@/lib/db/queries/user-preferences";

// ============================================================================
// Validation Schemas
// ============================================================================

const modelIdSchema = z.object({
	modelId: z.string().min(1, "Model ID is required"),
});

const modelIdsSchema = z.object({
	modelIds: z.array(z.string()),
});

// ============================================================================
// Actions
// ============================================================================

/**
 * Get the current user's model preferences (favorites and recent)
 */
export const getModelPreferences = createUserAction({
	handler: async ({ user }) => {
		const prefs = await getUserPreferences(user.id);
		return {
			favoriteModels: prefs.favoriteModels || [],
			recentModels: prefs.recentModels || [],
			modelPreferences: prefs.modelPreferences || {
				light: null,
				middle: null,
				large: null,
			},
		};
	},
});

/**
 * Toggle a model as favorite
 */
export const toggleFavoriteModelAction = createUserAction({
	input: modelIdSchema,
	handler: async ({ user, input }) => {
		return toggleFavoriteModel(user.id, input.modelId);
	},
});

/**
 * Track a model as recently used
 */
export const trackRecentModel = createUserAction({
	input: modelIdSchema,
	handler: async ({ user, input }) => {
		await addToRecentModels(user.id, input.modelId);
	},
});

/**
 * Update the order of favorite models
 */
export const updateFavoriteModelsAction = createUserAction({
	input: modelIdsSchema,
	handler: async ({ user, input }) => {
		return updateFavoriteModels(user.id, input.modelIds);
	},
});
