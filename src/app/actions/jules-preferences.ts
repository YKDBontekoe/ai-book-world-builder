"use server";

import { eq } from "drizzle-orm";
import { createUserAction } from "@/lib/action-middleware";
import { db } from "@/lib/db";
import { type JulesPreferences, userPreferences } from "@/lib/db/schema/auth";
import { julesPreferencesSchema } from "./jules-preferences-schemas";
import { AppError } from "@/lib/errors";

const DEFAULT_JULES_PREFERENCES: JulesPreferences = {
	repository: null,
	branch: null,
};

export const getJulesPreferencesAction = createUserAction({
	handler: async ({ user }): Promise<JulesPreferences> => {
		try {
			const [prefs] = await db
				.select({ julesPreferences: userPreferences.julesPreferences })
				.from(userPreferences)
				.where(eq(userPreferences.userId, user.id));

			return prefs?.julesPreferences || DEFAULT_JULES_PREFERENCES;
		} catch (error: any) {
			// Handle missing column error (code 42703) gracefully
			// This can happen if migrations haven't run yet
			if (error?.code === "42703") {
				console.warn(
					"Jules preferences column missing, returning defaults:",
					error.message,
				);
				return DEFAULT_JULES_PREFERENCES;
			}
			throw error;
		}
	},
});

export const saveJulesPreferencesAction = createUserAction({
	input: julesPreferencesSchema,
	handler: async ({ user, input }): Promise<JulesPreferences> => {
		try {
			await db
				.insert(userPreferences)
				.values({
					userId: user.id,
					julesPreferences: input,
					createdAt: new Date(),
					updatedAt: new Date(),
				})
				.onConflictDoUpdate({
					target: userPreferences.userId,
					set: {
						julesPreferences: input,
						updatedAt: new Date(),
					},
				});

			return input;
		} catch (error: any) {
			// Handle missing column error (code 42703) gracefully
			if (error?.code === "42703") {
				console.warn(
					"Jules preferences column missing, cannot save:",
					error.message,
				);
                // Throw an error that the middleware will convert to a result { success: false, error: ... }
                throw new AppError("System maintenance in progress. Preferences could not be saved. Please try again later.");
			}
			throw error;
		}
	},
});
