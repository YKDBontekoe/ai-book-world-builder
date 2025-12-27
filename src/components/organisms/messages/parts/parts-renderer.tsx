"use client";

import type { UseChatHelpers } from "@ai-sdk/react";
import type { Dispatch, SetStateAction } from "react";
import type { ParagraphActionType } from "@/components/molecules/paragraph-actions";
import { ReasoningPart } from "@/components/organisms/messages/parts/reasoning-part";
import { TextPart } from "@/components/organisms/messages/parts/text-part";
import { ToolPart } from "@/components/organisms/messages/parts/tool-part";
import { isToolPart } from "@/components/organisms/messages/tools/types";
import type { ChatMessage } from "@/lib/types";

interface PartsRendererProps {
	message: ChatMessage;
	isLoading: boolean;
	isReadonly: boolean;
	mode: "view" | "edit";
	setMode: Dispatch<SetStateAction<"view" | "edit">>;
	setMessages: UseChatHelpers<ChatMessage>["setMessages"];
	regenerate: UseChatHelpers<ChatMessage>["regenerate"];
	onAction?: (type: ParagraphActionType, text: string) => void;
}

export function PartsRenderer({
	message,
	isLoading,
	isReadonly,
	mode,
	setMode,
	setMessages,
	regenerate,
	onAction,
}: PartsRendererProps) {
	if (!message.parts) return null;

	return (
		<>
			{message.parts.map((part, index) => {
				const key = `message-${message.id}-part-${index}`;

				if (part.type === "reasoning") {
					return (
						<ReasoningPart
							key={key}
							isLoading={isLoading}
							reasoning={part.text || ""}
						/>
					);
				}

				if (part.type === "text") {
					return (
						<div key={key}>
							<TextPart
								message={message}
								text={part.text}
								mode={mode}
								setMode={setMode}
								setMessages={setMessages}
								regenerate={regenerate}
								onAction={onAction}
							/>
						</div>
					);
				}

				if (isToolPart(part)) {
					return (
						<ToolPart
							key={part.toolCallId || key}
							part={part}
							isReadonly={isReadonly}
						/>
					);
				}

				return null;
			})}
		</>
	);
}
