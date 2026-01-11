"use client";

import type { UseChatHelpers } from "@ai-sdk/react";
import { type Dispatch, memo, type SetStateAction } from "react";
import { Response } from "@/components/molecules/response";
import { MessageEditor } from "@/components/organisms/messages/message-editor";
import { MessageBubble } from "@/components/organisms/messages/message-ui";
import type { ChatMessage } from "@/lib/types";
import { sanitizeText } from "@/lib/utils";

interface TextPartProps {
	message: ChatMessage;
	text: string;
	mode: "view" | "edit";
	setMode: Dispatch<SetStateAction<"view" | "edit">>;
	setMessages: UseChatHelpers<ChatMessage>["setMessages"];
	regenerate: UseChatHelpers<ChatMessage>["regenerate"];
}

export const TextPart = memo(
	function TextPart({
		message,
		text,
		mode,
		setMode,
		setMessages,
		regenerate,
	}: TextPartProps) {
		if (mode === "view") {
			return (
				<MessageBubble role={message.role}>
					<Response>{sanitizeText(text)}</Response>
				</MessageBubble>
			);
		}

		if (mode === "edit") {
			return (
				<div className="flex w-full flex-row items-start gap-3">
					<div className="size-8" />
					<div className="min-w-0 flex-1">
						<MessageEditor
							message={message}
							regenerate={regenerate}
							setMessages={setMessages}
							setMode={setMode}
						/>
					</div>
				</div>
			);
		}

		return null;
	},
	(prev, next) => {
		// If mode changes, always re-render
		if (prev.mode !== next.mode) return false;

		// If text changes (streaming or editing), always re-render
		if (prev.text !== next.text) return false;

		// Check function stability (usually stable, but safe to check)
		if (prev.setMode !== next.setMode) return false;
		if (prev.setMessages !== next.setMessages) return false;
		if (prev.regenerate !== next.regenerate) return false;

		// In 'view' mode, the MessageBubble only relies on `message.role`
		// We avoid deep comparing the entire `message` object or checking references
		// because `message` reference changes on every token update during streaming.
		if (prev.mode === "view") {
			return prev.message.role === next.message.role;
		}

		// In 'edit' mode, we pass the full `message` to MessageEditor.
		// While MessageEditor initializes state from message, keeping reference check
		// ensures consistency if parent truly updates the message object for other reasons.
		return prev.message === next.message;
	},
);
