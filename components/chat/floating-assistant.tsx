"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Minimize2, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Chat } from "@/components/chat/chat";
import { useChat } from "ai/react";
import { useChatVisibility } from "@/app/(chat)/chat/[id]/hooks/use-chat-visibility";
import { useChatUrl } from "@/app/(chat)/chat/[id]/hooks/use-chat-url";
import { generateUUID } from "@/lib/utils";
import { DataStreamHandler } from "@/components/chat/data-stream-handler";
import { ChatHeader } from "@/components/chat/chat-header";
import { DataStreamProvider } from "@/components/chat/data-stream-provider";

interface FloatingAssistantProps {
  projectId: string;
  initialMessages?: any[];
}

export function FloatingAssistant({ projectId, initialMessages = [] }: FloatingAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // We need a unique ID for the chat session, scoped to this project view instance?
  // Or do we want to load a persistent chat for this project?
  // For now, let's generate a new ID or use a fixed one for the project context.
  // Ideally, we fetch the last active chat for this project.
  const [chatId] = useState(() => generateUUID());

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="absolute bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 bg-primary hover:bg-primary/90 transition-all duration-300"
        >
          <MessageSquare className="h-6 w-6 text-primary-foreground" />
        </Button>
      )}

      {/* Floating Chat Window */}
      {isOpen && (
        <Card
          className={cn(
            "absolute bottom-6 right-6 flex flex-col shadow-2xl z-50 overflow-hidden border-border/50 backdrop-blur-xl bg-background/95 transition-all duration-300",
            isExpanded
              ? "w-[800px] h-[80vh] top-20 right-6 bottom-6"
              : "w-[400px] h-[600px]"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b bg-muted/20 shrink-0">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Assistant</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Chat Content */}
          <div className="flex-1 overflow-hidden relative">
             <Chat
                id={chatId}
                initialMessages={initialMessages}
                selectedModelId="gpt-4o" // Default or fetch from settings
                selectedVisibilityType="private"
                isReadonly={false}
                projectId={projectId} // Pass project context
             />
          </div>
        </Card>
      )}
    </>
  );
}
