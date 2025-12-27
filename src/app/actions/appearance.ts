"use server";

import { eq } from "drizzle-orm";
import { auth } from "@/app/(auth)/auth";
import { db } from "@/lib/db/drizzle";
import {
	type AppearancePreferences,
	userPreferences,
} from "@/lib/db/schema/auth";

const DEFAULT_APPEARANCE: AppearancePreferences = {
	theme: "violet",
	editorFont: "sans",
	editorFontSize: 16,
	editorLineHeight: 1.6,
};

export async function getAppearancePreferences(): Promise<AppearancePreferences> {
	const session = await auth();
	if (!session?.user?.id) {
		return DEFAULT_APPEARANCE;
	}

	const [prefs] = await db
		.select({ appearancePreferences: userPreferences.appearancePreferences })
		.from(userPreferences)
		.where(eq(userPreferences.userId, session.user.id));

	return prefs?.appearancePreferences || DEFAULT_APPEARANCE;
}

export async function saveAppearancePreferences(
	newPreferences: Partial<AppearancePreferences>,
) {
	const session = await auth();
	if (!session?.user?.id) {
		throw new Error("Unauthorized");
	}

	// Fetch existing to merge
	const current = await getAppearancePreferences();
	const merged = { ...current, ...newPreferences };

	await db
		.insert(userPreferences)
		.values({
			userId: session.user.id,
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
}
