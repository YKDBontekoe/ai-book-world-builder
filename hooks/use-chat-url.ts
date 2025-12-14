"use client";

import type { UseChatHelpers } from "@ai-sdk/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { ChatMessage } from "@/lib/types";

interface UseChatUrlProps {
	id: string;
	messages: ChatMessage[];
	status: UseChatHelpers<ChatMessage>["status"];
	sendMessage: UseChatHelpers<ChatMessage>["sendMessage"];
}

export function useChatUrl({
	id,
	messages,
	status,
	sendMessage,
}: UseChatUrlProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const query = searchParams.get("query");
	const [hasAppendedQuery, setHasAppendedQuery] = useState(false);

	// Handle browser back/forward navigation
	useEffect(() => {
		const handlePopState = () => {
			router.refresh();
		};

		window.addEventListener("popstate", handlePopState);
		return () => window.removeEventListener("popstate", handlePopState);
	}, [router]);

	// Handle initial query param
	useEffect(() => {
		if (query && !hasAppendedQuery) {
			sendMessage({
				role: "user" as const,
				parts: [{ type: "text", text: query }],
			});

			setHasAppendedQuery(true);
			const currentUrl = new URL(window.location.href);
			currentUrl.searchParams.delete("query");
			window.history.replaceState({}, "", `/chat/${id}${currentUrl.search}`);
		}
	}, [query, sendMessage, hasAppendedQuery, id]);

	// Update URL for new chats
	useEffect(() => {
		if (!router || !id) {
			return;
		}

		if (
			messages.length > 0 &&
			window.location.pathname === "/" &&
			!status.includes("streaming") &&
			messages.some((m) => m.role !== "user")
		) {
			window.history.replaceState({}, "", `/chat/${id}`);
		}
	}, [id, router, messages, status]);
}
