"use server";

import { eq } from "drizzle-orm";
import { db } from "../drizzle";
import { type UserPreferences, userPreferences } from "../schema";

const MAX_RECENT_MODELS = 5;

/**
 * Get or create user preferences
 */
export async function getUserPreferences(
	userId: string,
): Promise<UserPreferences> {
	const existing = await db
		.select()
		.from(userPreferences)
		.where(eq(userPreferences.userId, userId))
		.limit(1);

	if (existing.length > 0) {
		return existing[0];
	}

	// Create new preferences
	const now = new Date();
	const [created] = await db
		.insert(userPreferences)
		.values({
			userId,
			favoriteModels: [],
			recentModels: [],
			createdAt: now,
			updatedAt: now,
		})
		.returning();

	return created;
}

/**
 * Toggle a model in favorites list
 */
export async function toggleFavoriteModel(
	userId: string,
	modelId: string,
): Promise<{ favoriteModels: string[]; isFavorite: boolean }> {
	const prefs = await getUserPreferences(userId);
	const currentFavorites = prefs.favoriteModels || [];

	const isFavorite = currentFavorites.includes(modelId);
	const newFavorites = isFavorite
		? currentFavorites.filter((id) => id !== modelId)
		: [...currentFavorites, modelId];

	await db
		.update(userPreferences)
		.set({
			favoriteModels: newFavorites,
			updatedAt: new Date(),
		})
		.where(eq(userPreferences.userId, userId));

	return {
		favoriteModels: newFavorites,
		isFavorite: !isFavorite,
	};
}

/**
 * Add a model to recent models list (capped at MAX_RECENT_MODELS)
 */
export async function addToRecentModels(
	userId: string,
	modelId: string,
): Promise<string[]> {
	const prefs = await getUserPreferences(userId);
	const currentRecent = prefs.recentModels || [];

	// Remove if already present, then add to front
	const filtered = currentRecent.filter((id) => id !== modelId);
	const newRecent = [modelId, ...filtered].slice(0, MAX_RECENT_MODELS);

	await db
		.update(userPreferences)
		.set({
			recentModels: newRecent,
			updatedAt: new Date(),
		})
		.where(eq(userPreferences.userId, userId));

	return newRecent;
}

/**
 * Update favorite models list
 */
export async function updateFavoriteModels(
	userId: string,
	modelIds: string[],
): Promise<string[]> {
	await db
		.update(userPreferences)
		.set({
			favoriteModels: modelIds,
			updatedAt: new Date(),
		})
		.where(eq(userPreferences.userId, userId));

	return modelIds;
}
