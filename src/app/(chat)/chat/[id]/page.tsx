import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

import { auth } from "@/app/(auth)/auth";
import { getAvailableChatModels } from "@/app/actions/models";
import { ChatPageContent } from "@/components/organisms/chat-page-content";
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
		<Suspense fallback={<div className="flex h-dvh bg-background" />}>
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
		redirect("/login");
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

	// Filter available models based on user preferences (Light, Middle, Large)
	const selectedModelIds = [
		userPrefs.modelPreferences?.light,
		userPrefs.modelPreferences?.middle,
		userPrefs.modelPreferences?.large,
	].filter(Boolean) as string[];

	// If user has selected models in settings, only show those
	// Otherwise fallback to all available models
	let filteredAvailableModels = availableModels;

	if (selectedModelIds.length > 0) {
		filteredAvailableModels = availableModels.filter((model) =>
			selectedModelIds.includes(model.id),
		);
	}

	// Ensure we don't end up with empty list if IDs don't match available models for some reason
	if (filteredAvailableModels.length === 0) {
		filteredAvailableModels = availableModels;
	}

	let modelIdToUse: string | undefined;

	// 0. Try to use one of the filtered models if current preference/cookie is not in the list
	// This logic ensures we default to one of the "selected" models if possible

	// 1. Try first favorite
	if (userPrefs.favoriteModels.length > 0) {
		modelIdToUse = userPrefs.favoriteModels[0];
	}

	// 2. If no favorite, try cookie
	if (!modelIdToUse && chatModelFromCookie?.value) {
		modelIdToUse = chatModelFromCookie.value;
	}

	// 3. If still no model, try the "middle" preference explicitly (default for chat)
	if (!modelIdToUse && userPrefs.modelPreferences?.middle) {
		modelIdToUse = userPrefs.modelPreferences.middle;
	}

	// 4. Ensure the selected model is actually in the filtered list.
	// If not, pick the first one from filtered list (which is the user's preference)
	if (
		modelIdToUse &&
		!filteredAvailableModels.find((m) => m.id === modelIdToUse)
	) {
		if (filteredAvailableModels.length > 0) {
			modelIdToUse = filteredAvailableModels[0].id;
		}
	}

	// 5. Fallback to default (and ensure it's valid)
	// Note: getValidChatModelId might return something not in our filtered list if we are not careful,
	// but filteredAvailableModels[0] should be valid if the list is not empty.
	const initialChatModel =
		modelIdToUse || filteredAvailableModels[0]?.id || DEFAULT_CHAT_MODEL;

	console.log("[ChatPage] Model Selection Debug:", {
		userId: session.user.id,
		favorites: userPrefs.favoriteModels,
		selectedModelPreferences: selectedModelIds,
		cookie: chatModelFromCookie?.value,
		resolvedModel: modelIdToUse,
		finalModel: initialChatModel,
		filteredCount: filteredAvailableModels.length,
	});

	const serializedProjects = projects.map(serializeProject);

	return (
		<ChatPageContent
			autoResume={true}
			availableModels={filteredAvailableModels}
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
