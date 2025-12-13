"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { UseChatHelpers } from "@ai-sdk/react";
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
	const [hasAppendedQuery, setHasAppendedQuery] = useState(false);

	// Handle browser back/forward navigation
	useEffect(() => {
		const handlePopState = () => {
			router.refresh();
		};

		window.addEventListener("popstate", handlePopState);
		return () => window.removeEventListener("popstate", handlePopState);
	}, [router]);

	// Handle initial query parameter
	useEffect(() => {
		const query = searchParams.get("query");
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
	}, [searchParams, sendMessage, hasAppendedQuery, id]);

	// Update URL when chat is established
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
