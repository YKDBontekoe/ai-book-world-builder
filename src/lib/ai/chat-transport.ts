import { DefaultChatTransport } from "ai";
import type { VisibilityType } from "@/components/organisms/chat/visibility-selector";
import type { ChatModelId } from "@/lib/ai/models";
import { ChatSDKError, type ErrorCode } from "@/lib/errors";

async function fetchWithErrorHandlers(
	input: RequestInfo | URL,
	init?: RequestInit,
) {
	try {
		const response = await fetch(input, init);

		if (!response.ok) {
			const { code, cause } = await response.json();
			throw new ChatSDKError(code as ErrorCode, cause);
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
