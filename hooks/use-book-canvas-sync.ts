import { useEffect } from "react";
import { useBookCanvas } from "@/components/book-canvas";
import type { ProcessLog } from "@/components/chat/process-logs";
import type { UseChatHelpers } from "@ai-sdk/react";
import type { ChatMessage } from "@/lib/types";

interface UseBookCanvasSyncProps {
  selectedProjectId: string | null;
  status: string;
  setProcessLogs: (logs: ProcessLog[]) => void;
  sendMessage: UseChatHelpers<ChatMessage>["sendMessage"];
}

export function useBookCanvasSync({
  selectedProjectId,
  status,
  setProcessLogs,
  sendMessage,
}: UseBookCanvasSyncProps) {
  const { setOverallStatus, setProjectId, chatAction, triggerChatAction } =
    useBookCanvas();

  // Sync Project ID with Book Canvas
  useEffect(() => {
    setProjectId(selectedProjectId || null);
  }, [selectedProjectId, setProjectId]);

  // Sync Chat Status with Book Canvas
  useEffect(() => {
    if (status === "streaming" || status === "submitted") {
      setOverallStatus("running");
      if (status === "submitted") {
        setProcessLogs([]);
      }
    } else {
      setOverallStatus("idle");
    }
  }, [status, setOverallStatus, setProcessLogs]);

  // Listen for chat actions from Book Canvas
  useEffect(() => {
    if (chatAction?.type === "send_message") {
      sendMessage(
        {
          role: "user",
          parts: [{ type: "text", text: chatAction.payload }],
        },
        {},
      );
      triggerChatAction(null);
    }
  }, [chatAction, sendMessage, triggerChatAction]);
}
