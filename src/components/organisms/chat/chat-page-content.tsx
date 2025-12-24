"use client";

import { Chat } from "@/components/organisms/chat/chat";
import type { VisibilityType } from "@/components/organisms/chat/visibility-selector";
import { DataStreamHandler } from "@/components/organisms/messages/data-stream-handler";
import type { ChatModel, ChatModelId } from "@/lib/ai/models";
import type { ProjectSummary } from "@/lib/project-context";
import type { ChatMessage } from "@/lib/types";
import type { AppUsage } from "@/lib/usage";

type ChatPageContentProps = {
	id: string;
	initialMessages: ChatMessage[];
	initialChatModel: ChatModelId;
	initialProjectId?: string;
	initialProjects?: ProjectSummary[];
	initialVisibilityType: VisibilityType;
	isReadonly: boolean;
	autoResume: boolean;
	initialLastContext?: AppUsage;
	availableModels: ChatModel[];
};

export function ChatPageContent({
	id,
	initialMessages,
	initialChatModel,
	initialProjectId,
	initialProjects,
	initialVisibilityType,
	isReadonly,
	autoResume,
	initialLastContext,
	availableModels,
}: ChatPageContentProps) {
	return (
		<>
			<Chat
				autoResume={autoResume}
				availableModels={availableModels}
				id={id}
				initialChatModel={initialChatModel}
				initialLastContext={initialLastContext}
				initialMessages={initialMessages}
				initialProjectId={initialProjectId}
				initialProjects={initialProjects}
				initialVisibilityType={initialVisibilityType}
				isReadonly={isReadonly}
				key={id}
			/>
			<DataStreamHandler />
		</>
	);
}
