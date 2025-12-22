"use server";

import { db } from "@/lib/db/drizzle";
import { userPreferences } from "@/lib/db/schema/auth";
import { eq } from "drizzle-orm";
import { auth } from "@/app/(auth)/auth";
import { getOpenRouterModels } from "@/lib/ai/openrouter";

export async function getModelPreferences() {
  const session = await auth();
  if (!session?.user?.id) {
    return { light: null, middle: null, large: null };
  }

  const [prefs] = await db
    .select({ modelPreferences: userPreferences.modelPreferences })
    .from(userPreferences)
    .where(eq(userPreferences.userId, session.user.id));

  return prefs?.modelPreferences || { light: null, middle: null, large: null };
}

export async function saveModelPreferences(
  newPreferences: {
    light: string | null;
    middle: string | null;
    large: string | null;
  }
) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  await db
    .insert(userPreferences)
    .values({
      userId: session.user.id,
      modelPreferences: newPreferences,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: userPreferences.userId,
      set: {
        modelPreferences: newPreferences,
        updatedAt: new Date(),
      },
    });

    return { success: true };
}

export async function getAvailableModels() {
  // Can add caching here if needed
  return await getOpenRouterModels();
}
