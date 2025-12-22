import { DefaultChatTransport } from "ai";
import { fetchWithErrorHandlers } from "@/lib/utils";
import type { ChatModelId } from "@/lib/ai/models";
import type { VisibilityType } from "@/components/organisms/chat/visibility-selector";

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
