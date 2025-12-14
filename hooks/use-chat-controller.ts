"use client";

import { useChat } from "@ai-sdk/react";
import { useQueryClient } from "@tanstack/react-query";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";
import { useSetDataStream } from "@/components/chat/data-stream-provider";
import type { ProcessLog } from "@/components/chat/process-logs";
import type { VisibilityType } from "@/components/chat/visibility-selector";
import { toast } from "@/components/ui/toast";
import type { ChatModelId } from "@/lib/ai/models";
import { ChatSDKError } from "@/lib/errors";
import { QUERY_KEYS } from "@/lib/query-options";
import type { ChatMessage } from "@/lib/types";
import type { AppUsage } from "@/lib/usage";
import { fetchWithErrorHandlers, generateUUID } from "@/lib/utils";

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
