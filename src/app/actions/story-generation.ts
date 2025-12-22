"use server";

import { storyService, BookPlan, StoryStyle } from "@/lib/services/story-service";

export type { BookPlan, StoryStyle };

export async function generateBookPlan(prompt: string, style?: StoryStyle, modelId?: string) {
  try {
    const plan = await storyService.generateBookPlan(prompt, style, modelId);
    return { success: true, plan };
  } catch (error) {
    console.error("Failed to generate book plan", error);
    return { success: false, error: "Failed to generate plan" };
  }
}

export async function createBookFromPlan(projectId: string, plan: BookPlan, style?: StoryStyle) {
  try {
    await storyService.createBookFromPlan(projectId, plan, style);
    return { success: true };
  } catch (error) {
    console.error("Failed to create book from plan", error);
    return { success: false, error: "Failed to apply plan" };
  }
}

export async function planChapterScenes(chapterId: string) {
    try {
        const sceneIds = await storyService.planChapterScenes(chapterId);
        return { success: true, sceneIds };
    } catch (error) {
        console.error("Failed to plan chapter scenes", error);
        return { success: false, error: "Planning failed" };
    }
}

export async function generateSceneText(sceneId: string) {
    try {
        await storyService.generateSceneText(sceneId);
        return { success: true };
    } catch (error) {
        console.error("Failed to generate scene text", error);
        return { success: false };
    }
}
