"use client";

import { useEffect, type Dispatch, type SetStateAction } from "react";
import { useBookCanvas } from "@/components/book-canvas";
import type { ProcessLog } from "@/components/chat/process-logs";
import type { ChatMessage } from "@/lib/types";
import type { UseChatHelpers } from "@ai-sdk/react";

interface UseChatSyncProps {
	selectedProjectId: string | null;
	status: UseChatHelpers<ChatMessage>["status"];
	sendMessage: UseChatHelpers<ChatMessage>["sendMessage"];
	setProcessLogs: Dispatch<SetStateAction<ProcessLog[]>>;
}

export function useChatSync({
	selectedProjectId,
	status,
	sendMessage,
	setProcessLogs,
}: UseChatSyncProps) {
	const {
		setOverallStatus,
		setProjectId,
		chatAction,
		triggerChatAction,
	} = useBookCanvas();

	// Sync Project ID with Book Canvas
	useEffect(() => {
		setProjectId(selectedProjectId || null);
	}, [selectedProjectId, setProjectId]);

	// Listen for chat actions from Book Canvas
	useEffect(() => {
		if (chatAction?.type === "send_message") {
			sendMessage(
				{
					role: "user",
					parts: [{ type: "text", text: chatAction.payload }],
				},
				{},
			);
			triggerChatAction(null);
		}
	}, [chatAction, sendMessage, triggerChatAction]);

	// Sync Chat Status with Book Canvas
	useEffect(() => {
		if (status === "streaming" || status === "submitted") {
			setOverallStatus("running");
			if (status === "submitted") {
				setProcessLogs([]);
			}
		} else {
			setOverallStatus("idle");
		}
	}, [status, setOverallStatus, setProcessLogs]);
}
