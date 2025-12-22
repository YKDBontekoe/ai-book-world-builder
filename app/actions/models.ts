"use server";

import { unstable_cache } from "next/cache";
import { getOpenRouterModels } from "@/lib/ai/openrouter";
import type { ChatModel } from "@/lib/ai/models";

// Helper type for OpenRouter model structure from our internal helper
type OpenRouterModel = {
  id: string;
  name: string;
  contextLength?: number;
  pricing: any;
};

export const getAvailableChatModels = unstable_cache(
  async (): Promise<ChatModel[]> => {
    try {
      const models = await getOpenRouterModels();

      return models.map((model: ChatModel) => { // use ChatModel directly as it is returned by getOpenRouterModels
        // Simple heuristic for provider
        const provider = model.provider || model.id.split("/")[0] || "unknown";

        return {
          id: model.id,
          name: model.name || model.id,
          description: model.description || `Context: ${Math.round((model.contextLength || 0) / 1000)}k`,
          gatewayId: model.id,
          provider,
          contextLength: model.contextLength,
          supportsImages:
            model.supportsImages ||
            model.id.includes("vision") ||
            model.id.includes("4o") ||
            model.id.includes("claude-3"), // Heuristic
          pricing: model.pricing || {
             input: "0",
             output: "0",
             cachedInputTokens: "0"
          },
        };
      });
    } catch (error) {
      console.error("Failed to fetch models:", error);
      return [];
    }
  },
  ["available-chat-models"],
  {
    revalidate: 3600, // Cache for 1 hour
    tags: ["models"],
  }
);
