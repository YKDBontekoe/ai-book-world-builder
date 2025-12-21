"use server";

import { unstable_cache } from "next/cache";
import { getOpenRouterModels } from "@/lib/ai/openrouter";
import type { ChatModel } from "@/lib/ai/models";

// Helper type for OpenRouter model structure from our internal helper
type OpenRouterModel = {
  id: string;
  name: string;
  context_length: number;
  pricing: any;
};

export const getAvailableChatModels = unstable_cache(
  async (): Promise<ChatModel[]> => {
    try {
      const models = await getOpenRouterModels();

      return models.map((model: OpenRouterModel) => {
        // Simple heuristic for provider
        const provider = model.id.split("/")[0] || "unknown";

        return {
          id: model.id,
          name: model.name || model.id,
          description: `Context: ${Math.round(model.context_length / 1000)}k`,
          gatewayId: model.id,
          provider,
          supportsImages:
            model.id.includes("vision") ||
            model.id.includes("4o") ||
            model.id.includes("claude-3"), // Heuristic
          pricing: {
             input: model.pricing?.prompt || "0",
             output: model.pricing?.completion || "0",
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
