import { unstable_cache } from "next/cache";
import type { ChatModel } from "./models";

export const getOpenRouterModels = unstable_cache(
  async (): Promise<ChatModel[]> => {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/models");
      if (!response.ok) {
        throw new Error("Failed to fetch models from OpenRouter");
      }
      const data = await response.json();

      return data.data
        .map((model: any): ChatModel => {
          const provider = model.id.split('/')[0] || 'openrouter';
          const supportsImages = model.architecture?.modality?.includes("image") ||
                               model.id.includes("vision") ||
                               model.name.toLowerCase().includes("vision") ||
                               true; // Default to true as most modern models support it or fail gracefully

          return {
            id: model.id,
            name: model.name,
            provider: provider, // Extracted provider
            gatewayId: model.id,
            description: `Context: ${Math.round((model.context_length || 0) / 1000)}k`,
            supportsImages: Boolean(supportsImages),
            reasoning: model.id.includes("reasoner") || model.id.includes("o1"), // Basic heuristic
            pricing: {
              input: model.pricing?.prompt || "0",
              output: model.pricing?.completion || "0",
              cachedInputTokens: model.pricing?.request || "0",
            },
          };
        })
        .sort((a: ChatModel, b: ChatModel) => a.name.localeCompare(b.name));

    } catch (error) {
      console.error("Error fetching OpenRouter models:", error);
      return [];
    }
  },
  ["openrouter-models"],
  {
    revalidate: 3600, // Cache for 1 hour
    tags: ["models"],
  }
);
