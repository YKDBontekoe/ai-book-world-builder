import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { UseChatHelpers } from "@ai-sdk/react";
import type { ChatMessage } from "@/lib/types";

interface UseChatUrlSyncProps {
  chatId: string;
  messages: ChatMessage[];
  status: UseChatHelpers<ChatMessage>["status"];
  sendMessage: UseChatHelpers<ChatMessage>["sendMessage"];
  query: string | null;
}

export function useChatUrlSync({
  chatId,
  messages,
  status,
  sendMessage,
  query,
}: UseChatUrlSyncProps) {
  const router = useRouter();
  const [hasAppendedQuery, setHasAppendedQuery] = useState(false);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      router.refresh();
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [router]);

  useEffect(() => {
    if (query && !hasAppendedQuery) {
      sendMessage({
        role: "user" as const,
        parts: [{ type: "text", text: query }],
      });

      setHasAppendedQuery(true);
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.delete("query");
      window.history.replaceState(
        {},
        "",
        `/chat/${chatId}${currentUrl.search}`
      );
    }
  }, [query, sendMessage, hasAppendedQuery, chatId]);

  useEffect(() => {
    if (!router || !chatId) {
      return;
    }

    // Only update URL if we are mostly sure the chat is created (has messages)
    // and we are currently on the root path. We wait for at least 2 messages (user + assistant)
    // or if we have 1 message and it is NOT loading (which shouldn't happen for new chat but valid safety)
    if (
      messages.length > 0 &&
      window.location.pathname === "/" &&
      !status.includes("streaming") &&
      messages.some((m) => m.role !== "user")
    ) {
      window.history.replaceState({}, "", `/chat/${chatId}`);
    }
  }, [chatId, router, messages, status]);
}
