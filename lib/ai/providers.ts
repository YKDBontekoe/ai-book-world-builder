import { gateway } from "@ai-sdk/gateway";
import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from "ai";
import { isTestEnvironment } from "../constants";
import { chatModels } from "./models";

export const myProvider = isTestEnvironment
  ? (() => {
      const {
        artifactModel,
        chatModel,
        geminiModel,
        gpt4oMiniModel,
        haikuModel,
        liteModel,
        reasoningModel,
        titleModel,
      } = require("./models.mock");
      return customProvider({
        languageModels: {
          "anthropic-claude-haiku": haikuModel,
          "chat-model": chatModel,
          "chat-model-lite": liteModel,
          "chat-model-reasoning": reasoningModel,
          "google-gemini-flash": geminiModel,
          "openai-gpt-4o-mini": gpt4oMiniModel,
          "title-model": titleModel,
          "artifact-model": artifactModel,
        },
      });
    })()
  : customProvider({
      languageModels: {
        ...Object.fromEntries(
          chatModels.map((chatModel) => {
            const baseModel = gateway.languageModel(chatModel.gatewayId);

            if (chatModel.reasoning) {
              return [
                chatModel.id,
                wrapLanguageModel({
                  model: baseModel,
                  middleware: extractReasoningMiddleware({ tagName: "think" }),
                }),
              ];
            }

            return [chatModel.id, baseModel];
          })
        ),
        "title-model": gateway.languageModel("openai/gpt-4o-mini"),
        "artifact-model": gateway.languageModel("openai/gpt-4o-mini"),
      },
    });
