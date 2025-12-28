import {
	convertToModelMessages,
	createUIMessageStream,
	JsonToSseTransformStream,
	smoothStream,
	stepCountIs,
	streamText,
	type LanguageModel,
} from "ai";
import { auth } from "@/app/(auth)/auth";
import {
	type PostRequestBody,
	postRequestBodySchema,
} from "@/app/(chat)/api/chat/schema";
import type { VisibilityType } from "@/components/organisms/chat/visibility-selector";
import type { ChatModel } from "@/lib/ai/models";
import { getSelectedModelId } from "@/lib/ai/models";
import { myProvider } from "@/lib/ai/providers";
import { getAgentTools, toolList } from "@/lib/ai/tool-registry";
import { enrichUsage, persistChat } from "@/lib/ai/usage-tracking";
import { isProductionEnvironment } from "@/lib/constants";
import { ChatSDKError } from "@/lib/errors";
import { initializeChatSession } from "@/lib/services/chat";
import type { ChatMessage } from "@/lib/types";
import type { AppUsage } from "@/lib/usage";
import { generateUUID } from "@/lib/utils";

export const maxDuration = 60;

export async function POST(request: Request) {
	let requestBody: PostRequestBody;

	try {
		const json = await request.json();
		requestBody = postRequestBodySchema.parse(json);
	} catch (_) {
		return new ChatSDKError("bad_request:api").toResponse();
	}

	try {
		const {
			id,
			message,
			projectId,
			selectedChatModel,
			selectedVisibilityType,
			activeSceneId,
		}: {
			id: string;
			message: ChatMessage;
			projectId?: string | null;
			selectedChatModel: ChatModel["id"];
			selectedVisibilityType: VisibilityType;
			activeSceneId?: string;
		} = requestBody;

		const session = await auth();

		if (!session?.user) {
			return new ChatSDKError("unauthorized:chat").toResponse();
		}

		// Initialize chat session using the service
		const {
			uiMessages,
			groundedSystemPrompt,
			isDynamicModel,
			contextMetadata,
		} = await initializeChatSession({
			id,
			message,
			projectId,
			selectedChatModel,
			selectedVisibilityType,
			user: session.user,
			request,
			activeSceneId,
		});

		let finalMergedUsage: AppUsage | undefined;

		const stream = createUIMessageStream({
			execute: async ({ writer: dataStream }) => {
				// Stream source citations if we have context metadata
				if (contextMetadata) {
					const citations: Array<{
						type: "entity" | "outline" | "chapter" | "relationship" | "scene";
						id: string;
						name: string;
						kind?: string;
					}> = [];

					// Add entities
					for (const entity of contextMetadata.entities) {
						citations.push({
							type: "entity",
							id: entity.id,
							name: entity.name,
							kind: entity.kind,
						});
					}

					// Add outline if present
					if (contextMetadata.outline) {
						citations.push({
							type: "outline",
							id: contextMetadata.outline.id,
							name: contextMetadata.outline.title,
						});
					}

					// Add chapters if present
					if (contextMetadata.chapters) {
						for (const chapter of contextMetadata.chapters) {
							citations.push({
								type: "chapter",
								id: chapter.id,
								name: chapter.title,
							});
						}
					}

					// Add relationships (limit to 10 most relevant)
					for (const rel of contextMetadata.relationships.slice(0, 10)) {
						citations.push({
							type: "relationship",
							id: rel.id,
							name: `${rel.type}`,
						});
					}

					// Add Active Scene
					if (contextMetadata.activeSceneId) {
						citations.push({
							type: "scene",
							id: contextMetadata.activeSceneId,
							name: "Active Scene Context",
						});
					}

					// Stream citations to UI
					dataStream.write({ type: "data-sources", data: citations });
				}

				let targetModelId = selectedChatModel;
				if (["light", "middle", "large"].includes(selectedChatModel)) {
					targetModelId = await getSelectedModelId(
						selectedChatModel as "light" | "middle" | "large",
					);
				}

				if (!targetModelId) {
					targetModelId = await getSelectedModelId("middle");
				}

				const model = myProvider.languageModel(targetModelId) as LanguageModel;

				const result = streamText({
					model,
					system: groundedSystemPrompt,
					messages: convertToModelMessages(uiMessages),
					stopWhen: stepCountIs(5),
					experimental_activeTools:
						selectedChatModel === "chat-model-reasoning" ? [] : toolList,
					experimental_transform: smoothStream({ chunking: "word" }),
					tools: getAgentTools({
						session,
						projectId,
						dataStream,
					}),
					experimental_telemetry: {
						isEnabled: isProductionEnvironment,
						functionId: "stream-text",
					},
					onFinish: async ({ usage }) => {
						finalMergedUsage = await enrichUsage({
							usage,
							selectedChatModel: targetModelId,
							isDynamicModel,
						});
						dataStream.write({ type: "data-usage", data: finalMergedUsage });
					},
				});

				result.consumeStream();

				dataStream.merge(
					result.toUIMessageStream({
						sendReasoning: true,
					}),
				);
			},
			generateId: generateUUID,
			onFinish: async ({ messages }) => {
				await persistChat({
					chatId: id,
					messages,
					finalUsage: finalMergedUsage,
				});
			},
			onError: () => {
				return "Oops, an error occurred!";
			},
		});

		return new Response(stream.pipeThrough(new JsonToSseTransformStream()));
	} catch (error) {
		const vercelId = request.headers.get("x-vercel-id");

		if (error instanceof ChatSDKError) {
			return error.toResponse();
		}

		if (
			error instanceof Error &&
			error.message?.includes(
				"AI Gateway requires a valid credit card on file to service requests",
			)
		) {
			return new ChatSDKError("bad_request:activate_gateway").toResponse();
		}

		console.error("Unhandled error in chat API:", error, { vercelId });
		return new ChatSDKError("offline:chat").toResponse();
	}
}
