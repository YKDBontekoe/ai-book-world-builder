"use client";

import { Artifact } from "@/components/organisms/artifact";
import { AgentCapabilities } from "@/components/organisms/chat/agent-capabilities";
import { ChatActionHandler } from "@/components/organisms/chat/chat-action-handler";
import { useChatContext } from "@/components/organisms/chat/chat-context";
import { ChatHeader } from "@/components/organisms/chat/chat-header";
import { ChatLayout } from "@/components/organisms/chat/chat-layout";
import { CreditCardAlert } from "@/components/organisms/chat/credit-card-alert";
import { MultimodalInput } from "@/components/organisms/chat/multimodal-input";
import { ProcessLogs } from "@/components/organisms/chat/process-logs";
import { SuggestedActions } from "@/components/organisms/chat/suggested-actions";
import type { VisibilityType } from "@/components/organisms/chat/visibility-selector";
import { Messages } from "@/components/organisms/messages/messages";
import { useArtifactSelector } from "@/hooks/use-artifact";
import type { ChatModel, ChatModelId } from "@/lib/ai/models";
import type { Vote } from "@/lib/db/schema";
import type { ChatMessage } from "@/lib/types";
import type { AppUsage } from "@/lib/usage";

interface ChatInterfaceProps {
	chatId: string;
	isReadonly: boolean;
	initialVisibilityType: VisibilityType;
	messages: ChatMessage[];
	status: "streaming" | "idle" | "submitted";
	usage: AppUsage;
	currentModelId: ChatModelId;
	processLogs: any[]; // Using any to match existing usage in chat.tsx if not strictly typed there
	availableModels: ChatModel[];
	votes?: Vote[];
	showCreditCardAlert: boolean;
	setShowCreditCardAlert: (show: boolean) => void;
	// Actions
	sendMessage: (params: any) => void;
	setMessages: (messages: ChatMessage[]) => void;
	stop: () => void;
	regenerate: () => void;
	setCurrentModelId: (id: ChatModelId) => void;
	triggerChatAction: (action: any) => void;
}

export function ChatInterface({
	chatId,
	isReadonly,
	initialVisibilityType,
	messages,
	status,
	usage,
	currentModelId,
	processLogs,
	availableModels,
	votes,
	showCreditCardAlert,
	setShowCreditCardAlert,
	sendMessage,
	setMessages,
	stop,
	regenerate,
	setCurrentModelId,
	triggerChatAction,
}: ChatInterfaceProps) {
	const { selectedProject, selectedProjectId, visibilityType } =
		useChatContext();

	const isArtifactVisible = useArtifactSelector((state) => state.isVisible);

	return (
		<>
			<ChatActionHandler
				sendMessage={sendMessage}
				triggerChatAction={triggerChatAction}
			/>

			<ChatLayout
				chatId={chatId}
				isReadonly={isReadonly}
				initialVisibilityType={initialVisibilityType}
				messagesLength={messages.length}
				header={
					<ChatHeader
						chatId={chatId}
						isReadonly={isReadonly}
						projectLabel={selectedProject?.name}
						selectedVisibilityType={initialVisibilityType}
					/>
				}
			>
				<Messages
					chatId={chatId}
					isArtifactVisible={isArtifactVisible}
					isReadonly={isReadonly}
					messages={messages}
					regenerate={regenerate}
					selectedModelId={currentModelId}
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
											chatId={chatId}
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
									chatId={chatId}
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

			<CreditCardAlert
				open={showCreditCardAlert}
				onOpenChange={setShowCreditCardAlert}
			/>
		</>
	);
}
