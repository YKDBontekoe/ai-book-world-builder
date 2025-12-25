import { DefaultChatTransport } from "ai";
import type { VisibilityType } from "@/components/organisms/chat/visibility-selector";
import { ChatSDKError, type ErrorCode } from "@/lib/errors";
import type { ChatModelId } from "@/lib/ai/models";

async function fetchWithErrorHandlers(
	input: RequestInfo | URL,
	init?: RequestInit,
) {
	try {
		const response = await fetch(input, init);

		if (!response.ok) {
			let code: ErrorCode | undefined;
			let cause: string | undefined;

			try {
				const json = await response.json();
				code = json.code;
				cause = json.cause;
			} catch {
				// Failed to parse JSON error response
				cause = response.statusText;
			}

			throw new ChatSDKError(code ?? "bad_request:chat", cause);
		}

		return response;
	} catch (error: unknown) {
		if (typeof navigator !== "undefined" && !navigator.onLine) {
			throw new ChatSDKError("offline:chat");
		}

		throw error;
	}
}

interface CreateChatTransportOptions {
	getProjectId: () => string | null;
	getModelId: () => ChatModelId;
	getVisibilityType: () => VisibilityType;
}

export function createChatTransport({
	getProjectId,
	getModelId,
	getVisibilityType,
}: CreateChatTransportOptions) {
	return new DefaultChatTransport({
		api: "/api/chat",
		fetch: fetchWithErrorHandlers,
		prepareSendMessagesRequest(request) {
			return {
				body: {
					id: request.id,
					message: request.messages.at(-1),
					projectId: getProjectId(),
					selectedChatModel: getModelId(),
					selectedVisibilityType: getVisibilityType(),
					...request.body,
				},
			};
		},
	});
}
