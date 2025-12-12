import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

import { auth } from "@/app/(auth)/auth";
import { getAvailableChatModels } from "@/app/actions/models";
import { ChatPageContent } from "@/components/chat-page-content";
import { DEFAULT_CHAT_MODEL, getValidChatModelId } from "@/lib/ai/models";
import {
	getChatById,
	getMessagesByChatId,
	getProjectsVisibleToUser,
} from "@/lib/db/queries";
import { getUserPreferences } from "@/lib/db/queries/user-preferences";
import { serializeProject } from "@/lib/project-context";
import { convertToUIMessages } from "@/lib/utils";

export default function Page(props: { params: Promise<{ id: string }> }) {
	return (
		<Suspense fallback={<div className="flex h-dvh" />}>
			<ChatPage params={props.params} />
		</Suspense>
	);
}

async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;

	if (!id) {
		notFound();
	}

	const session = await auth();

	if (!session) {
		redirect("/api/auth/guest");
	}

	/*
	 * Fetch chat data and valid user projects
	 */
	const [chat, projects, availableModels, userPrefs] = await Promise.all([
		getChatById({ id }),
		getProjectsVisibleToUser({ userId: session.user.id }),
		getAvailableChatModels(),
		getUserPreferences(session.user.id),
	]);

	if (!chat) {
		notFound();
	}

	if (chat.visibility === "private") {
		if (!session.user) {
			return notFound();
		}

		if (session.user.id !== chat.userId) {
			return notFound();
		}
	}

	const messagesFromDb = await getMessagesByChatId({
		id,
	});

	const uiMessages = convertToUIMessages(messagesFromDb);

	const cookieStore = await cookies();
	const chatModelFromCookie = cookieStore.get("chat-model");

	let modelIdToUse: string | undefined;

	// 1. Try first favorite
	if (userPrefs.favoriteModels.length > 0) {
		modelIdToUse = userPrefs.favoriteModels[0];
	}

	// 2. If no favorite, try cookie
	if (!modelIdToUse && chatModelFromCookie?.value) {
		modelIdToUse = chatModelFromCookie.value;
	}

	// 3. Fallback to default
	const initialChatModel = getValidChatModelId(
		modelIdToUse || DEFAULT_CHAT_MODEL,
	);

	console.log("[ChatPage] Model Selection Debug:", {
		userId: session.user.id,
		favorites: userPrefs.favoriteModels,
		cookie: chatModelFromCookie?.value,
		resolvedModel: modelIdToUse,
		finalModel: initialChatModel,
	});

	const serializedProjects = projects.map(serializeProject);

	return (
		<ChatPageContent
			autoResume={true}
			availableModels={availableModels}
			id={chat.id}
			initialChatModel={initialChatModel}
			initialLastContext={chat.lastContext ?? undefined}
			initialMessages={uiMessages}
			initialProjectId={undefined}
			initialProjects={serializedProjects}
			initialVisibilityType={chat.visibility}
			isReadonly={session?.user?.id !== chat.userId}
		/>
	);
}
