import { createOpenAI } from "@ai-sdk/openai";
import { customProvider, type LanguageModel } from "ai";
import { DEFAULT_MODELS } from "@/lib/ai/models";
import { isTestEnvironment } from "@/lib/constants";

export const openrouter = createOpenAI({
	baseURL: "https://openrouter.ai/api/v1",
	apiKey: process.env.OPENROUTER_GATEWAY_API_KEY,
});

export const myProvider = isTestEnvironment
	? (() => {
			// Mock provider for tests
			const { chatModel, liteModel, reasoningModel } = require("./models.mock");
			return customProvider({
				languageModels: {
					// Map generic names to mocks
					"chat-model": chatModel,
					"chat-model-lite": liteModel,
					"chat-model-reasoning": reasoningModel,

					// Map specific default models to mocks
					[DEFAULT_MODELS.light]: liteModel,
					[DEFAULT_MODELS.middle]: chatModel,
					[DEFAULT_MODELS.large]: reasoningModel, // Using reasoning mock for large/complex tasks
				},
			});
		})()
	: {
			languageModel: (modelId: string): LanguageModel => {
				const baseModel = openrouter(modelId);

				// Add reasoning middleware if needed, though OpenRouter handles many models natively.
				// For DeepSeek R1/reasoner models, we might need specific handling if not via OpenRouter's standard API.
				// For now, return the base model.
				return baseModel;
			},
		};
