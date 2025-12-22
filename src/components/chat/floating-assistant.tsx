"use client";

import { useState } from "react";
import { MessageSquare, X, Minimize2, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";
import { Chat } from "@/components/chat/chat";
import { generateUUID } from "@/lib/utils";
import { DataStreamHandler } from "@/components/messages/data-stream-handler";
import { DataStreamProvider } from "@/components/chat/data-stream-provider";
import { chatModels } from "@/lib/ai/models";

interface FloatingAssistantProps {
  projectId: string;
  initialMessages?: any[];
}

export function FloatingAssistant({ projectId, initialMessages = [] }: FloatingAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [chatId] = useState(() => generateUUID());

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="absolute bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 bg-primary hover:bg-primary/90 transition-all duration-300 ease-spring"
        >
          <MessageSquare className="h-6 w-6 text-primary-foreground" />
        </Button>
      )}

      {/* Floating Chat Window */}
      {isOpen && (
        <GlassCard
          variant="liquid"
          className={cn(
            "absolute bottom-6 right-6 flex flex-col z-50 overflow-hidden transition-all duration-500 ease-spring rounded-2xl",
            isExpanded
              ? "w-[800px] h-[80vh] top-20 right-6 bottom-6"
              : "w-[450px] h-[600px]"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-white/10 bg-white/5 shrink-0">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-primary/10">
                 <MessageSquare className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-medium">Assistant</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 hover:bg-white/10"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Chat Content */}
          <div className="flex-1 overflow-hidden relative bg-background/30">
            <DataStreamProvider>
              <Chat
                id={chatId}
                initialMessages={initialMessages}
                initialChatModel="gpt-4o"
                initialVisibilityType="private"
                isReadonly={false}
                initialProjectId={projectId}
                autoResume={false}
                availableModels={Array.from(chatModels)}
              />
              <DataStreamHandler />
            </DataStreamProvider>
          </div>
        </GlassCard>
      )}
    </>
  );
}
