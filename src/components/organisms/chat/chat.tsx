"use client";

import { useQuery } from "@tanstack/react-query";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/atoms/alert-dialog";
import { Artifact } from "@/components/organisms/artifact";
import { AgentCapabilities } from "@/components/organisms/chat/agent-capabilities";
import { ChatActionHandler } from "@/components/organisms/chat/chat-action-handler";
import {
	ChatProvider,
	useChatContext,
} from "@/components/organisms/chat/chat-context";
import { ChatHeader } from "@/components/organisms/chat/chat-header";
import { ChatLayout } from "@/components/organisms/chat/chat-layout";
import { MultimodalInput } from "@/components/organisms/chat/multimodal-input";
import { ProcessLogs } from "@/components/organisms/chat/process-logs";
import { SuggestedActions } from "@/components/organisms/chat/suggested-actions";
import type { VisibilityType } from "@/components/organisms/chat/visibility-selector";
import { Messages } from "@/components/organisms/messages/messages";
import { useArtifactSelector } from "@/hooks/use-artifact";
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
	const {
		selectedProject,
		selectedProjectId,
		selectedProjectIdRef,
		visibilityType,
	} = useChatContext();

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

	const isArtifactVisible = useArtifactSelector((state) => state.isVisible);

	useAutoResume({
		autoResume,
		initialMessages,
		resumeStream,
		setMessages,
	});

	return (
		<>
			<ChatActionHandler
				sendMessage={sendMessage}
				triggerChatAction={triggerChatAction}
			/>

			<ChatLayout
				chatId={id}
				isReadonly={isReadonly}
				initialVisibilityType={initialVisibilityType}
				messagesLength={messages.length}
				header={
					<ChatHeader
						chatId={id}
						isReadonly={isReadonly}
						projectLabel={selectedProject?.name}
						selectedVisibilityType={initialVisibilityType}
					/>
				}
			>
				<Messages
					chatId={id}
					isArtifactVisible={isArtifactVisible}
					isReadonly={isReadonly}
					messages={messages}
					regenerate={regenerate}
					selectedModelId={initialChatModel}
					selectedProject={selectedProject}
					selectedVisibilityType={visibilityType}
					sendMessage={sendMessage}
					setMessages={setMessages}
					status={status}
					votes={votes}
				/>

				<div className="absolute bottom-0 z-10 w-full bg-gradient-to-t from-background via-background/90 to-transparent pb-6 pt-16">
					<div className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-4 md:px-6">
						<ProcessLogs logs={processLogs} />
						{!isReadonly && (
							<>
								{messages.length > 0 && (
									<div className="mb-2">
										<SuggestedActions
											chatId={id}
											selectedProject={selectedProject}
											selectedVisibilityType={visibilityType}
											sendMessage={sendMessage}
											isCompact={true}
											messages={messages}
											selectedModelId={currentModelId}
										/>
									</div>
								)}
								<AgentCapabilities className="mb-2" />
								<MultimodalInput
									availableModels={availableModels}
									chatId={id}
									onModelChange={setCurrentModelId}
									projectId={selectedProjectId}
									selectedModelId={currentModelId}
									selectedVisibilityType={visibilityType}
									sendMessage={sendMessage}
									setMessages={setMessages}
									status={status}
									stop={stop}
									usage={usage}
								/>
							</>
						)}
					</div>
				</div>
			</ChatLayout>

			<Artifact />

			<AlertDialog
				onOpenChange={setShowCreditCardAlert}
				open={showCreditCardAlert}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Activate AI Gateway</AlertDialogTitle>
						<AlertDialogDescription>
							This application requires{" "}
							{process.env.NODE_ENV === "production" ? "the owner" : "you"} to
							activate Vercel AI Gateway.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => {
								window.open(
									"https://vercel.com/d?to=%2F%5Bteam%5D%2F%7E%2Fai%3Fmodal%3Dadd-credit-card",
									"_blank",
								);
								window.location.href = "/";
							}}
						>
							Activate
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
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
