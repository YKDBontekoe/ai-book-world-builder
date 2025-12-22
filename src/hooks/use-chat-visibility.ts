"use client";

import {
	type InfiniteData,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { useMemo } from "react";
import { updateChatVisibility } from "@/app/(chat)/actions";
import type { VisibilityType } from "@/components/organisms/chat/visibility-selector";
import type { ChatHistory } from "@/components/organisms/sidebar/sidebar-history";
import { GC_TIMES, QUERY_KEYS, STALE_TIMES } from "@/lib/query-options";

export function useChatVisibility({
	chatId,
	initialVisibilityType,
}: {
	chatId: string;
	initialVisibilityType: VisibilityType;
}) {
	const queryClient = useQueryClient();

	// Access history from cache
	// We use generic undefined check because the query might not have run yet
	const historyData = queryClient.getQueryData<InfiniteData<ChatHistory>>(
		QUERY_KEYS.chatHistory(),
	);

	const { data: localVisibility } = useQuery({
		queryKey: QUERY_KEYS.chatVisibility(chatId),
		queryFn: () => initialVisibilityType,
		enabled: false,
		staleTime: STALE_TIMES.LOCAL,
		gcTime: GC_TIMES.LOCAL,
		initialData: initialVisibilityType,
	});

	const visibilityType = useMemo(() => {
		if (!historyData) {
			return localVisibility ?? "private";
		}

		// Flatten pages to find the chat
		const allChats = historyData.pages.flatMap((page) => page.chats);
		const chat = allChats.find((currentChat) => currentChat.id === chatId);

		if (!chat) {
			return "private";
		}
		return chat.visibility;
	}, [historyData, chatId, localVisibility]);

	const setVisibilityType = (updatedVisibilityType: VisibilityType) => {
		queryClient.setQueryData(
			QUERY_KEYS.chatVisibility(chatId),
			updatedVisibilityType,
		);

		// Revalidate history
		queryClient.invalidateQueries({ queryKey: QUERY_KEYS.chatHistory() });

		updateChatVisibility({
			chatId,
			visibility: updatedVisibilityType,
		});
	};

	return { visibilityType, setVisibilityType };
}
