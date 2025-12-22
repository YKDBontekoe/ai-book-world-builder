"use client";

import { useEffect } from "react";
import {
	type ChatAction,
	useBookCanvasValue,
} from "@/components/organisms/book-canvas/book-canvas-context";

interface ChatActionHandlerProps {
	sendMessage: (message: any, options?: any) => Promise<any>;
	triggerChatAction: (action: ChatAction) => void;
}

export function ChatActionHandler({
	sendMessage,
	triggerChatAction,
}: ChatActionHandlerProps) {
	const { chatAction } = useBookCanvasValue();

	useEffect(() => {
		if (chatAction?.type === "send_message") {
			sendMessage(
				{
					role: "user",
					parts: [{ type: "text", text: chatAction.payload }],
				},
				{
					// Optional: ensure it treats it as a new message submission
				},
			);
			triggerChatAction(null);
		}
	}, [chatAction, sendMessage, triggerChatAction]);

	return null;
}
