import { unstable_cache } from "next/cache";

export const getOpenRouterModels = unstable_cache(
  async () => {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/models");
      if (!response.ok) {
        throw new Error("Failed to fetch models from OpenRouter");
      }
      const data = await response.json();
      return data.data.map((model: any) => ({
        id: model.id,
        name: model.name,
        context_length: model.context_length,
        pricing: model.pricing,
      }));
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
