import type { UIMessage, UIMessagePart } from "ai";
import { type ClassValue, clsx } from "clsx";
import { formatISO } from "date-fns";
import { twMerge } from "tailwind-merge";
import type { DBMessage, Document } from "@/lib/db/schema";
import type { ChatMessage, ChatTools, CustomUIDataTypes } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function generateUUID(): string {
	return crypto.randomUUID();
}

export function sanitizeText(text: string) {
	return text.replace("<has_function_call>", "");
}

export function convertToUIMessages(messages: DBMessage[]): ChatMessage[] {
	return messages.map((message) => ({
		id: message.id,
		role: message.role as "user" | "assistant" | "system",
		parts: message.parts as UIMessagePart<CustomUIDataTypes, ChatTools>[],
		metadata: {
			createdAt: formatISO(message.createdAt),
		},
		usage: message.usage ?? undefined,
	}));
}

export function getTextFromMessage(message: ChatMessage | UIMessage): string {
	return message.parts
		.filter((part) => part.type === "text")
		.map((part) => (part as { type: "text"; text: string }).text)
		.join("");
}
