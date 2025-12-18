"use server";

import { auth } from "@/app/(auth)/auth";

import {
	addToRecentModels,
	getUserPreferences,
	toggleFavoriteModel,
	updateFavoriteModels,
} from "@/lib/db/queries/user-preferences";

/**
 * Get the current user's model preferences (favorites and recent)
 */
export async function getModelPreferences(): Promise<{
	favoriteModels: string[];
	recentModels: string[];
}> {
	const session = await auth();
	if (!session?.user?.id) {
		return { favoriteModels: [], recentModels: [] };
	}

	const prefs = await getUserPreferences(session.user.id);
	return {
		favoriteModels: prefs.favoriteModels || [],
		recentModels: prefs.recentModels || [],
	};
}

/**
 * Toggle a model as favorite
 */
export async function toggleFavoriteModelAction(
	modelId: string,
): Promise<{ favoriteModels: string[]; isFavorite: boolean }> {
	const session = await auth();
	if (!session?.user?.id) {
		throw new Error("Unauthorized");
	}

	return toggleFavoriteModel(session.user.id, modelId);
}

/**
 * Track a model as recently used
 */
export async function trackRecentModel(modelId: string): Promise<void> {
	const session = await auth();
	if (!session?.user?.id) {
		return;
	}

	await addToRecentModels(session.user.id, modelId);
}

/**
 * Update the order of favorite models
 */
export async function updateFavoriteModelsAction(
	modelIds: string[],
): Promise<string[]> {
	const session = await auth();
	if (!session?.user?.id) {
		throw new Error("Unauthorized");
	}

	return updateFavoriteModels(session.user.id, modelIds);
}
