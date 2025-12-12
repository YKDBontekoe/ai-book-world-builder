import { gateway } from "@ai-sdk/gateway";
import {
	convertToModelMessages,
	createUIMessageStream,
	JsonToSseTransformStream,
	smoothStream,
	stepCountIs,
	streamText,
} from "ai";
import { unstable_cache as cache } from "next/cache";

import type { ModelCatalog } from "tokenlens/core";
import { fetchModels } from "tokenlens/fetch";
import { getUsage } from "tokenlens/helpers";
import { auth } from "@/app/(auth)/auth";
import type { VisibilityType } from "@/components/chat/visibility-selector";
import type { ChatModel } from "@/lib/ai/models";
import { myProvider } from "@/lib/ai/providers";
import { analyzeBook } from "@/lib/ai/tools/analyze-book";
import { analyzeCharacter } from "@/lib/ai/tools/analyze-character";
import { assessReadiness } from "@/lib/ai/tools/assess-readiness";
import { createOutline } from "@/lib/ai/tools/create-outline";
// Tools
import { createProject } from "@/lib/ai/tools/create-project";
import { createTimeline } from "@/lib/ai/tools/create-timeline";
import { createVolume } from "@/lib/ai/tools/create-volume";
import { draftScene } from "@/lib/ai/tools/draft-scene";
import { exportBook } from "@/lib/ai/tools/export-book";
import { manageEntities } from "@/lib/ai/tools/manage-entities";
import { manageStory } from "@/lib/ai/tools/manage-story";
import { orchestrateBook } from "@/lib/ai/tools/orchestrate-book";
import { proposeManageEntities } from "@/lib/ai/tools/propose-manage-entities";
import { runDiagnostics } from "@/lib/ai/tools/run-diagnostics";

import { updateSceneCards } from "@/lib/ai/tools/update-scene-cards";
import { isProductionEnvironment } from "@/lib/constants";
import { saveMessages, updateChatLastContextById } from "@/lib/db/queries";
import { ChatSDKError } from "@/lib/errors";
import { initializeChatSession } from "@/lib/services/chat";
import type { ChatMessage } from "@/lib/types";
import type { AppUsage } from "@/lib/usage";
import { generateUUID } from "@/lib/utils";
import { type PostRequestBody, postRequestBodySchema } from "./schema";

export const maxDuration = 60;

const getTokenlensCatalog = cache(
	async (): Promise<ModelCatalog | undefined> => {
		try {
			return await fetchModels();
		} catch (err) {
			console.warn(
				"TokenLens: catalog fetch failed, using default catalog",
				err,
			);
			return; // tokenlens helpers will fall back to defaultCatalog
		}
	},
	["tokenlens-catalog"],
	{ revalidate: 24 * 60 * 60 }, // 24 hours
);

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
		}: {
			id: string;
			message: ChatMessage;
			projectId?: string | null;
			selectedChatModel: ChatModel["id"];
			selectedVisibilityType: VisibilityType;
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
		});

		let finalMergedUsage: AppUsage | undefined;

		const stream = createUIMessageStream({
			execute: ({ writer: dataStream }) => {
				// Stream source citations if we have context metadata
				if (contextMetadata) {
					const citations: Array<{
						type: "entity" | "outline" | "chapter" | "relationship";
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

					// Stream citations to UI
					dataStream.write({ type: "data-sources", data: citations });
				}

				const model = isDynamicModel
					? gateway.languageModel(selectedChatModel)
					: myProvider.languageModel(selectedChatModel);

				const result = streamText({
					model,
					system: groundedSystemPrompt,
					messages: convertToModelMessages(uiMessages),
					stopWhen: stepCountIs(5),
					experimental_activeTools:
						selectedChatModel === "chat-model-reasoning"
							? []
							: [
									"createProject",
									"exportBook",
									"createTimeline",
									"createVolume",
									"createOutline",
									"analyzeCharacter",
									"analyzeBook",

									// Consolidated Managers
									"manageEntities",
									"manageStory",

									// Dynamic Book Pipeline
									"orchestrateBook",
									"updateSceneCards",
									"draftScene",
									"runDiagnostics",
									"assessReadiness",
									"proposeManageEntities",
								],
					experimental_transform: smoothStream({ chunking: "word" }),
					tools: {
						createProject: createProject({ session }),
						exportBook: exportBook({
							session,
							projectId: projectId ?? undefined,
						}),
						manageEntities: manageEntities({
							session,
							projectId: projectId ?? undefined,
						}),
						manageStory: manageStory({
							session,
							projectId: projectId ?? undefined,
						}),
						createOutline: createOutline({
							session,
							projectId: projectId ?? undefined,
						}),
						createTimeline: createTimeline({
							session,
							projectId: projectId ?? undefined,
						}),
						createVolume: createVolume({
							session,
							projectId: projectId ?? undefined,
						}),
						analyzeCharacter: analyzeCharacter({ session }),
						analyzeBook: analyzeBook({
							session,
							projectId: projectId ?? undefined,
						}),
						// Dynamic Pipeline Tools
						orchestrateBook: orchestrateBook({ dataStream }),
						draftScene: draftScene({ session }),
						updateSceneCards: updateSceneCards({ session }),
						runDiagnostics: runDiagnostics({ session }),
						assessReadiness: assessReadiness({
							session,
							projectId: projectId ?? undefined,
						}),
						proposeManageEntities: proposeManageEntities(),
					},
					experimental_telemetry: {
						isEnabled: isProductionEnvironment,
						functionId: "stream-text",
					},
					onFinish: async ({ usage }) => {
						try {
							const providers = await getTokenlensCatalog();
							let modelId = selectedChatModel;

							if (!isDynamicModel) {
								try {
									modelId = myProvider.languageModel(selectedChatModel).modelId;
								} catch (_error) {
									// ignore
								}
							}

							if (!modelId) {
								finalMergedUsage = usage;
								dataStream.write({
									type: "data-usage",
									data: finalMergedUsage,
								});
								return;
							}

							if (!providers) {
								finalMergedUsage = usage;
								dataStream.write({
									type: "data-usage",
									data: finalMergedUsage,
								});
								return;
							}

							const summary = getUsage({ modelId, usage, providers });
							finalMergedUsage = { ...usage, ...summary, modelId } as AppUsage;
							dataStream.write({ type: "data-usage", data: finalMergedUsage });
						} catch (err) {
							console.warn("TokenLens enrichment failed", err);
							finalMergedUsage = usage;
							dataStream.write({ type: "data-usage", data: finalMergedUsage });
						}
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
				await saveMessages({
					messages: messages.map((currentMessage) => ({
						id: currentMessage.id,
						role: currentMessage.role,
						parts: currentMessage.parts,
						createdAt: new Date(),
						attachments: [],
						chatId: id,
						usage:
							(currentMessage.role === "assistant" ? finalMergedUsage : null) ??
							null,
					})),
				});

				if (finalMergedUsage) {
					try {
						await updateChatLastContextById({
							chatId: id,
							context: finalMergedUsage,
						});
					} catch (err) {
						console.warn("Unable to persist last usage for chat", id, err);
					}
				}
			},
			onError: () => {
				return "Oops, an error occurred!";
			},
		});

		// const streamContext = getStreamContext();

		// if (streamContext) {
		//   return new Response(
		//     await streamContext.resumableStream(streamId, () =>
		//       stream.pipeThrough(new JsonToSseTransformStream())
		//     )
		//   );
		// }

		return new Response(stream.pipeThrough(new JsonToSseTransformStream()));
	} catch (error) {
		const vercelId = request.headers.get("x-vercel-id");

		if (error instanceof ChatSDKError) {
			return error.toResponse();
		}

		// Check for Vercel AI Gateway credit card error
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
