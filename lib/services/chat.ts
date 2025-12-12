import { geolocation } from "@vercel/functions";
import type { UserType } from "@/app/(auth)/auth";
import { generateTitleFromUserMessage } from "@/app/(chat)/actions";
import { getAvailableChatModels } from "@/app/actions/models";
import type { VisibilityType } from "@/components/chat/visibility-selector";
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
}: {
	id: string;
	message: ChatMessage;
	projectId?: string | null;
	selectedChatModel: ChatModel["id"];
	selectedVisibilityType: VisibilityType;
	user: { id: string; type: UserType };
	request: Request;
}) {
	// 1. Entitlements Check
	const userType: UserType = user.type;
	const { availableChatModelIds } = entitlementsByUserType[userType];

	const messageCount = await getMessageCountByUserId({
		id: user.id,
		differenceInHours: 24,
	});

	if (messageCount > entitlementsByUserType[userType].maxMessagesPerDay) {
		throw new ChatSDKError("rate_limit:chat");
	}

	// 2. Model Validation
	const availableModels = await getAvailableChatModels();
	const isDynamicModel = availableModels.some(
		(m: ChatModel) => m.id === selectedChatModel,
	);

	if (!availableChatModelIds.includes(selectedChatModel) && !isDynamicModel) {
		throw new ChatSDKError(
			"forbidden:chat",
			"This model is not available for your account.",
		);
	}

	let chatModel = getChatModelById(selectedChatModel);

	if (!chatModel && isDynamicModel) {
		const dynamicModel = availableModels.find(
			(m: ChatModel) => m.id === selectedChatModel,
		);
		if (dynamicModel) {
			chatModel = dynamicModel;
		}
	}

	if (!chatModel) {
		throw new ChatSDKError("bad_request:api", "Unknown chat model.");
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

	// 3. Project Context Building
	let projectContext: string | undefined;
	let contextMetadata:
		| {
				entities: Awaited<ReturnType<typeof getEntitiesForProject>>;
				outline: Awaited<ReturnType<typeof getOutlineForProject>> | undefined;
				chapters: Awaited<ReturnType<typeof getChaptersForProject>> | undefined;
				relationships: Awaited<ReturnType<typeof getRelationshipsForProject>>;
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

		const [allEntities, attributes, relationships, outline, chapters] =
			await Promise.all([
				getEntitiesForProject({ projectId }),
				getAttributesForProject({ projectId }),
				getRelationshipsForProject({ projectId }),
				getOutlineForProject({ projectId }),
				getChaptersForProject({ projectId }),
			]);

		// RAG-based entity selection: if we have many entities, select the most relevant ones
		let selectedEntities = allEntities;

		if (allEntities.length > 20) {
			// Import RAG utility
			const { retrieveContext } = await import("@/lib/ai/rag");

			// Extract text from user message
			const userMessageText = message.parts
				.filter((part) => part.type === "text")
				.map((part) => ("text" in part ? part.text : ""))
				.join(" ");

			// Build candidates from entities
			const entityCandidates = allEntities.map(
				(entity: (typeof allEntities)[number]) => ({
					content: `${entity.name} (${entity.kind}): ${entity.summary ?? ""}`,
					metadata: { entityId: entity.id },
				}),
			);

			// Retrieve top 20 most relevant entities
			const relevantChunks = await retrieveContext({
				query: userMessageText,
				candidates: entityCandidates,
				topK: 20,
			});

			// Map back to entities
			const relevantEntityIds = new Set(
				relevantChunks.map((chunk) => chunk.metadata.entityId as string),
			);
			selectedEntities = allEntities.filter(
				(entity: (typeof allEntities)[number]) =>
					relevantEntityIds.has(entity.id),
			);
		}

		projectContext = buildProjectContext({
			project,
			entities: selectedEntities,
			attributes,
			relationships,
			outline: outline
				? { title: outline.title, summary: outline.summary }
				: undefined,
			chapters: chapters?.map((ch: (typeof chapters)[number]) => ({
				sequence: ch.sequence,
				title: ch.title,
				notes: ch.notes,
			})),
		});

		// Store context metadata for citation streaming
		contextMetadata = {
			entities: selectedEntities,
			outline,
			chapters,
			relationships,
		};
	}

	// 4. Persistence & Transaction
	let messagesFromDb: DBMessage[] = [];
	const streamId = generateUUID();

	// Fetch existing chat outside transaction to avoid unnecessary locking if just reading
	const existingChat = await getChatById({ id });

	await db.transaction(async (tx) => {
		if (existingChat) {
			if (existingChat.userId !== user.id) {
				throw new ChatSDKError("forbidden:chat");
			}
			// If chat exists, we get previous messages
			// We will fetch them afterward to ensure consistency or just reading is fine
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

	// Fetch messages again if existing (or use what we have).
	// Optimization: If existingChat is true, we need messages.
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

	const groundedSystemPrompt = projectContext
		? `${baseSystemPrompt}\n\nProject context:\n${projectContext}`
		: baseSystemPrompt;

	return {
		uiMessages,
		groundedSystemPrompt,
		isDynamicModel,
		streamId,
		contextMetadata, // Citation data for streaming to UI
	};
}
