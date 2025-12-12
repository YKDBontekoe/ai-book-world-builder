"use server";

import { generateText, type UIMessage } from "ai";
import { cookies } from "next/headers";
import { auth } from "@/app/(auth)/auth";
import type { VisibilityType } from "@/components/chat/visibility-selector";
import { type ChatModelId, getValidChatModelId } from "@/lib/ai/models";
import { titlePrompt } from "@/lib/ai/prompts";
import { myProvider } from "@/lib/ai/providers";
import { getFullProjectDataForGeneration } from "@/lib/book-generation";
import {
	deleteMessagesByChatIdAfterTimestamp,
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
		model: myProvider.languageModel("title-model"),
		system: titlePrompt,
		prompt: getTextFromMessage(message),
	});

	return title;
}

export async function deleteTrailingMessages({ id }: { id: string }) {
	const [message] = await getMessageById({ id });

	await deleteMessagesByChatIdAfterTimestamp({
		chatId: message.chatId,
		timestamp: message.createdAt,
	});
}

export async function updateChatVisibility({
	chatId,
	visibility,
}: {
	chatId: string;
	visibility: VisibilityType;
}) {
	await updateChatVisibilityById({ chatId, visibility });
}
