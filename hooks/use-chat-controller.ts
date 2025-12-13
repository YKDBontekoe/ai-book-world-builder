import { useChat } from "@ai-sdk/react";
import { useQueryClient } from "@tanstack/react-query";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";
import { useDataStream } from "@/components/chat/data-stream-provider";
import type { ProcessLog } from "@/components/chat/process-logs";
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
  initialLastContext?: AppUsage;
  selectedProjectId: string | null;
  selectedChatModel: ChatModelId;
  selectedVisibilityType: string;
}

export function useChatController({
  id,
  initialMessages,
  initialLastContext,
  selectedProjectId,
  selectedChatModel,
  selectedVisibilityType,
}: UseChatControllerProps) {
  const queryClient = useQueryClient();
  const { setDataStream } = useDataStream();

  const [usage, setUsage] = useState<AppUsage | undefined>(initialLastContext);
  const [showCreditCardAlert, setShowCreditCardAlert] = useState(false);
  const [processLogs, setProcessLogs] = useState<ProcessLog[]>([]);

  // Refs for current values in callbacks
  const selectedProjectIdRef = useRef(selectedProjectId);
  const selectedChatModelRef = useRef(selectedChatModel);

  useEffect(() => {
    selectedProjectIdRef.current = selectedProjectId;
  }, [selectedProjectId]);

  useEffect(() => {
    selectedChatModelRef.current = selectedChatModel;
  }, [selectedChatModel]);

  const setMessagesRef = useRef<any>(null);

  const chatHelpers = useChat<ChatMessage>({
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
            selectedChatModel: selectedChatModelRef.current,
            selectedVisibilityType,
            ...request.body,
          },
        };
      },
    }),
    onData: (dataPart) => {
      setDataStream((ds) => (ds ? [...ds, dataPart] : []));
      if (dataPart.type === "data-usage") {
        setUsage(dataPart.data as AppUsage);

        setMessagesRef.current?.((prevMessages: ChatMessage[]) => {
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

  setMessagesRef.current = chatHelpers.setMessages;

  return {
    ...chatHelpers,
    usage,
    processLogs,
    setProcessLogs,
    showCreditCardAlert,
    setShowCreditCardAlert,
    setUsage,
  };
}
