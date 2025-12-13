import type { UseChatHelpers } from "@ai-sdk/react";
import equal from "fast-deep-equal";
import { ArrowDownIcon } from "lucide-react";
import { memo } from "react";
import { useDataStream } from "@/components/chat/data-stream-provider";
import { SuggestedActions } from "@/components/chat/suggested-actions";
import type { VisibilityType } from "@/components/chat/visibility-selector";
import { Greeting } from "@/components/messages/greeting";
import { PreviewMessage, ThinkingMessage } from "@/components/messages/message";
import { useMessages } from "@/hooks/use-messages";
import type { ChatModelId } from "@/lib/ai/models";
import type { Vote } from "@/lib/db/schema";
import type { ProjectSummary } from "@/lib/project-context";
import type { ChatMessage } from "@/lib/types";

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

	useDataStream();

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
							vote={
								votes
									? votes.find((vote) => vote.messageId === message.id)
									: undefined
							}
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
				className={`-translate-x-1/2 absolute bottom-4 left-1/2 z-10 rounded-full border bg-background p-2 shadow-lg transition-all hover:bg-muted ${
					isAtBottom
						? "pointer-events-none scale-0 opacity-0"
						: "pointer-events-auto scale-100 opacity-100"
				}`}
				onClick={() => scrollToBottom("smooth")}
				type="button"
			>
				<ArrowDownIcon size={16} />
			</button>
		</div>
	);
}

export const Messages = memo(PureMessages, (prevProps, nextProps) => {
	if (prevProps.isArtifactVisible && nextProps.isArtifactVisible) {
		return true;
	}

	if (prevProps.status !== nextProps.status) {
		return false;
	}
	if (prevProps.selectedModelId !== nextProps.selectedModelId) {
		return false;
	}
	if (prevProps.messages.length !== nextProps.messages.length) {
		return false;
	}
	if (!equal(prevProps.messages, nextProps.messages)) {
		return false;
	}
	if (!equal(prevProps.votes, nextProps.votes)) {
		return false;
	}
	if (prevProps.selectedProject?.id !== nextProps.selectedProject?.id) {
		return false;
	}

	return false;
});
