"use client";

import { useChat } from "@ai-sdk/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";
import { Artifact } from "@/components/artifact";
import { AgentCapabilities } from "@/components/chat/agent-capabilities";
import { ChatHeader } from "@/components/chat/chat-header";
import { useDataStream } from "@/components/chat/data-stream-provider";
import { MultimodalInput } from "@/components/chat/multimodal-input";
import { type ProcessLog, ProcessLogs } from "@/components/chat/process-logs";
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
import { toast } from "@/components/ui/toast";
import { useArtifactSelector } from "@/hooks/use-artifact";
import { useAutoResume } from "@/hooks/use-auto-resume";
import { useChatToolEffects } from "@/hooks/use-chat-tool-effects";
import { useChatVisibility } from "@/hooks/use-chat-visibility";
import { useChatSync } from "@/hooks/use-chat-sync";
import { useChatUrl } from "@/hooks/use-chat-url";
import { useProjectSelection } from "@/hooks/use-project-selection";
import { api } from "@/lib/api-client";
import type { ChatModel, ChatModelId } from "@/lib/ai/models";
import type { Vote } from "@/lib/db/schema";
import { ChatSDKError } from "@/lib/errors";
import type { ProjectSummary } from "@/lib/project-context";
import { QUERY_KEYS, STALE_TIMES } from "@/lib/query-options";
import type { ChatMessage } from "@/lib/types";
import type { AppUsage } from "@/lib/usage";
import { fetchWithErrorHandlers, generateUUID } from "@/lib/utils";

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
	const queryClient = useQueryClient();

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

	const { setDataStream } = useDataStream();

	const [input, setInput] = useState<string>("");
	const [usage, setUsage] = useState<AppUsage | undefined>(initialLastContext);
	const [showCreditCardAlert, setShowCreditCardAlert] = useState(false);
	const [currentModelId, setCurrentModelId] =
		useState<ChatModelId>(initialChatModel);
	const currentModelIdRef = useRef(currentModelId);
	const [processLogs, setProcessLogs] = useState<ProcessLog[]>([]);

	useEffect(() => {
		currentModelIdRef.current = currentModelId;
	}, [currentModelId]);

	const {
		messages,
		setMessages,
		sendMessage,
		status,
		stop,
		regenerate,
		resumeStream,
	} = useChat<ChatMessage>({
		id,
		messages: initialMessages,
		experimental_throttle: 100,
		generateId: generateUUID,
		transport: new DefaultChatTransport({
			api: "/api/chat",
			fetch: fetchWithErrorHandlers,
			prepareSendMessagesRequest(request) {
				return {
					body: {
						id: request.id,
						message: request.messages.at(-1),
						projectId: selectedProjectIdRef.current,
						selectedChatModel: currentModelIdRef.current,
						selectedVisibilityType: visibilityType,
						...request.body,
					},
				};
			},
		}),
		onData: (dataPart) => {
			setDataStream((ds) => (ds ? [...ds, dataPart] : []));
			if (dataPart.type === "data-usage") {
				setUsage(dataPart.data);

				setMessages((prevMessages) => {
					const lastMessage = prevMessages.at(-1);
					if (lastMessage && lastMessage.role === "assistant") {
						const newMessages = [...prevMessages];
						newMessages[newMessages.length - 1] = {
							...lastMessage,
							usage: dataPart.data as AppUsage,
						};
						return newMessages;
					}
					return prevMessages;
				});
			}
			const part = dataPart as any;
			if (part.type === "tool-log") {
				setProcessLogs((prev) => [
					...prev,
					{ ...part, timestamp: Date.now() } as ProcessLog,
				]);
			}
		},
		onFinish: () => {
			queryClient.invalidateQueries({ queryKey: QUERY_KEYS.chatHistory() });
		},
		onError: (error) => {
			if (error instanceof ChatSDKError) {
				if (
					error.message?.includes("AI Gateway requires a valid credit card")
				) {
					setShowCreditCardAlert(true);
				} else {
					toast({
						type: "error",
						description: error.message,
					});
				}
			}
		},
	});

	useChatSync({
		selectedProjectId,
		status,
		sendMessage,
		setProcessLogs,
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

					<div className="relative flex-1 overflow-hidden">
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

						<div className="absolute bottom-0 z-10 w-full bg-gradient-to-t from-background via-background/80 to-transparent pb-4 pt-10">
							<div className="mx-auto flex w-full max-w-4xl flex-col gap-2 px-2 md:px-4">
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
											input={input}
											onModelChange={setCurrentModelId}
											projectId={selectedProjectId}
											selectedModelId={currentModelId}
											selectedVisibilityType={visibilityType}
											sendMessage={sendMessage}
											setInput={setInput}
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
