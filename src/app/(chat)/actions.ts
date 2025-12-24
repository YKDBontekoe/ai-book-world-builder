"use server";

import { generateText, type UIMessage } from "ai";
import { cookies } from "next/headers";
import { auth } from "@/app/(auth)/auth";
import type { VisibilityType } from "@/components/organisms/chat/visibility-selector";
import {
	type ChatModelId,
	DEFAULT_MODELS,
	getValidChatModelId,
} from "@/lib/ai/models";
import { titlePrompt } from "@/lib/ai/prompts";
import { myProvider } from "@/lib/ai/providers";
import { getFullProjectDataForGeneration } from "@/lib/book-generation";
import {
	deleteMessagesByChatIdAfterTimestamp,
	getChatById,
	getMessageById,
	updateChatVisibilityById,
} from "@/lib/db/queries";
import { getTextFromMessage } from "@/lib/utils";

export async function getProjectStats(projectId: string) {
	const session = await auth();
	if (!session?.user) return null;

	const data = await getFullProjectDataForGeneration({
		projectId,
		userId: session.user.id,
	});

	if (!data) return null;

	return {
		characters: data.entities.filter((e) => e.kind === "character").length,
		locations: data.entities.filter((e) => e.kind === "location").length,
		items: data.entities.filter((e) => e.kind === "item").length,
		organizations: data.entities.filter((e) => e.kind === "organization")
			.length,
		events: data.entities.filter((e) => e.kind === "event").length,
		outlines: data.outlines.length,
		chapters: data.volumes.flatMap((v) => v.chapters).length,
	};
}

export async function saveChatModelAsCookie(model: string | ChatModelId) {
	const cookieStore = await cookies();
	cookieStore.set("chat-model", getValidChatModelId(model));
}

export async function generateTitleFromUserMessage({
	message,
}: {
	message: UIMessage;
}) {
	const { text: title } = await generateText({
		model: myProvider.languageModel(DEFAULT_MODELS.light),
		system: titlePrompt,
		prompt: getTextFromMessage(message),
	});

	return title;
}

/**
 * Deletes all messages created at or after the given message within a chat the
 * authenticated user owns.
 */
export async function deleteTrailingMessages({ id }: { id: string }) {
	const session = await auth();
	if (!session?.user) {
		throw new Error("Unauthorized");
	}

	const [message] = await getMessageById({ id });
	if (!message) {
		throw new Error("Message not found");
	}

	const chat = await getChatById({ id: message.chatId });
	if (!chat) {
		throw new Error("Chat not found");
	}

	if (chat.userId !== session.user.id) {
		throw new Error("Forbidden");
	}

	await deleteMessagesByChatIdAfterTimestamp({
		chatId: message.chatId,
		timestamp: message.createdAt,
	});
}

/**
 * Updates the visibility for a chat owned by the authenticated user.
 */
export async function updateChatVisibility({
	chatId,
	visibility,
}: {
	chatId: string;
	visibility: VisibilityType;
}) {
	const session = await auth();
	if (!session?.user) {
		throw new Error("Unauthorized");
	}

	const chat = await getChatById({ id: chatId });
	if (!chat) {
		throw new Error("Chat not found");
	}

	if (chat.userId !== session.user.id) {
		throw new Error("Forbidden");
	}

	await updateChatVisibilityById({ chatId, visibility });
}
