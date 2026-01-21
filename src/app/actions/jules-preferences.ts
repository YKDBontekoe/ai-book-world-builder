"use server";

import { eq } from "drizzle-orm";
import { createUserAction } from "@/lib/action-middleware";
import { db } from "@/lib/db";
import { type JulesPreferences, userPreferences } from "@/lib/db/schema/auth";
import { julesPreferencesSchema } from "./jules-preferences-schemas";

const DEFAULT_JULES_PREFERENCES: JulesPreferences = {
	repository: null,
	branch: null,
};

export const getJulesPreferencesAction = createUserAction({
	handler: async ({ user }): Promise<JulesPreferences> => {
		const [prefs] = await db
			.select({ julesPreferences: userPreferences.julesPreferences })
			.from(userPreferences)
			.where(eq(userPreferences.userId, user.id));

		return prefs?.julesPreferences || DEFAULT_JULES_PREFERENCES;
	},
});

export const saveJulesPreferencesAction = createUserAction({
	input: julesPreferencesSchema,
	handler: async ({ user, input }): Promise<JulesPreferences> => {
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
	},
});
