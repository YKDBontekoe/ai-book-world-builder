export const chatModels = [
  {
    id: "openai-gpt-4o-mini",
    name: "GPT-4o mini",
    provider: "OpenAI",
    gatewayId: "openai/gpt-4o-mini",
    description: "Fast, cost-effective multimodal model with image support",
    supportsImages: true,
  },
  {
    id: "chat-model",
    name: "Grok Vision",
    provider: "xAI",
    gatewayId: "xai/grok-2-vision-1212",
    description: "Advanced multimodal model with vision and text capabilities",
    supportsImages: true,
  },
  {
    id: "google-gemini-flash",
    name: "Gemini 1.5 Flash",
    provider: "Google",
    gatewayId: "google/gemini-1.5-flash-latest",
    description: "Balanced vision model for images, audio, and long context",
    supportsImages: true,
  },
  {
    id: "anthropic-claude-haiku",
    name: "Claude 3.5 Haiku",
    provider: "Anthropic",
    gatewayId: "anthropic/claude-3-5-haiku-20241022",
    description: "Affordable reasoning model for fast, high-quality text",
    supportsImages: false,
  },
  {
    id: "chat-model-lite",
    name: "Grok Lite",
    provider: "xAI",
    gatewayId: "xai/grok-2-1212",
    description: "Lower-cost text model for faster, everyday conversations",
    supportsImages: false,
  },
  {
    id: "chat-model-reasoning",
    name: "Grok Reasoning",
    provider: "xAI",
    gatewayId: "xai/grok-3-mini",
    description:
      "Uses advanced chain-of-thought reasoning for complex problems",
    supportsImages: false,
    reasoning: true,
  },
] as const;

export type ChatModel = {
  id: string;
  name: string;
  provider: string;
  description: string;
  supportsImages: boolean;
  reasoning?: boolean;
  pricing?: {
    input: string;
    output: string;
    cachedInputTokens?: string;
  };
};

export type ChatModelId = string;

export const DEFAULT_CHAT_MODEL: ChatModelId = chatModels[0].id;

export const chatModelIds = chatModels.map((model) => model.id) as string[];

export const isChatModelId = (candidate?: string): candidate is ChatModelId =>
  chatModelIds.includes(candidate as string);

export const getChatModelById = (id?: string): ChatModel | undefined =>
  chatModels.find((model) => model.id === id);

export const getValidChatModelId = (candidate?: string): ChatModelId =>
  isChatModelId(candidate) ? candidate : DEFAULT_CHAT_MODEL;
