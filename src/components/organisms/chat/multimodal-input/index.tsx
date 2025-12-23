"use client";

import type { UseChatHelpers } from "@ai-sdk/react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpIcon, XIcon } from "lucide-react";
import { memo, useMemo } from "react";
import { toast } from "sonner";
import type { VisibilityType } from "@/components/organisms/chat/visibility-selector";
import { Context } from "@/components/molecules/context";
import {
	PromptInput,
	PromptInputSubmit,
	PromptInputTextarea,
	PromptInputToolbar,
	PromptInputTools,
} from "@/components/molecules/prompt-input";
import { useMultimodalInput } from "@/hooks/use-multimodal-input";
import type { ChatModel, ChatModelId } from "@/lib/ai/models";
import type { ChatMessage } from "@/lib/types";
import type { AppUsage } from "@/lib/usage";
import { cn } from "@/lib/utils";
import { AttachmentPreviewList } from "@/components/organisms/chat/multimodal-input/attachment-preview-list";
import { AttachmentsButton } from "@/components/organisms/chat/multimodal-input/attachments-button";
import { ModelSelectorCompact } from "@/components/organisms/chat/multimodal-input/model-selector";
import { StopButton } from "@/components/organisms/chat/multimodal-input/stop-button";

function PureMultimodalInput({
	chatId: _chatId,
	status,
	stop,
	setMessages,
	sendMessage,
	className,
	selectedVisibilityType: _selectedVisibilityType,
	selectedModelId,
	onModelChange,
	usage,
	availableModels,
	projectId,
}: {
	chatId: string;
	status: UseChatHelpers<ChatMessage>["status"];
	stop: () => void;
	setMessages: UseChatHelpers<ChatMessage>["setMessages"];
	sendMessage: UseChatHelpers<ChatMessage>["sendMessage"];
	className?: string;
	selectedVisibilityType: VisibilityType;
	selectedModelId: ChatModelId;
	onModelChange?: (modelId: ChatModelId) => void;
	usage?: AppUsage;
	availableModels: ChatModel[];
	projectId?: string | null;
}) {
	const {
		input,
		handleInput,
		attachments,
		uploadQueue,
		handleFileChange,
		submitForm,
		clearInput,
		textareaRef,
		fileInputRef,
		onRemoveAttachment,
	} = useMultimodalInput({ projectId, sendMessage });

	const contextProps = useMemo(
		() => ({
			usage,
		}),
		[usage],
	);

	return (
		<div className={cn("relative flex w-full flex-col gap-4", className)}>
			<input
				className="-top-4 -left-4 pointer-events-none fixed size-0.5 opacity-0"
				multiple
				onChange={handleFileChange}
				ref={fileInputRef}
				tabIndex={-1}
				type="file"
			/>

			<PromptInput
				className={cn(
					"rounded-2xl glass-input p-4 transition-all duration-300 ease-[var(--ease-liquid)]",
					"hover:shadow-xl hover:border-primary/5 dark:hover:border-white/10 hover:bg-glass-input/90",
					"focus-within:shadow-2xl focus-within:ring-1 focus-within:ring-primary/10 dark:focus-within:ring-white/10 focus-within:bg-glass-input/100",
				)}
				onSubmit={(event) => {
					event.preventDefault();
					if (status !== "ready") {
						toast.error("Please wait for the model to finish its response!");
					} else {
						submitForm();
					}
				}}
			>
				<AttachmentPreviewList
					attachments={attachments}
					uploadQueue={uploadQueue}
					onRemoveAttachment={onRemoveAttachment}
				/>

				<div className="flex flex-row items-start gap-3 px-1 relative">
					<PromptInputTextarea
						aria-label="Message input"
						autoFocus
						className="grow resize-y border-0! border-none! bg-transparent p-2 pr-10 text-[15px] outline-none ring-0 placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
						data-testid="multimodal-input"
						maxHeight={600}
						minHeight={44}
						onChange={handleInput}
						placeholder="What would you like to create?"
						ref={textareaRef}
						rows={1}
						value={input}
					/>
					
					<AnimatePresence>
						{(input.length > 0 || attachments.length > 0) && (
							<motion.button
								initial={{ opacity: 0, scale: 0.8 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.8 }}
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								transition={{ type: "spring", stiffness: 400, damping: 25 }}
								onClick={clearInput}
								className="absolute right-12 top-2 p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
								title="Clear input"
								type="button"
							>
								<XIcon size={14} />
							</motion.button>
						)}
					</AnimatePresence>
					
					<Context {...contextProps} />
				</div>
				<PromptInputToolbar className="!border-top-0 border-t-0! px-1 pb-1 shadow-none dark:border-0 dark:border-transparent!">
					<PromptInputTools className="gap-1">
						<AttachmentsButton
							fileInputRef={fileInputRef}
							selectedModelId={selectedModelId}
							status={status}
						/>
						<ModelSelectorCompact
							availableModels={availableModels}
							onModelChange={onModelChange}
							selectedModelId={selectedModelId}
						/>
					</PromptInputTools>

					{status === "submitted" || status === "streaming" ? (
						<StopButton setMessages={setMessages} stop={stop} />
					) : (
						<PromptInputSubmit
							aria-label="Send message"
							className="size-8 rounded-full bg-blue-500 text-white shadow-sm transition-all duration-300 hover:bg-blue-600 hover:scale-105 disabled:bg-zinc-100 disabled:text-zinc-400 dark:bg-blue-600 dark:hover:bg-blue-500 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-600"
							data-testid="send-button"
							disabled={!input.trim() || uploadQueue.length > 0}
							status={status}
						>
							<ArrowUpIcon size={16} strokeWidth={2.5} />
						</PromptInputSubmit>
					)}
				</PromptInputToolbar>
			</PromptInput>
		</div>
	);
}

export const MultimodalInput = memo(
	PureMultimodalInput,
	(prevProps, nextProps) => {
		if (prevProps.status !== nextProps.status) {
			return false;
		}
		if (prevProps.selectedVisibilityType !== nextProps.selectedVisibilityType) {
			return false;
		}
		if (prevProps.selectedModelId !== nextProps.selectedModelId) {
			return false;
		}
		if (prevProps.projectId !== nextProps.projectId) {
			return false;
		}

		return true;
	},
);
