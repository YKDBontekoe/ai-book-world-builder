import type { ChatMessage } from "@/lib/types";

// Extract the Part type from ChatMessage
export type MessagePart = ChatMessage["parts"][number];

// Helper type for tool parts which guaranteed have these properties
// when handled by their specific renderers
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
