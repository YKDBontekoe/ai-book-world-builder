import { geolocation } from "@vercel/functions";
import { eq } from "drizzle-orm";
import type { UserType } from "@/app/(auth)/auth";
import { generateTitleFromUserMessage } from "@/app/(chat)/actions";
import { getAvailableModels } from "@/app/actions/settings";
import type { VisibilityType } from "@/components/organisms/chat/visibility-selector";
import { entitlementsByUserType } from "@/lib/ai/entitlements";
import { type ChatModel, getChatModelById } from "@/lib/ai/models";
import { type RequestHints, systemPrompt } from "@/lib/ai/prompts";
import {
	createStreamId,
	db,
	getAttributesForProject,
	getChaptersForProject,
	getChatById,
	getEntitiesForProject,
	getMessageCountByUserId,
	getMessagesByChatId,
	getOutlineForProject,
	getProjectByIdWithAccess,
	getRelationshipsForProject,
	saveChat,
	saveMessages,
} from "@/lib/db/queries";
import type { DBMessage } from "@/lib/db/schema";
import { chapter as chapters, scene as scenes } from "@/lib/db/schema";
import { ChatSDKError } from "@/lib/errors";
import { buildProjectContext } from "@/lib/project-context";
import type { ChatMessage } from "@/lib/types";
import { convertToUIMessages, generateUUID } from "@/lib/utils";

export async function initializeChatSession({
	id,
	message,
	projectId,
	selectedChatModel,
	selectedVisibilityType,
	user,
	request,
	activeSceneId,
}: {
	id: string;
	message: ChatMessage;
	projectId?: string | null;
	selectedChatModel: ChatModel["id"];
	selectedVisibilityType: VisibilityType;
	user: { id: string; type: UserType };
	request: Request;
	activeSceneId?: string;
}) {
	// 1. Entitlements Check
	const userType: UserType = user.type;
	const messageCount = await getMessageCountByUserId({
		id: user.id,
		differenceInHours: 24,
	});

	if (messageCount > entitlementsByUserType[userType].maxMessagesPerDay) {
		throw new ChatSDKError("rate_limit:chat");
	}

	// 2. Model Validation
	const availableModelsResult = await getAvailableModels();
	const availableModels = availableModelsResult.success
		? availableModelsResult.data
		: [];

	const isDynamicModel = availableModels.some(
		(m: any) => m.id === selectedChatModel,
	);

	let chatModel = await getChatModelById(selectedChatModel);

	if (!chatModel && isDynamicModel) {
		const dynamicModel = availableModels.find(
			(m: any) => m.id === selectedChatModel,
		);
		if (dynamicModel) {
			const contextLength =
				dynamicModel.contextLength ?? (dynamicModel as any).context_length ?? 0;
			chatModel = {
				id: dynamicModel.id,
				name: dynamicModel.name,
				provider: "OpenRouter",
				gatewayId: dynamicModel.id,
				description: `Context: ${contextLength}`,
				supportsImages: true,
				contextLength: contextLength,
			};
		}
	}

	if (!chatModel && ["light", "middle", "large"].includes(selectedChatModel)) {
		chatModel = {
			id: selectedChatModel,
			name: selectedChatModel,
			provider: "OpenRouter",
			gatewayId: selectedChatModel,
			description: "Virtual Model",
			supportsImages: true,
			contextLength: 32000,
		};
	}

	if (!chatModel) {
		throw new ChatSDKError(
			"bad_request:api",
			`Unknown chat model: ${selectedChatModel}`,
		);
	}

	const containsFileAttachments = message.parts.some(
		(part) => part.type === "file",
	);

	if (containsFileAttachments && !chatModel.supportsImages) {
		throw new ChatSDKError(
			"bad_request:api",
			"Image uploads require a vision-enabled model.",
		);
	}

	// 3. Project & Scene Context Building
	let projectContext: string | undefined;
	let sceneContext: string | undefined;

	let contextMetadata:
		| {
				entities: Awaited<ReturnType<typeof getEntitiesForProject>>;
				outline: Awaited<ReturnType<typeof getOutlineForProject>> | undefined;
				chapters: Awaited<ReturnType<typeof getChaptersForProject>> | undefined;
				relationships: Awaited<ReturnType<typeof getRelationshipsForProject>>;
				activeSceneId?: string;
		  }
		| undefined;

	if (projectId) {
		const project = await getProjectByIdWithAccess({
			id: projectId,
			userId: user.id,
		});

		if (!project) {
			throw new ChatSDKError("forbidden:chat", "Project unavailable");
		}

		const [allEntities, attributes, relationships, outline, chaptersData] =
			await Promise.all([
				getEntitiesForProject({ projectId }),
				getAttributesForProject({ projectId }),
				getRelationshipsForProject({ projectId }),
				getOutlineForProject({ projectId }),
				getChaptersForProject({ projectId }),
			]);

		let selectedEntities = allEntities;

		if (allEntities.length > 20) {
			const { retrieveContext } = await import("@/lib/ai/rag");
			const userMessageText = message.parts
				.filter((part) => part.type === "text")
				.map((part) => ("text" in part ? part.text : ""))
				.join(" ");

			const entityCandidates = allEntities.map(
				(entity: (typeof allEntities)[number]) => ({
					content: `${entity.name} (${entity.kind}): ${entity.summary ?? ""}`,
					metadata: { entityId: entity.id },
				}),
			);

			const relevantChunks = await retrieveContext({
				query: userMessageText,
				candidates: entityCandidates,
				topK: 20,
			});

			const relevantEntityIds = new Set(
				relevantChunks.map((chunk) => chunk.metadata.entityId as string),
			);
			selectedEntities = allEntities.filter(
				(entity: (typeof allEntities)[number]) =>
					relevantEntityIds.has(entity.id),
			);
		}

		// --- Active Scene Context with Strict Authorization ---
		if (activeSceneId) {
			try {
				// Verify scene belongs to the project
				// We do this by checking if the scene's chapter belongs to the project
				// This prevents IDOR where a user requests a scene from another project
				const sceneCheck = await db
					.select({
						sceneId: scenes.id,
						content: scenes.content,
						title: scenes.title,
						projectId: chapters.projectId,
					})
					.from(scenes)
					.innerJoin(chapters, eq(scenes.chapterId, chapters.id))
					.where(eq(scenes.id, activeSceneId))
					.limit(1);

				if (sceneCheck.length > 0) {
					const scene = sceneCheck[0];
					if (scene.projectId === projectId) {
						if (scene.content) {
							sceneContext = `\n\nActive Scene Context:\nTitle: ${scene.title}\nContent:\n${scene.content}`;
						}
					} else {
						console.warn(
							`IDOR prevention: activeSceneId ${activeSceneId} does not belong to projectId ${projectId}`,
						);
					}
				}
			} catch (e) {
				console.warn("Failed to fetch active scene context", e);
			}
		}
		// -----------------------------

		projectContext = buildProjectContext({
			project,
			entities: selectedEntities,
			attributes,
			relationships,
			outline: outline
				? { title: outline.title, summary: outline.summary }
				: undefined,
			chapters: chaptersData?.map((ch: (typeof chaptersData)[number]) => ({
				sequence: ch.sequence,
				title: ch.title,
				notes: ch.notes,
			})),
		});

		contextMetadata = {
			entities: selectedEntities,
			outline,
			chapters: chaptersData,
			relationships,
			activeSceneId,
		};
	}

	// 4. Persistence & Transaction
	let messagesFromDb: DBMessage[] = [];
	const streamId = generateUUID();

	const existingChat = await getChatById({ id });

	await db.transaction(async (tx: any) => {
		if (existingChat) {
			if (existingChat.userId !== user.id) {
				throw new ChatSDKError("forbidden:chat");
			}
		} else {
			const title = await generateTitleFromUserMessage({
				message,
			});

			await saveChat({
				id,
				userId: user.id,
				title,
				visibility: selectedVisibilityType,
				tx,
			});
		}

		await saveMessages({
			messages: [
				{
					chatId: id,
					id: message.id,
					role: "user",
					parts: message.parts,
					attachments: [],
					usage: null,
					createdAt: new Date(),
				},
			],
			tx,
		});

		await createStreamId({ streamId, chatId: id, tx });
	});

	if (existingChat) {
		messagesFromDb = await getMessagesByChatId({ id });
	}

	// 5. Prepare System Prompt & UI Messages
	const uiMessages = [...convertToUIMessages(messagesFromDb), message];

	const { longitude, latitude, city, country } = geolocation(request);

	const requestHints: RequestHints = {
		longitude,
		latitude,
		city,
		country,
	};

	const baseSystemPrompt = systemPrompt({
		selectedChatModel,
		requestHints,
		hasProjectContext: Boolean(projectContext),
		usesStoryTools: Boolean(projectId),
	});

	// Merge Project Context AND Scene Context
	let groundedSystemPrompt = baseSystemPrompt;

	if (projectContext) {
		groundedSystemPrompt += `\n\nProject context:\n${projectContext}`;
	}

	if (sceneContext) {
		groundedSystemPrompt += sceneContext;
	}

	return {
		uiMessages,
		groundedSystemPrompt,
		isDynamicModel,
		streamId,
		contextMetadata,
	};
}
