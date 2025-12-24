import type { ChatMessage } from "@/lib/types";

export type MessagePart = ChatMessage["parts"][number];

export interface ToolMessagePart {
	type: string;
	toolCallId: string;
	state: "partial-call" | "call" | "result";
	input?: any;
	output?: any;
	[key: string]: any;
}

export interface ToolRendererProps {
	part: MessagePart;
	isReadonly: boolean;
}

export function isToolPart(
	part: MessagePart,
): part is ToolMessagePart & MessagePart {
	return part.type.startsWith("tool-");
}
