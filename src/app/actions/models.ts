"use server";

import { gateway } from "@ai-sdk/gateway";
import { unstable_cache } from "next/cache";

import type { ChatModel } from "@/lib/ai/models";

// Helper type for Gateway response structure
type GatewayModel = {
  id: string;
  modelType?: string | null;
  name?: string | null;
  description?: string | null;
  provider?: string;
  pricing?: any;
};

export const getAvailableChatModels = unstable_cache(
  async (): Promise<ChatModel[]> => {
    try {
      const { models } = await gateway.getAvailableModels();
      // Cast the filter predicate or the array to avoid strict type mismatch if Gateway types are loose
      const languageModels = (models as unknown as GatewayModel[]).filter(
        (model) => model.modelType === "language"
      );

      return languageModels.map((model) => ({
        id: model.id,
        name: model.name || model.id,
        description: model.description || "",
        gatewayId: model.id,
        // Since we filtered by modelType === "language", we know it's a language model
        modelType: "language",
        provider: model.provider || model.id.split("/")[0] || "unknown",
        supportsImages:
          model.id.includes("vision") ||
          model.id.includes("4o") ||
          model.id.includes("claude-3"), // Heuristic
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
