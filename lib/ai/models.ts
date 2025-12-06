export const chatModels = [
  {
    id: "chat-model",
    name: "Grok Vision",
    description: "Advanced multimodal model with vision and text capabilities",
    supportsImages: true,
  },
  {
    id: "chat-model-lite",
    name: "Grok Lite",
    description: "Lower-cost text model for faster, everyday conversations",
    supportsImages: false,
  },
  {
    id: "chat-model-reasoning",
    name: "Grok Reasoning",
    description:
      "Uses advanced chain-of-thought reasoning for complex problems",
    supportsImages: false,
  },
] as const;

export type ChatModel = (typeof chatModels)[number];
export type ChatModelId = ChatModel["id"];

export const DEFAULT_CHAT_MODEL: ChatModelId = chatModels[0].id;

export const chatModelIds = chatModels.map((model) => model.id) as readonly [
  ChatModelId,
  ...ChatModelId[],
];

export const isChatModelId = (candidate?: string): candidate is ChatModelId =>
  chatModelIds.includes(candidate as ChatModelId);

export const getChatModelById = (id?: string): ChatModel | undefined =>
  chatModels.find((model) => model.id === id);

export const getValidChatModelId = (candidate?: string): ChatModelId =>
  isChatModelId(candidate) ? candidate : DEFAULT_CHAT_MODEL;
