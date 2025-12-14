"use client";

import type { UseChatHelpers } from "@ai-sdk/react";
import { ArrowUpIcon } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useLocalStorage, useWindowSize } from "usehooks-ts";
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
import type { ChatModel, ChatModelId } from "@/lib/ai/models";
import type { ChatMessage } from "@/lib/types";
import type { AppUsage } from "@/lib/usage";
import { cn } from "@/lib/utils";
import { AttachmentPreviewList } from "./attachment-preview-list";
import { AttachmentsButton } from "./attachments-button";
import { ModelSelectorCompact } from "./model-selector";
import { StopButton } from "./stop-button";

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
	const [input, setInput] = useState("");
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const { width } = useWindowSize();

	const [localStorageInput, setLocalStorageInput] = useLocalStorage(
		"input",
		"",
	);

	useEffect(() => {
		if (textareaRef.current) {
			const domValue = textareaRef.current.value;
			// Prefer DOM value over localStorage to handle hydration
			const finalValue = domValue || localStorageInput || "";
			setInput(finalValue);
		}
		// Only run once after hydration
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [localStorageInput]);

	useEffect(() => {
		setLocalStorageInput(input);
	}, [input, setLocalStorageInput]);

	const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		setInput(event.target.value);
	};

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
		setLocalStorageInput("");
		setInput("");

		if (width && width > 768) {
			textareaRef.current?.focus();
		}
	}, [
		input,
		attachments,
		sendMessage,
		setAttachments,
		setLocalStorageInput,
		width,
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
	}, [handlePaste]);

	const onRemoveAttachment = useCallback(
		(url: string) => {
			setAttachments((currentAttachments) =>
				currentAttachments.filter((a) => a.url !== url),
			);
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
		},
		[setAttachments],
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
					"rounded-3xl glass-input p-4 transition-all duration-300 ease-[var(--ease-liquid)]",
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

				<div className="flex flex-row items-start gap-3 px-1">
					<PromptInputTextarea
						aria-label="Message input"
						autoFocus
						className="grow resize-none border-0! border-none! bg-transparent p-2 text-[15px] outline-none ring-0 [-ms-overflow-style:none] [scrollbar-width:none] placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 [&::-webkit-scrollbar]:hidden"
						data-testid="multimodal-input"
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
