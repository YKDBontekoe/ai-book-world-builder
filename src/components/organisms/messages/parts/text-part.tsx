"use client";

import type { UseChatHelpers } from "@ai-sdk/react";
import { type Dispatch, type SetStateAction, memo } from "react";
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

function PureTextPart({
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
}

export const TextPart = memo(PureTextPart, (prev, next) => {
	// 1. Check simple props first
	if (prev.mode !== next.mode) return false;
	if (prev.text !== next.text) return false;

	// 2. In 'edit' mode, we need the full message object to be up to date
	// because MessageEditor might modify it or depend on other fields.
	if (prev.mode === "edit") {
		return prev.message === next.message;
	}

	// 3. In 'view' mode, we only care about the role for styling (MessageBubble)
	if (prev.message.role !== next.message.role) return false;

	// 4. We assume setMode, setMessages, regenerate are stable references
	// from useChat/useChatHelpers. If they change, we probably want to re-render anyway,
	// but usually they don't. We skip checking them for performance in the hot path.

	return true;
});
