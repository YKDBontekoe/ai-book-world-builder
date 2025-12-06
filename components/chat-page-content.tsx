"use client";

import { Chat } from "@/components/chat";
import { DataStreamHandler } from "@/components/data-stream-handler";
import type { VisibilityType } from "@/components/visibility-selector";
import type { ChatMessage } from "@/lib/types";
import type { AppUsage } from "@/lib/usage";

type ChatPageContentProps = {
  id: string;
  initialMessages: ChatMessage[];
  initialChatModel: string;
  initialVisibilityType: VisibilityType;
  isReadonly: boolean;
  autoResume: boolean;
  initialLastContext?: AppUsage;
};

export function ChatPageContent({
  id,
  initialMessages,
  initialChatModel,
  initialVisibilityType,
  isReadonly,
  autoResume,
  initialLastContext,
}: ChatPageContentProps) {
  return (
    <>
      <Chat
        autoResume={autoResume}
        id={id}
        initialChatModel={initialChatModel}
        initialLastContext={initialLastContext}
        initialMessages={initialMessages}
        initialVisibilityType={initialVisibilityType}
        isReadonly={isReadonly}
        key={id}
      />
      <DataStreamHandler />
    </>
  );
}
