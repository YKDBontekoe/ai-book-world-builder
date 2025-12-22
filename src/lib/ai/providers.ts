import { createOpenAI } from "@ai-sdk/openai";
import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from "ai";
import { isTestEnvironment } from "@/lib/constants";

export const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export const myProvider = isTestEnvironment
  ? (() => {
      // Mock provider for tests
      const {
        chatModel,
        liteModel,
        reasoningModel,
      } = require("./models.mock");
      return customProvider({
        languageModels: {
            // Map generic names to mocks
           "chat-model": chatModel,
           "chat-model-lite": liteModel,
           "chat-model-reasoning": reasoningModel,
        },
      });
    })()
  : {
      languageModel: (modelId: string) => {
        const baseModel = openrouter(modelId);

        // Add reasoning middleware if needed, though OpenRouter handles many models natively.
        // For DeepSeek R1/reasoner models, we might need specific handling if not via OpenRouter's standard API.
        // For now, return the base model.
        return baseModel;
      }
    };
