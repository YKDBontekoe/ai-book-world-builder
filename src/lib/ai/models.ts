import { getAvailableModels } from "@/app/actions/settings";
import { getModelPreferences } from "@/app/actions/settings";

export type ChatModel = {
  id: string;
  name: string;
  provider: string;
  gatewayId: string;
  description: string;
  supportsImages: boolean;
  contextLength?: number;
  reasoning?: boolean;
  pricing?: {
    input: string;
    output: string;
    cachedInputTokens?: string;
  };
};

export type ChatModelId = string;

// Fallback models in case preferences aren't set or fetch fails
export const DEFAULT_MODELS = {
  light: "google/gemini-2.0-flash-lite-preview-02-05:free",
  middle: "google/gemini-2.0-flash-001",
  large: "google/gemini-2.0-pro-exp-02-05:free",
};

// Compatibility for existing code that expects a default
export const DEFAULT_CHAT_MODEL: ChatModelId = DEFAULT_MODELS.middle;

// Helper to check if a model ID is valid (basic check)
export const isChatModelId = (candidate?: string): candidate is ChatModelId =>
  typeof candidate === "string" && candidate.length > 0;

// Helper to get a valid ID or default
export const getValidChatModelId = (candidate?: string): ChatModelId =>
  isChatModelId(candidate) ? candidate : DEFAULT_CHAT_MODEL;

// Async function to resolve "light", "middle", "large" to a concrete ID
export async function getSelectedModelId(
  type: "light" | "middle" | "large"
): Promise<string> {
  const preferences = await getModelPreferences();
  return preferences[type] || DEFAULT_MODELS[type];
}

// Function to get model info - needs to be async now
export async function getChatModelById(id?: string): Promise<ChatModel | undefined> {
   if (!id) return undefined;

   const models = await getAvailableModels();
   // The models returned by getAvailableModels are of type ChatModel, but here we are treating them as raw data
   // to be safe, let's cast or check
   const model = models.find((m: any) => m.id === id);

   if (model) {
       // Check if model properties are snake_case (raw API) or camelCase (ChatModel)
       const contextLength = model.contextLength ?? (model as any).context_length;
       const pricingInput = model.pricing?.input ?? (model.pricing as any)?.prompt ?? "0";
       const pricingOutput = model.pricing?.output ?? (model.pricing as any)?.completion ?? "0";

       return {
           id: model.id,
           name: model.name,
           provider: "OpenRouter",
           gatewayId: model.id,
           description: `Context: ${contextLength}`,
           supportsImages: true,
           contextLength: contextLength,
           pricing: {
               input: pricingInput,
               output: pricingOutput
           }
       };
   }

   // Fallback for known defaults if not found in fetched list
   return {
       id,
       name: id,
       provider: "OpenRouter",
       gatewayId: id,
       description: "Unknown Model",
       supportsImages: true,
       contextLength: 4096 // Conservative default
   };
}

// For consumers needing a list of models (e.g. ModelSelector)
// Consumers should prefer fetching via server action.
export const chatModels: ChatModel[] = [
    {
        id: DEFAULT_MODELS.light,
        name: "Gemini 2.0 Flash Lite (Light Default)",
        provider: "Google",
        gatewayId: DEFAULT_MODELS.light,
        description: "Fast and free",
        supportsImages: true,
        contextLength: 1000000
    },
    {
        id: DEFAULT_MODELS.middle,
        name: "Gemini 2.0 Flash (Middle Default)",
        provider: "Google",
        gatewayId: DEFAULT_MODELS.middle,
        description: "Balanced",
        supportsImages: true,
        contextLength: 1000000
    },
    {
        id: DEFAULT_MODELS.large,
        name: "Gemini 2.0 Pro (Large Default)",
        provider: "Google",
        gatewayId: DEFAULT_MODELS.large,
        description: "Complex reasoning",
        supportsImages: true,
        contextLength: 2000000
    }
];

export const chatModelIds = chatModels.map(m => m.id);
