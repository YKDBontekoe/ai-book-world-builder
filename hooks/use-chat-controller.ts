"use client";

import { useChat } from "@ai-sdk/react";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useSetDataStream } from "@/components/chat/data-stream-provider";
import type { VisibilityType } from "@/components/chat/visibility-selector";
import { toast } from "@/components/ui/toast";
import { createChatTransport } from "@/lib/ai/chat-transport";
import type { ChatModelId } from "@/lib/ai/models";
import { ChatSDKError } from "@/lib/errors";
import { QUERY_KEYS } from "@/lib/query-options";
import type { ChatMessage, DataPart, ProcessLog } from "@/lib/types";
import type { AppUsage } from "@/lib/usage";
import { generateUUID } from "@/lib/utils";

interface UseChatControllerProps {
	id: string;
	initialMessages: ChatMessage[];
	initialChatModel: ChatModelId;
	initialLastContext?: AppUsage;
	selectedProjectIdRef: React.MutableRefObject<string | null>;
	visibilityType: VisibilityType;
}

export function useChatController({
	id,
	initialMessages,
	initialChatModel,
	initialLastContext,
	selectedProjectIdRef,
	visibilityType,
}: UseChatControllerProps) {
	const queryClient = useQueryClient();
	const { setDataStream } = useSetDataStream();

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
		transport: createChatTransport({
			getProjectId: () => selectedProjectIdRef.current,
			getModelId: () => currentModelIdRef.current,
			getVisibilityType: () => visibilityType,
		}),
		onData: (dataPart: unknown) => {
			// Cast safely or validate
			const part = dataPart as DataPart;

			setDataStream((ds) => (ds ? [...ds, part] : []));

			if (part.type === "data-usage") {
				setUsage(part.data);

				setMessages((prevMessages) => {
					const lastMessage = prevMessages.at(-1);
					if (lastMessage && lastMessage.role === "assistant") {
						const newMessages = [...prevMessages];
						newMessages[newMessages.length - 1] = {
							...lastMessage,
							usage: part.data,
						};
						return newMessages;
					}
					return prevMessages;
				});
			} else if (part.type === "tool-log") {
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

	return {
		messages,
		setMessages,
		sendMessage,
		status,
		stop,
		regenerate,
		resumeStream,
		usage,
		showCreditCardAlert,
		setShowCreditCardAlert,
		currentModelId,
		setCurrentModelId,
		processLogs,
		setProcessLogs,
	};
}
