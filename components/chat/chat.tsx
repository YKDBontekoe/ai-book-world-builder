"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { unstable_serialize } from "swr/infinite";
import { Artifact } from "@/components/artifact";
import { type CanvasPane, useBookCanvas } from "@/components/book-canvas";
import { AgentCapabilities } from "@/components/chat/agent-capabilities";
import { ChatHeader } from "@/components/chat/chat-header";
import { useDataStream } from "@/components/chat/data-stream-provider";
import { MultimodalInput } from "@/components/chat/multimodal-input";
import { type ProcessLog, ProcessLogs } from "@/components/chat/process-logs";
import { SuggestedActions } from "@/components/chat/suggested-actions";
import type { VisibilityType } from "@/components/chat/visibility-selector";
import { Messages } from "@/components/messages/messages";
import { ProjectContextBar } from "@/components/sidebar/project-context-bar";
import { getChatHistoryPaginationKey } from "@/components/sidebar/sidebar-history";
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
import { useChatVisibility } from "@/hooks/use-chat-visibility";
import { useProjectSelection } from "@/hooks/use-project-selection";
import type { ChatModel, ChatModelId } from "@/lib/ai/models";
import type { Vote } from "@/lib/db/schema";
import { ChatSDKError } from "@/lib/errors";
import type { ProjectSummary } from "@/lib/project-context";
import type { Attachment, ChatMessage } from "@/lib/types";
import type { AppUsage } from "@/lib/usage";
import { fetcher, fetchWithErrorHandlers, generateUUID } from "@/lib/utils";

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
	const router = useRouter();
	const searchParams = useSearchParams();

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

	const { setActivePane, setOverallStatus, setProjectId } = useBookCanvas();

	const { mutate } = useSWRConfig();

	// Sync Project ID with Book Canvas
	useEffect(() => {
		setProjectId(selectedProjectId || null);
	}, [selectedProjectId, setProjectId]);

	// Handle browser back/forward navigation
	useEffect(() => {
		const handlePopState = () => {
			router.refresh();
		};

		window.addEventListener("popstate", handlePopState);
		return () => window.removeEventListener("popstate", handlePopState);
	}, [router]);

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
			mutate(unstable_serialize(getChatHistoryPaginationKey));
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

	const { chatAction, triggerChatAction } = useBookCanvas();

	// Listen for chat actions from Book Canvas
	useEffect(() => {
		if (chatAction?.type === "send_message") {
			sendMessage(
				{
					role: "user",
					parts: [{ type: "text", text: chatAction.payload }],
				},
				{
					// Optional: ensure it treats it as a new message submission
				},
			);
			triggerChatAction(null);
		}
	}, [chatAction, sendMessage, triggerChatAction]);

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
	}, [status, setOverallStatus]);

	// Listen for Orchestrator decisions to switch panes
	useEffect(() => {
		const lastMessage = messages.at(-1);
		if (!lastMessage?.toolInvocations) {
			return;
		}

		for (const toolInvocation of lastMessage.toolInvocations) {
			if (
				toolInvocation.toolName === "orchestrateBook" &&
				toolInvocation.state === "result"
			) {
				const result = toolInvocation.result as any;
				if (result?.decision?.suggestedCanvasPane) {
					setActivePane(result.decision.suggestedCanvasPane as CanvasPane);
				}
			}
		}
	}, [messages, setActivePane]);

	// Listen for Tool Results to trigger SWR revalidation
	useEffect(() => {
		const lastMessage = messages.at(-1);
		if (!lastMessage?.toolInvocations) {
			return;
		}

		for (const toolInvocation of lastMessage.toolInvocations) {
			if (toolInvocation.state !== "result") continue;

			const { toolName } = toolInvocation;
			const projectId = selectedProjectIdRef.current;

			if (!projectId) continue;

			// Bible Pane Updates
			if (toolName === "manageEntities" || toolName === "createRelation") {
				mutate(["entities", projectId]);
				mutate(["relationships", projectId]);
			}

			// Outline Pane Updates
			if (
				toolName === "manageStory" ||
				toolName === "createOutline" ||
				toolName === "createVolume"
			) {
				mutate(["outline", projectId]);
			}
		}
	}, [messages, mutate, selectedProjectIdRef]);

	const query = searchParams.get("query");
	const [hasAppendedQuery, setHasAppendedQuery] = useState(false);

	useEffect(() => {
		if (query && !hasAppendedQuery) {
			sendMessage({
				role: "user" as const,
				parts: [{ type: "text", text: query }],
			});

			setHasAppendedQuery(true);
			const currentUrl = new URL(window.location.href);
			currentUrl.searchParams.delete("query");
			window.history.replaceState({}, "", `/chat/${id}${currentUrl.search}`);
		}
	}, [query, sendMessage, hasAppendedQuery, id]);

	useEffect(() => {
		if (!router || !id) {
			return;
		}

		// Only update URL if we are mostly sure the chat is created (has messages)
		// and we are currently on the root path. We wait for at least 2 messages (user + assistant)
		// or if we have 1 message and it is NOT loading (which shouldn't happen for new chat but valid safety)
		if (
			messages.length > 0 &&
			window.location.pathname === "/" &&
			!status.includes("streaming") &&
			messages.some((m) => m.role !== "user")
		) {
			window.history.replaceState({}, "", `/chat/${id}`);
		}
	}, [id, router, messages, status]);

	const { data: votes } = useSWR<Vote[]>(
		messages.length >= 2 ? `/api/vote?chatId=${id}` : null,
		fetcher,
	);

	const [attachments, setAttachments] = useState<Attachment[]>([]);
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
											attachments={attachments}
											availableModels={availableModels}
											chatId={id}
											input={input}
											messages={messages}
											onModelChange={setCurrentModelId}
											projectId={selectedProjectId}
											selectedModelId={currentModelId}
											selectedVisibilityType={visibilityType}
											sendMessage={sendMessage}
											setAttachments={setAttachments}
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
