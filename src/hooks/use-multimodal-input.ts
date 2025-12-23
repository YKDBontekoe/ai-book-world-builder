import type { UseChatHelpers } from "@ai-sdk/react";
import { type ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { useLocalStorage, useWindowSize } from "usehooks-ts";
import { useFileAttachments } from "@/hooks/use-file-attachments";
import type { ChatMessage } from "@/lib/types";

interface UseMultimodalInputProps {
	projectId?: string | null;
	sendMessage: UseChatHelpers<ChatMessage>["sendMessage"];
}

export function useMultimodalInput({
	projectId,
	sendMessage,
}: UseMultimodalInputProps) {
	const [input, setInput] = useState("");
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
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

	const handleInput = (event: ChangeEvent<HTMLTextAreaElement>) => {
		setInput(event.target.value);
	};

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

	// Add paste event listener to textarea
	useEffect(() => {
		const textarea = textareaRef.current;
		if (!textarea) {
			return;
		}

		textarea.addEventListener("paste", handlePaste);
		return () => textarea.removeEventListener("paste", handlePaste);
	}, [handlePaste]);

	const clearInput = useCallback(() => {
		setInput("");
		setLocalStorageInput("");
		setAttachments([]);
		if (textareaRef.current) {
			textareaRef.current.focus();
		}
	}, [setLocalStorageInput, setAttachments]);

	return {
		input,
		setInput,
		handleInput,
		attachments,
		uploadQueue,
		handleFileChange,
		submitForm,
		clearInput,
		textareaRef,
		fileInputRef,
		onRemoveAttachment,
	};
}
