"use client";

import { useQuery } from "@tanstack/react-query";
import {
	ChatProvider,
	useChatContext,
} from "@/components/organisms/chat/chat-context";
import { ChatInterface } from "@/components/organisms/chat/chat-interface";
import type { VisibilityType } from "@/components/organisms/chat/visibility-selector";
import { useAutoResume } from "@/hooks/use-auto-resume";
import { useChatController } from "@/hooks/use-chat-controller";
import { useChatSync } from "@/hooks/use-chat-sync";
import { useChatToolEffects } from "@/hooks/use-chat-tool-effects";
import { useChatUrl } from "@/hooks/use-chat-url";
import type { ChatModel, ChatModelId } from "@/lib/ai/models";
import { api } from "@/lib/api-client";
import type { Vote } from "@/lib/db/schema";
import type { ProjectSummary } from "@/lib/project-context";
import { QUERY_KEYS, STALE_TIMES } from "@/lib/query-options";
import type { ChatMessage } from "@/lib/types";
import type { AppUsage } from "@/lib/usage";

function ChatContent({
	id,
	initialMessages,
	initialChatModel,
	initialVisibilityType,
	isReadonly,
	autoResume,
	initialLastContext,
	availableModels,
}: {
	id: string;
	initialMessages: ChatMessage[];
	initialChatModel: ChatModelId;
	initialVisibilityType: VisibilityType;
	isReadonly: boolean;
	autoResume: boolean;
	initialLastContext?: AppUsage;
	availableModels: ChatModel[];
}) {
	const { selectedProjectId, selectedProjectIdRef, visibilityType } =
		useChatContext();

	const {
		messages,
		setMessages,
		sendMessage,
		status,
		stop,
		regenerate,
		resumeStream,
		usage,
		showCreditCardAlert,
		setShowCreditCardAlert,
		currentModelId,
		setCurrentModelId,
		processLogs,
		setProcessLogs,
	} = useChatController({
		id,
		initialMessages,
		initialChatModel,
		initialLastContext,
		selectedProjectIdRef,
		visibilityType,
	});

	const { triggerChatAction } = useChatSync({
		status,
		setProcessLogs,
		selectedProjectId,
	});

	useChatUrl({
		id,
		messages,
		status,
		sendMessage,
	});

	useChatToolEffects({
		messages,
		selectedProjectId,
	});

	const { data: votes } = useQuery({
		queryKey: QUERY_KEYS.votes(id),
		queryFn: () => api.get<Vote[]>(`/api/vote`, { params: { chatId: id } }),
		enabled: messages.length >= 2,
		staleTime: STALE_TIMES.STANDARD,
	});

	useAutoResume({
		autoResume,
		initialMessages,
		resumeStream,
		setMessages,
	});

	return (
		<ChatInterface
			chatId={id}
			isReadonly={isReadonly}
			initialVisibilityType={initialVisibilityType}
			messages={messages}
			status={status}
			usage={usage}
			currentModelId={currentModelId}
			processLogs={processLogs}
			availableModels={availableModels}
			votes={votes}
			showCreditCardAlert={showCreditCardAlert}
			setShowCreditCardAlert={setShowCreditCardAlert}
			sendMessage={sendMessage}
			setMessages={setMessages}
			stop={stop}
			regenerate={regenerate}
			setCurrentModelId={setCurrentModelId}
			triggerChatAction={triggerChatAction}
		/>
	);
}

export function Chat({
	id,
	initialMessages,
	initialChatModel,
	initialProjectId,
	initialProjects = [],
	initialVisibilityType,
	isReadonly,
	autoResume,
	initialLastContext,
	availableModels,
}: {
	id: string;
	initialMessages: ChatMessage[];
	initialChatModel: ChatModelId;
	initialProjectId?: string | null;
	initialProjects?: ProjectSummary[];
	initialVisibilityType: VisibilityType;
	isReadonly: boolean;
	autoResume: boolean;
	initialLastContext?: AppUsage;
	availableModels: ChatModel[];
}) {
	return (
		<ChatProvider
			chatId={id}
			initialProjectId={initialProjectId}
			initialProjects={initialProjects}
			initialVisibilityType={initialVisibilityType}
		>
			<ChatContent
				id={id}
				initialMessages={initialMessages}
				initialChatModel={initialChatModel}
				initialVisibilityType={initialVisibilityType}
				isReadonly={isReadonly}
				autoResume={autoResume}
				initialLastContext={initialLastContext}
				availableModels={availableModels}
			/>
		</ChatProvider>
	);
}
