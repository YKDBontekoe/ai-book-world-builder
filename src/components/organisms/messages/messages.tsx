import { useMemo } from "react";
import { ArrowDownIcon } from "lucide-react";
import type { UseChatHelpers } from "@ai-sdk/react";

import { SuggestedActions } from "@/components/organisms/chat/suggested-actions";
import type { VisibilityType } from "@/components/organisms/chat/visibility-selector";
import { Greeting } from "@/components/organisms/messages/greeting";
import { PreviewMessage, ThinkingMessage } from "@/components/organisms/messages/message";
import { useMessages } from "@/hooks/use-messages";
import type { ChatModelId } from "@/lib/ai/models";
import type { Vote } from "@/lib/db/schema";
import type { ProjectSummary } from "@/lib/project-context";
import type { ChatMessage } from "@/lib/types";
import { cn } from "@/lib/utils";

type MessagesProps = {
	chatId: string;
	status: UseChatHelpers<ChatMessage>["status"];
	votes: Vote[] | undefined;
	messages: ChatMessage[];
	setMessages: UseChatHelpers<ChatMessage>["setMessages"];
	regenerate: UseChatHelpers<ChatMessage>["regenerate"];
	sendMessage: UseChatHelpers<ChatMessage>["sendMessage"];
	isReadonly: boolean;
	isArtifactVisible: boolean;
	selectedModelId: ChatModelId;
	selectedProject?: ProjectSummary | null;
	selectedVisibilityType: VisibilityType;
};

function PureMessages({
	chatId,
	status,
	votes,
	messages,
	setMessages,
	regenerate,
	sendMessage,
	isReadonly,
	selectedModelId: _selectedModelId,
	selectedProject,
	selectedVisibilityType,
}: MessagesProps) {
	const {
		containerRef: messagesContainerRef,
		endRef: messagesEndRef,
		isAtBottom,
		scrollToBottom,
		hasSentMessage,
	} = useMessages({
		status,
	});

	// Optimization: Create a map for O(1) vote lookups instead of O(N) find
	const votesMap = useMemo(() => {
		if (!votes) return new Map<string, Vote>();
		return new Map(votes.map((vote) => [vote.messageId, vote]));
	}, [votes]);

	return (
		<div className="relative flex-1">
			<div
				className="absolute inset-0 touch-pan-y overflow-y-auto"
				ref={messagesContainerRef}
			>
				<div className="mx-auto flex min-w-0 max-w-4xl flex-col gap-4 px-2 pt-4 pb-32 md:gap-6 md:px-4 md:pb-48">
					{messages.length === 0 && (
						<>
							<Greeting selectedProject={selectedProject} />
							<div className="mx-auto mt-4 w-full max-w-3xl px-4 md:px-8">
								<SuggestedActions
									chatId={chatId}
									selectedProject={selectedProject}
									selectedVisibilityType={selectedVisibilityType}
									sendMessage={sendMessage}
									messages={messages}
									selectedModelId={_selectedModelId}
								/>
							</div>
						</>
					)}

					{messages.map((message, index) => (
						<PreviewMessage
							chatId={chatId}
							isLoading={
								status === "streaming" && messages.length - 1 === index
							}
							isLast={index === messages.length - 1}
							isReadonly={isReadonly}
							key={message.id}
							message={message}
							regenerate={regenerate}
							requiresScrollPadding={
								hasSentMessage && index === messages.length - 1
							}
							setMessages={setMessages}
							vote={votesMap.get(message.id)}
						/>
					))}

					{status === "submitted" && <ThinkingMessage />}

					<div
						className="min-h-[24px] min-w-[24px] shrink-0"
						ref={messagesEndRef}
					/>
				</div>
			</div>

			<button
				aria-label="Scroll to bottom"
				className={cn(
					"-translate-x-1/2 absolute bottom-4 left-1/2 z-10 flex items-center gap-2 rounded-full border border-primary/20 bg-background/80 px-4 py-2 text-primary shadow-xl backdrop-blur-md transition-all duration-300 hover:bg-primary/10 hover:shadow-primary/20 hover:scale-105",
					isAtBottom
						? "pointer-events-none translate-y-4 opacity-0"
						: "pointer-events-auto translate-y-0 opacity-100"
				)}
				onClick={() => scrollToBottom("smooth")}
				type="button"
			>
				<ArrowDownIcon size={14} strokeWidth={3} />
				<span className="text-xs font-bold uppercase tracking-wider">Scroll Down</span>
			</button>
		</div>
	);
}

export const Messages = PureMessages;
