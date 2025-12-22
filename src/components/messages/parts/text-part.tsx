"use client";

import type { UseChatHelpers } from "@ai-sdk/react";
import type { ChatMessage } from "@/lib/types";
import { MessageBubble } from "../message-ui";
import { Response } from "@/components/elements/response";
import { sanitizeText } from "@/lib/utils";
import { MessageEditor } from "../message-editor";
import type { Dispatch, SetStateAction } from "react";

interface TextPartProps {
  message: ChatMessage;
  text: string;
  mode: "view" | "edit";
  setMode: Dispatch<SetStateAction<"view" | "edit">>;
  setMessages: UseChatHelpers<ChatMessage>["setMessages"];
  regenerate: UseChatHelpers<ChatMessage>["regenerate"];
}

export function TextPart({
  message,
  text,
  mode,
  setMode,
  setMessages,
  regenerate,
}: TextPartProps) {
  if (mode === "view") {
    return (
      <MessageBubble role={message.role}>
        <Response>{sanitizeText(text)}</Response>
      </MessageBubble>
    );
  }

  if (mode === "edit") {
    return (
      <div className="flex w-full flex-row items-start gap-3">
        <div className="size-8" />
        <div className="min-w-0 flex-1">
          <MessageEditor
            message={message}
            regenerate={regenerate}
            setMessages={setMessages}
            setMode={setMode}
          />
        </div>
      </div>
    );
  }

  return null;
}
