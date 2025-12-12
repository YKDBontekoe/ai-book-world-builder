"use client";

import type { UseChatHelpers } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import equal from "fast-deep-equal";
import { ArrowUpIcon } from "lucide-react";
import {
	type ChangeEvent,
	type Dispatch,
	memo,
	type SetStateAction,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
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
import type { ChatModel, ChatModelId } from "@/lib/ai/models";
import type { Attachment, ChatMessage } from "@/lib/types";
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
	attachments,
	setAttachments,
	messages,
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
	attachments: Attachment[];
	setAttachments: Dispatch<SetStateAction<Attachment[]>>;
	messages: UIMessage[];
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
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const { width } = useWindowSize();

	const adjustHeight = useCallback(() => {
		if (textareaRef.current) {
			textareaRef.current.style.height = "44px";
		}
	}, []);

	useEffect(() => {
		if (textareaRef.current) {
			adjustHeight();
		}
	}, [adjustHeight]);

	const resetHeight = useCallback(() => {
		if (textareaRef.current) {
			textareaRef.current.style.height = "44px";
		}
	}, []);

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
			adjustHeight();
		}
		// Only run once after hydration
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [adjustHeight, localStorageInput, setInput]);

	useEffect(() => {
		setLocalStorageInput(input);
	}, [input, setLocalStorageInput]);

	const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		setInput(event.target.value);
	};

	const fileInputRef = useRef<HTMLInputElement>(null);
	const [uploadQueue, setUploadQueue] = useState<string[]>([]);

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
		setLocalStorageInput,
		width,
		resetHeight,
	]);

	const uploadFile = useCallback(
		async (file: File) => {
			if (!projectId) {
				toast.error("Select a project before uploading files.");
				return;
			}

			const formData = new FormData();
			formData.append("file", file);
			formData.append("projectId", projectId);

			try {
				const response = await fetch("/api/files/upload", {
					method: "POST",
					body: formData,
				});

				const payload = await response.json();

				if (response.ok && payload.status === "uploaded") {
					const material = payload.material;
					const contentType = material?.mimeType ?? payload.blob?.contentType;
					const url = material?.blobUrl ?? payload.blob?.url;

					if (material && url) {
						return {
							url,
							name: material.filename,
							contentType: contentType ?? file.type,
						};
					}
				}

				const errorMessage = payload.message ?? "Failed to upload file.";
				toast.error(errorMessage);
			} catch (_error) {
				toast.error("Failed to upload file, please try again!");
			}
		},
		[projectId],
	);

	const contextProps = useMemo(
		() => ({
			usage,
		}),
		[usage],
	);

	const handleFileChange = useCallback(
		async (event: ChangeEvent<HTMLInputElement>) => {
			const files = Array.from(event.target.files || []);

			setUploadQueue(files.map((file) => file.name));

			try {
				const uploadPromises = files.map((file) => uploadFile(file));
				const uploadedAttachments = await Promise.all(uploadPromises);
				const successfullyUploadedAttachments = uploadedAttachments.filter(
					(attachment) => attachment !== undefined,
				);

				setAttachments((currentAttachments) => [
					...currentAttachments,
					...successfullyUploadedAttachments,
				]);
			} catch (error) {
				console.error("Error uploading files!", error);
			} finally {
				setUploadQueue([]);
			}
		},
		[setAttachments, uploadFile],
	);

	const handlePaste = useCallback(
		async (event: ClipboardEvent) => {
			const items = event.clipboardData?.items;
			if (!items) {
				return;
			}

			const imageItems = Array.from(items).filter((item) =>
				item.type.startsWith("image/"),
			);

			if (imageItems.length === 0) {
				return;
			}

			// Prevent default paste behavior for images
			event.preventDefault();

			setUploadQueue((prev) => [...prev, "Pasted image"]);

			try {
				const uploadPromises = imageItems
					.map((item) => item.getAsFile())
					.filter((file): file is File => file !== null)
					.map((file) => uploadFile(file));

				const uploadedAttachments = await Promise.all(uploadPromises);
				const successfullyUploadedAttachments = uploadedAttachments.filter(
					(attachment) =>
						attachment !== undefined &&
						attachment.url !== undefined &&
						attachment.contentType !== undefined,
				);

				setAttachments((curr) => [
					...curr,
					...(successfullyUploadedAttachments as Attachment[]),
				]);
			} catch (error) {
				console.error("Error uploading pasted images:", error);
				toast.error("Failed to upload pasted image(s)");
			} finally {
				setUploadQueue([]);
			}
		},
		[setAttachments, uploadFile],
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
				className="rounded-xl border border-border bg-background p-3 shadow-xs transition-all duration-200 focus-within:border-border hover:border-muted-foreground/50"
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
						className="grow resize-none border-0! border-none! bg-transparent p-2 text-sm outline-none ring-0 [-ms-overflow-style:none] [scrollbar-width:none] placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 [&::-webkit-scrollbar]:hidden"
						data-testid="multimodal-input"
						disableAutoResize={true}
						maxHeight={200}
						minHeight={44}
						onChange={handleInput}
						placeholder="Send a message..."
						ref={textareaRef}
						rows={1}
						value={input}
					/>{" "}
					<Context {...contextProps} />
				</div>
				<PromptInputToolbar className="!border-top-0 border-t-0! p-0 shadow-none dark:border-0 dark:border-transparent!">
					<PromptInputTools className="gap-0 sm:gap-0.5">
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
							className="size-8 rounded-full bg-primary text-primary-foreground transition-colors duration-200 hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground"
							data-testid="send-button"
							disabled={!input.trim() || uploadQueue.length > 0}
							status={status}
						>
							<ArrowUpIcon size={14} />
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
		if (!equal(prevProps.attachments, nextProps.attachments)) {
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
