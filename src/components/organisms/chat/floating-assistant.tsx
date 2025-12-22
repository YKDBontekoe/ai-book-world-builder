"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Maximize2, MessageSquare, Minimize2, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/atoms/button";
import { Chat } from "@/components/organisms/chat/chat";
import { GlassCard } from "@/components/molecules/glass-card";
import { cn } from "@/lib/utils";
import { generateUUID } from "@/lib/utils";
import { DataStreamHandler } from "@/components/organisms/messages/data-stream-handler";
import { DataStreamProvider } from "@/components/organisms/chat/data-stream-provider";
import { chatModels, type ChatModelId } from "@/lib/ai/models";

const MotionButton = motion(Button);
const MotionGlassCard = motion(GlassCard);

interface FloatingAssistantProps {
	projectId: string;
	initialMessages?: any[];
	defaultModelId?: string;
}

export function FloatingAssistant({
	projectId,
	initialMessages = [],
	defaultModelId = "gpt-4o",
}: FloatingAssistantProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [isExpanded, setIsExpanded] = useState(false);
	const [chatId] = useState(() => generateUUID());

	return (
		<>
			{/* Floating Trigger Button */}
			<AnimatePresence>
				{!isOpen && (
					<MotionButton
						initial={{ scale: 0, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						exit={{ scale: 0, opacity: 0 }}
						transition={{ type: "spring", stiffness: 400, damping: 25 }}
						onClick={() => setIsOpen(true)}
						className="absolute bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 bg-primary hover:bg-primary/90"
					>
						<MessageSquare className="h-6 w-6 text-primary-foreground" />
					</MotionButton>
				)}
			</AnimatePresence>

			{/* Floating Chat Window */}
			<AnimatePresence>
				{isOpen && (
					<MotionGlassCard
						initial={{ opacity: 0, scale: 0.9, y: 20 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.9, y: 20 }}
						transition={{ type: "spring", stiffness: 400, damping: 25 }}
						layout
						variant="liquid"
						className={cn(
							"absolute bottom-6 right-6 flex flex-col z-50 overflow-hidden rounded-2xl transition-none", // transition-none to let framer handle layout
							isExpanded
								? "w-[800px] h-[80vh] top-20 right-6 bottom-6"
								: "w-[450px] h-[600px]",
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
                initialChatModel={defaultModelId as ChatModelId}
                initialVisibilityType="private"
                isReadonly={false}
                initialProjectId={projectId}
                autoResume={false}
                availableModels={Array.from(chatModels)}
              />
              <DataStreamHandler />
            </DataStreamProvider>
          </div>
					</MotionGlassCard>
				)}
			</AnimatePresence>
		</>
	);
}
