"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
	GripHorizontal,
	MessageSquare,
	PanelRight,
	PanelRightClose,
	X,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocalStorage } from "usehooks-ts";
import { Button } from "@/components/atoms/button";
import { GlassCard } from "@/components/molecules/glass-card";
import { ChatProvider } from "@/components/organisms/chat/chat-context";
import { DataStreamProvider } from "@/components/organisms/chat/data-stream-provider";
import { FloatingChat } from "@/components/organisms/chat/floating-chat";
import { DataStreamHandler } from "@/components/organisms/messages/data-stream-handler";
import {
	type ChatModel,
	type ChatModelId,
	chatModels,
	DEFAULT_CHAT_MODEL,
} from "@/lib/ai/models";
import { cn, generateUUID } from "@/lib/utils";

const MotionButton = motion(Button);
const MotionGlassCard = motion(GlassCard);

interface FloatingAssistantProps {
	projectId?: string;
	initialMessages?: any[];
	defaultModelId?: string;
	availableModels?: ChatModel[];
	isOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
	hideTrigger?: boolean;
}

export function FloatingAssistant({
	projectId,
	initialMessages = [],
	defaultModelId = DEFAULT_CHAT_MODEL,
	availableModels,
	isOpen: controlledIsOpen,
	onOpenChange,
	hideTrigger = false,
}: FloatingAssistantProps) {
	// Persistence for Chat ID
	const [chatId, _setChatId] = useLocalStorage<string>(
		"floating-chat-session-id",
		generateUUID(),
	);

	// Visibility State
	const [internalIsOpen, setInternalIsOpen] = useState(false);
	const isControlled = controlledIsOpen !== undefined;
	const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

	const handleOpenChange = useCallback(
		(open: boolean) => {
			if (onOpenChange) {
				onOpenChange(open);
			}
			if (!isControlled) {
				setInternalIsOpen(open);
			}
		},
		[onOpenChange, isControlled],
	);

	// Mode: 'floating' | 'sidebar'
	const [mode, setMode] = useState<"floating" | "sidebar">("floating");

	// Dimensions for Floating Mode
	const [size, setSize] = useState({ width: 450, height: 600 });

	const params = useParams();
	const currentProjectId =
		projectId ?? (typeof params.id === "string" ? params.id : undefined);

	// Keyboard Shortcut: Cmd+J / Ctrl+J
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === "j") {
				e.preventDefault();
				handleOpenChange(!isOpen);
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isOpen, handleOpenChange]);

	// Resize Logic
	const isResizingRef = useRef(false);
	const startResizeRef = useRef<{
		x: number;
		y: number;
		w: number;
		h: number;
	} | null>(null);

	const handleMouseDown = (e: React.MouseEvent) => {
		isResizingRef.current = true;
		startResizeRef.current = {
			x: e.clientX,
			y: e.clientY,
			w: size.width,
			h: size.height,
		};
		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", handleMouseUp);
	};

	const handleMouseMove = (e: MouseEvent) => {
		if (!isResizingRef.current || !startResizeRef.current) return;
		const dx = startResizeRef.current.x - e.clientX; // Drag left increases width
		const dy = startResizeRef.current.y - e.clientY; // Drag up increases height

		// We are resizing from top-left (assuming bottom-right anchor)
		// Actually, let's implement bottom-left resize handle for a right-aligned card?
		// Current anchor is bottom-right.
		// So dragging LEFT increases width. Dragging UP increases height.

		setSize({
			width: Math.max(350, Math.min(800, startResizeRef.current.w + dx)),
			height: Math.max(400, Math.min(900, startResizeRef.current.h + dy)),
		});
	};

	const handleMouseUp = () => {
		isResizingRef.current = false;
		document.removeEventListener("mousemove", handleMouseMove);
		document.removeEventListener("mouseup", handleMouseUp);
	};

	// Toggle Mode
	const toggleMode = () => {
		setMode((prev) => (prev === "floating" ? "sidebar" : "floating"));
	};

	// Animation Variants
	const variants = {
		hidden: { opacity: 0, scale: 0.9, y: 20 },
		floating: {
			opacity: 1,
			scale: 1,
			y: 0,
			width: size.width,
			height: size.height,
			right: 24, // 1.5rem
			bottom: 24,
			top: "auto",
			borderRadius: 16, // rounded-2xl
		},
		sidebar: {
			opacity: 1,
			scale: 1,
			y: 0,
			width: 450,
			height: "calc(100vh - 32px)",
			right: 16,
			bottom: 16,
			top: 16,
			borderRadius: 12, // rounded-xl
		},
	};

	return (
		<>
			{/* Floating Trigger Button */}
			{!hideTrigger && (
				<AnimatePresence>
					{!isOpen && (
						<MotionButton
							initial={{ scale: 0, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={{ scale: 0, opacity: 0 }}
							transition={{ type: "spring", stiffness: 400, damping: 25 }}
							onClick={() => handleOpenChange(true)}
							className="absolute bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 bg-primary hover:bg-primary/90"
						>
							<MessageSquare className="h-6 w-6 text-primary-foreground" />
						</MotionButton>
					)}
				</AnimatePresence>
			)}

			{/* Chat Window */}
			<AnimatePresence mode="wait">
				{isOpen && (
					<MotionGlassCard
						initial="hidden"
						animate={mode}
						exit="hidden"
						variants={variants}
						transition={{ type: "spring", stiffness: 400, damping: 25 }}
						layout
						variant="liquid"
						className={cn(
							"absolute flex flex-col z-50 overflow-hidden shadow-2xl backdrop-blur-xl border-white/20",
							// In sidebar mode, we want to align it properly
						)}
					>
						{/* Header */}
						<div className="flex items-center justify-between p-3 border-b border-white/10 bg-white/5 shrink-0 select-none cursor-default group">
							<div className="flex items-center gap-2">
								<div className="p-1.5 rounded-md bg-primary/10">
									<MessageSquare className="h-4 w-4 text-primary" />
								</div>
								<span className="text-sm font-medium">Assistant</span>
								{/* Shortcut hint */}
								<span className="text-[10px] text-muted-foreground ml-1 border border-white/10 px-1 rounded hidden group-hover:inline-block">
									⌘J
								</span>
							</div>
							<div className="flex items-center gap-1">
								<Button
									variant="ghost"
									size="icon"
									className="h-7 w-7 hover:bg-white/10"
									onClick={toggleMode}
									title={mode === "floating" ? "Dock to Side" : "Float"}
								>
									{mode === "floating" ? (
										<PanelRight className="h-3.5 w-3.5" />
									) : (
										<PanelRightClose className="h-3.5 w-3.5" />
									)}
								</Button>
								<Button
									variant="ghost"
									size="icon"
									className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive"
									onClick={() => handleOpenChange(false)}
								>
									<X className="h-3.5 w-3.5" />
								</Button>
							</div>
						</div>

						{/* Chat Content */}
						<div className="flex-1 overflow-hidden relative bg-background/30">
							<DataStreamProvider>
								<ChatProvider
									chatId={chatId}
									initialProjectId={currentProjectId}
									initialVisibilityType="private"
								>
									<FloatingChat
										id={chatId}
										initialMessages={initialMessages}
										initialChatModel={defaultModelId as ChatModelId}
										initialVisibilityType="private"
										isReadonly={false}
										availableModels={availableModels || Array.from(chatModels)}
									/>
								</ChatProvider>
								<DataStreamHandler />
							</DataStreamProvider>
						</div>

						{/* Resize Handle (Only in Floating Mode) */}
						{mode === "floating" && (
							// biome-ignore lint/a11y/noStaticElementInteractions: Resize handle
							<div
								className="absolute top-0 left-0 p-1 cursor-nw-resize opacity-0 hover:opacity-100 transition-opacity z-50"
								onMouseDown={handleMouseDown}
							>
								<div className="w-4 h-4 rounded-br bg-white/20" />{" "}
								{/* Visual hint if needed, or invisible */}
								{/* Actually, standard resize is usually bottom-right.
                                    Since we are fixed bottom-right, we need to resize from TOP-LEFT.
                                    So the handle should be at top-left.
                                */}
							</div>
						)}
						{mode === "floating" && (
							// biome-ignore lint/a11y/noStaticElementInteractions: Resize handle
							<div
								className="absolute top-0 left-0 w-6 h-6 z-50 cursor-nwse-resize flex items-center justify-center opacity-0 hover:opacity-50"
								onMouseDown={handleMouseDown}
							>
								<GripHorizontal className="h-4 w-4 -rotate-45" />
							</div>
						)}
					</MotionGlassCard>
				)}
			</AnimatePresence>
		</>
	);
}
