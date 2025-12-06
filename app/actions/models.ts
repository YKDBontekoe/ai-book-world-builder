"use server";

import { gateway } from "@ai-sdk/gateway";
import { unstable_cache } from "next/cache";

import type { ChatModel } from "@/lib/ai/models";

export const getAvailableChatModels = unstable_cache(
  async (): Promise<ChatModel[]> => {
    try {
      const { models } = await gateway.getAvailableModels();
      const languageModels = models.filter((model: any) => model.modelType === "language");
      
      return languageModels.map((model: any) => ({
        id: model.id,
        name: model.name || model.id,
        description: model.description || "",
        modelType: "language",
        provider: model.provider || model.id.split("/")[0] || "unknown",
        supportsImages: model.id.includes("vision") || model.id.includes("4o") || model.id.includes("claude-3"), // Heuristic
        pricing: model.pricing,
      }));
    } catch (error) {
      console.error("Failed to fetch models from gateway:", error);
      return [];
    }
  },
  ["available-chat-models"],
  {
    revalidate: 3600, // Cache for 1 hour
    tags: ["models"],
  }
);
