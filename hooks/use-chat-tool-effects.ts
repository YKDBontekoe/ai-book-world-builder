"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

import {
	type CanvasPane,
	useBookCanvasActions,
} from "@/components/book-canvas/book-canvas-context";
import { QUERY_KEYS } from "@/lib/query-options";
import type { ChatMessage } from "@/lib/types";

interface UseChatToolEffectsProps {
	messages: ChatMessage[];
	selectedProjectId: string | null;
}

export function useChatToolEffects({
	messages,
	selectedProjectId,
}: UseChatToolEffectsProps) {
	const queryClient = useQueryClient();
	const { setActivePane } = useBookCanvasActions();
	const processedToolCallIdsRef = useRef<Set<string>>(new Set());

	// Listen for Orchestrator decisions and Tool Results
	useEffect(() => {
		const lastMessage = messages.at(-1);
		if (!lastMessage?.toolInvocations) {
			return;
		}

		for (const toolInvocation of lastMessage.toolInvocations) {
			if (
				toolInvocation.state !== "result" ||
				processedToolCallIdsRef.current.has(toolInvocation.toolCallId)
			) {
				continue;
			}

			const { toolName, result } = toolInvocation;

			// 1. Handle Orchestrator Pane Switching
			if (toolName === "orchestrateBook") {
				const res = result as any;
				if (res?.decision?.suggestedCanvasPane) {
					setActivePane(res.decision.suggestedCanvasPane as CanvasPane);
				}
			}

			// 2. Handle Query Invalidation
			if (selectedProjectId) {
				// Bible Pane Updates
				if (toolName === "manageEntities") {
					queryClient.invalidateQueries({
						queryKey: QUERY_KEYS.entities(selectedProjectId),
					});
					queryClient.invalidateQueries({
						queryKey: QUERY_KEYS.relationships(selectedProjectId),
					});
				}

				// Outline Pane Updates
				if (
					toolName === "manageStory" ||
					toolName === "createOutline" ||
					toolName === "createVolume"
				) {
					queryClient.invalidateQueries({
						queryKey: QUERY_KEYS.outline(selectedProjectId),
					});
				}
			}

			// Mark as processed
			processedToolCallIdsRef.current.add(toolInvocation.toolCallId);
		}
	}, [messages, queryClient, selectedProjectId, setActivePane]);
}
