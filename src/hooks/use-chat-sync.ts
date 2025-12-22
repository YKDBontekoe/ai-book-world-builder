import { useEffect } from "react";
import { useBookCanvasActions } from "@/components/organisms/book-canvas";

interface UseChatSyncProps {
  status: string;
  setProcessLogs: (logs: any[]) => void;
  selectedProjectId: string | null;
}

export function useChatSync({
  status,
  setProcessLogs,
  selectedProjectId,
}: UseChatSyncProps) {
  const { setOverallStatus, setProjectId, triggerChatAction } =
    useBookCanvasActions();

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

  return { triggerChatAction };
}
