"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { updateChatVisibility } from "@/app/(chat)/actions";
import type { VisibilityType } from "@/components/organisms/chat/visibility-selector";
import { GC_TIMES, QUERY_KEYS, STALE_TIMES } from "@/lib/query-options";

export function useChatVisibility({
	chatId,
	initialVisibilityType,
}: {
	chatId: string;
	initialVisibilityType: VisibilityType;
}) {
	const queryClient = useQueryClient();

	const { data: localVisibility } = useQuery({
		queryKey: QUERY_KEYS.chatVisibility(chatId),
		queryFn: () => initialVisibilityType,
		enabled: false,
		staleTime: STALE_TIMES.LOCAL,
		gcTime: GC_TIMES.LOCAL,
		initialData: initialVisibilityType,
	});

	const visibilityType = useMemo(() => {
		return localVisibility ?? "private";
	}, [localVisibility]);

	const setVisibilityType = (updatedVisibilityType: VisibilityType) => {
		queryClient.setQueryData(
			QUERY_KEYS.chatVisibility(chatId),
			updatedVisibilityType,
		);

		updateChatVisibility({
			chatId,
			visibility: updatedVisibilityType,
		});
	};

	return { visibilityType, setVisibilityType };
}
