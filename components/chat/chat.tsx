"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Artifact } from "@/components/artifact";
import { useBookCanvasActions } from "@/components/book-canvas";
import { AgentCapabilities } from "@/components/chat/agent-capabilities";
import { ChatActionHandler } from "@/components/chat/chat-action-handler";
import { ChatHeader } from "@/components/chat/chat-header";
import { MultimodalInput } from "@/components/chat/multimodal-input";
import { ProcessLogs } from "@/components/chat/process-logs";
import { SuggestedActions } from "@/components/chat/suggested-actions";
import type { VisibilityType } from "@/components/chat/visibility-selector";
import { Messages } from "@/components/messages/messages";
import { ProjectContextBar } from "@/components/sidebar/project-context-bar";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useArtifactSelector } from "@/hooks/use-artifact";
import { useAutoResume } from "@/hooks/use-auto-resume";
import { useChatController } from "@/hooks/use-chat-controller";
import { useChatToolEffects } from "@/hooks/use-chat-tool-effects";
import { useChatUrl } from "@/hooks/use-chat-url";
import { useChatVisibility } from "@/hooks/use-chat-visibility";
import { useProjectSelection } from "@/hooks/use-project-selection";
import type { ChatModel, ChatModelId } from "@/lib/ai/models";
import { api } from "@/lib/api-client";
import type { Vote } from "@/lib/db/schema";
import type { ProjectSummary } from "@/lib/project-context";
import { QUERY_KEYS, STALE_TIMES } from "@/lib/query-options";
import type { ChatMessage } from "@/lib/types";
import type { AppUsage } from "@/lib/usage";

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
	const projects = initialProjects ?? [];
	const {
		applyProjectSelection,
		selectedProject,
		selectedProjectId,
		selectedProjectIdRef,
	} = useProjectSelection({
		initialProjectId,
		projects,
	});

	const { visibilityType } = useChatVisibility({
		chatId: id,
		initialVisibilityType,
	});

	const { setOverallStatus, setProjectId, triggerChatAction } =
		useBookCanvasActions();

	// Sync Project ID with Book Canvas
	useEffect(() => {
		setProjectId(selectedProjectId || null);
	}, [selectedProjectId, setProjectId]);

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

	useChatUrl({
		id,
		messages,
		status,
		sendMessage,
	});

	// Sync Chat Status with Book Canvas
	useEffect(() => {
		if (status === "streaming" || status === "submitted") {
			setOverallStatus("running");
			if (status === "submitted") {
				setProcessLogs([]);
			}
		} else {
			setOverallStatus("idle");
		}
	}, [status, setOverallStatus, setProcessLogs]);

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
			<div className="flex h-dvh min-w-0 flex-col bg-background">
				{/* Compact Project Context Bar - only show for new chats */}
				{messages.length === 0 && (
					<ProjectContextBar
						onProjectSelect={applyProjectSelection}
						projects={projects}
						selectedProject={selectedProject}
						selectedProjectId={selectedProjectId}
					/>
				)}

				<div className="overscroll-behavior-contain flex min-w-0 flex-1 touch-pan-y flex-col">
					<ChatHeader
						chatId={id}
						isReadonly={isReadonly}
						projectLabel={selectedProject?.name}
						selectedVisibilityType={initialVisibilityType}
					/>

					<div className="relative flex-1 overflow-hidden flex flex-col">
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
					</div>
				</div>
			</div>

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
