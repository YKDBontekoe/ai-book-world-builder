"use client";

import type { UseChatHelpers } from "@ai-sdk/react";
import type { ChatMessage } from "@/lib/types";
import { isToolPart } from "../tools/types";
import { TextPart } from "./text-part";
import { ReasoningPart } from "./reasoning-part";
import { ToolPart } from "./tool-part";
import type { Dispatch, SetStateAction } from "react";

interface PartsRendererProps {
  message: ChatMessage;
  isLoading: boolean;
  isReadonly: boolean;
  mode: "view" | "edit";
  setMode: Dispatch<SetStateAction<"view" | "edit">>;
  setMessages: UseChatHelpers<ChatMessage>["setMessages"];
  regenerate: UseChatHelpers<ChatMessage>["regenerate"];
}

export function PartsRenderer({
  message,
  isLoading,
  isReadonly,
  mode,
  setMode,
  setMessages,
  regenerate,
}: PartsRendererProps) {
  if (!message.parts) return null;

  return (
    <>
      {message.parts.map((part, index) => {
        const key = `message-${message.id}-part-${index}`;

        if (part.type === "reasoning") {
          return (
            <ReasoningPart
              key={key}
              isLoading={isLoading}
              reasoning={part.text || ""}
            />
          );
        }

        if (part.type === "text") {
          return (
            <div key={key}>
              <TextPart
                message={message}
                text={part.text}
                mode={mode}
                setMode={setMode}
                setMessages={setMessages}
                regenerate={regenerate}
              />
            </div>
          );
        }

        if (isToolPart(part)) {
          return (
            <ToolPart
              key={part.toolCallId || key}
              part={part}
              isReadonly={isReadonly}
            />
          );
        }

        return null;
      })}
    </>
  );
}
