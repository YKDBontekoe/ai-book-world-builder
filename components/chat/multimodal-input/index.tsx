"use client";

import type { UseChatHelpers } from "@ai-sdk/react";
import { ArrowUpIcon } from "lucide-react";
import {
	type Dispatch,
	memo,
	type SetStateAction,
	useCallback,
	useEffect,
	useMemo,
	useRef,
} from "react";
import { toast } from "sonner";
import type { VisibilityType } from "@/components/chat/visibility-selector";
import { Context } from "@/components/elements/context";
import {
	PromptInput,
	PromptInputSubmit,
	PromptInputTextarea,
	PromptInputToolbar,
	PromptInputTools,
} from "@/components/elements/prompt-input";
import { useFileAttachments } from "@/hooks/use-file-attachments";
import { useMultimodalInput } from "@/hooks/use-multimodal-input";
import type { ChatModel, ChatModelId } from "@/lib/ai/models";
import type { ChatMessage } from "@/lib/types";
import type { AppUsage } from "@/lib/usage";
import { cn } from "@/lib/utils";
import { PreviewAttachment } from "../preview-attachment";
import { AttachmentsButton } from "./attachments-button";
import { ModelSelectorCompact } from "./model-selector";
import { StopButton } from "./stop-button";

function PureMultimodalInput({
	chatId,
	input,
	setInput,
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
	input: string;
	setInput: Dispatch<SetStateAction<string>>;
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
	const { textareaRef, width, resetHeight, handleInput } = useMultimodalInput({
		input,
		setInput,
	});

	const fileInputRef = useRef<HTMLInputElement>(null);

	const {
		attachments,
		setAttachments,
		uploadQueue,
		handleFileChange,
		handlePaste,
	} = useFileAttachments({ projectId });

	const submitForm = useCallback(() => {
		sendMessage({
			role: "user",
			parts: [
				...attachments.map((attachment) => ({
					type: "file" as const,
					url: attachment.url,
					name: attachment.name,
					mediaType: attachment.contentType,
				})),
				{
					type: "text",
					text: input,
				},
			],
		});

		setAttachments([]);
		resetHeight();
		setInput("");

		if (width && width > 768) {
			textareaRef.current?.focus();
		}
	}, [
		input,
		setInput,
		attachments,
		sendMessage,
		setAttachments,
		width,
		resetHeight,
		textareaRef,
	]);

	const contextProps = useMemo(
		() => ({
			usage,
		}),
		[usage],
	);

	// Add paste event listener to textarea
	useEffect(() => {
		const textarea = textareaRef.current;
		if (!textarea) {
			return;
		}

		textarea.addEventListener("paste", handlePaste);
		return () => textarea.removeEventListener("paste", handlePaste);
	}, [handlePaste, textareaRef]);

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
					"rounded-[28px] glass-input p-3 transition-all duration-300 ease-out",
					"hover:shadow-lg hover:border-white/20 dark:hover:border-white/10 hover:bg-glass-input/80",
					"focus-within:shadow-xl focus-within:ring-1 focus-within:ring-white/20 dark:focus-within:ring-white/10",
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
				{(attachments.length > 0 || uploadQueue.length > 0) && (
					<div
						className="flex flex-row items-end gap-2 overflow-x-scroll"
						data-testid="attachments-preview"
					>
						{attachments.map((attachment) => (
							<PreviewAttachment
								attachment={attachment}
								key={attachment.url}
								onRemove={() => {
									setAttachments((currentAttachments) =>
										currentAttachments.filter((a) => a.url !== attachment.url),
									);
									if (fileInputRef.current) {
										fileInputRef.current.value = "";
									}
								}}
							/>
						))}

						{uploadQueue.map((filename) => (
							<PreviewAttachment
								attachment={{
									url: "",
									name: filename,
									contentType: "",
								}}
								isUploading={true}
								key={filename}
							/>
						))}
					</div>
				)}
				<div className="flex flex-row items-start gap-1 sm:gap-2">
					<PromptInputTextarea
						aria-label="Message input"
						autoFocus
						className="grow resize-none border-0! border-none! bg-transparent p-2 text-[15px] outline-none ring-0 [-ms-overflow-style:none] [scrollbar-width:none] placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 [&::-webkit-scrollbar]:hidden"
						data-testid="multimodal-input"
						disableAutoResize={true}
						maxHeight={200}
						minHeight={44}
						onChange={handleInput}
						placeholder="What would you like to create?"
						ref={textareaRef}
						rows={1}
						value={input}
					/>{" "}
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
		if (prevProps.input !== nextProps.input) {
			return false;
		}
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
