export type ChatModel = {
  id: string;
  name: string;
  provider: string;
  gatewayId: string;
  description: string;
  supportsImages: boolean;
  reasoning?: boolean;
  pricing?: {
    input: string;
    output: string;
    cachedInputTokens?: string;
  };
};

export const chatModels: readonly ChatModel[] = [
  {
    id: "anthropic-claude-opus-4-5",
    name: "Claude Opus 4.5",
    provider: "Anthropic",
    gatewayId: "anthropic/claude-opus-4-5-latest",
    description: "The Brain. Best for long-horizon planning and orchestration.",
    supportsImages: true,
  },
  {
    id: "anthropic-claude-sonnet-4-5",
    name: "Claude Sonnet 4.5",
    provider: "Anthropic",
    gatewayId: "anthropic/claude-sonnet-4-5-latest",
    description: "The Writer. Warm tone, high speed, perfect for drafting.",
    supportsImages: true,
  },
  {
    id: "deepseek-reasoner",
    name: "DeepSeek V3 (Reasoner)",
    provider: "DeepSeek",
    gatewayId: "deepseek/deepseek-reasoner",
    description:
      "The Logic Check. Chain-of-thought processing for diagnostics.",
    supportsImages: false,
    reasoning: true,
  },
  {
    id: "google-gemini-3-pro",
    name: "Gemini 3 Pro",
    provider: "Google",
    gatewayId: "google/gemini-3-pro-preview",
    description:
      "The Context Bank. 2M+ token context window for full retrieval.",
    supportsImages: true,
  },
  {
    id: "openai-gpt-4o-mini",
    name: "GPT-4o mini",
    provider: "OpenAI",
    gatewayId: "openai/gpt-4o-mini",
    description: "Fast, cost-effective multimodal model with image support",
    supportsImages: true,
  },
  {
    id: "openai-gpt-5-mini",
    name: "GPT-5 mini",
    provider: "OpenAI",
    gatewayId: "openai/gpt-5-mini",
    description: "Next-gen mini model with enhanced reasoning capabilities",
    supportsImages: true,
  },
];

export type ChatModelId = string;

export const DEFAULT_CHAT_MODEL: ChatModelId = "openai-gpt-5-mini";

export const chatModelIds = chatModels.map((model) => model.id) as string[];

export const isChatModelId = (candidate?: string): candidate is ChatModelId =>
  chatModelIds.includes(candidate as string);

export const getChatModelById = (id?: string): ChatModel | undefined =>
  chatModels.find((model) => model.id === id);

export const getValidChatModelId = (candidate?: string): ChatModelId =>
  isChatModelId(candidate) ? candidate : DEFAULT_CHAT_MODEL;
