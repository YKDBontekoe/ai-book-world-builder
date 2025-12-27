import {
	getAvailableModels,
	getModelPreferences,
} from "@/app/actions/settings";

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
	light: "openrouter/auto",
	middle: "openrouter/auto",
	large: "google/gemini-2.0-flash-001",
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
	type: "light" | "middle" | "large",
): Promise<string> {
	const preferences = await getModelPreferences();
	return preferences[type] || DEFAULT_MODELS[type];
}

// Interface for raw API response to avoid 'any'
interface RawModelData {
	id: string;
	name: string;
	context_length?: number;
	pricing?: {
		prompt?: string;
		completion?: string;
	};
}

// Function to get model info - needs to be async now
export async function getChatModelById(
	id?: string,
): Promise<ChatModel | undefined> {
	if (!id) return undefined;

	const models = await getAvailableModels();
	const model = models.find((m) => m.id === id);

	if (model) {
		// Use type assertion only if we know the shape might differ from ChatModel (e.g. from raw API)
		// But getAvailableModels returns ChatModel[].
		// If getAvailableModels actually returns raw data typed as ChatModel improperly, we should fix that upstream.
		// Assuming mixed return types for now, we use a safer check.

		// If it's already a valid ChatModel
		if ('contextLength' in model && model.pricing?.input) {
			return model;
		}

		// If it's raw data (defensive coding)
		const rawModel = model as unknown as RawModelData;
		const contextLength = model.contextLength ?? rawModel.context_length ?? 4096;
		const pricingInput = model.pricing?.input ?? rawModel.pricing?.prompt ?? "0";
		const pricingOutput = model.pricing?.output ?? rawModel.pricing?.completion ?? "0";

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
				output: pricingOutput,
			},
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
		contextLength: 4096, // Conservative default
	};
}

// For consumers needing a list of models (e.g. ModelSelector)
// Consumers should prefer fetching via server action.
export const chatModels: ChatModel[] = [
	{
		id: DEFAULT_MODELS.light,
		name: "OpenRouter Auto (Light)",
		provider: "OpenRouter",
		gatewayId: DEFAULT_MODELS.light,
		description: "Auto-selected light model",
		supportsImages: true,
		contextLength: 128000,
	},
	{
		id: DEFAULT_MODELS.middle,
		name: "OpenRouter Auto (Middle)",
		provider: "OpenRouter",
		gatewayId: DEFAULT_MODELS.middle,
		description: "Auto-selected balanced model",
		supportsImages: true,
		contextLength: 128000,
	},
	{
		id: DEFAULT_MODELS.large,
		name: "OpenRouter Auto (Large)",
		provider: "OpenRouter",
		gatewayId: DEFAULT_MODELS.large,
		description: "Auto-selected reasoning model",
		supportsImages: true,
		contextLength: 128000,
	},
];

export const chatModelIds = chatModels.map((m) => m.id);
