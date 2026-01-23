"use client";

import type { JSX } from "react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import type { Message } from "./use-planner-chat";

interface ChatMessageListProps {
	messages: Message[];
}

export function ChatMessageList({
	messages,
}: ChatMessageListProps): JSX.Element {
	const scrollRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, [messages]);

	return (
		<div className="flex-1 overflow-y-auto p-4 space-y-6" ref={scrollRef}>
			{messages.length === 0 && (
				<div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
					<p>Start brainstorming with Jules Planner...</p>
				</div>
			)}

			{messages.map((msg) => (
				<div
					key={msg.id}
					className={cn(
						"flex flex-col gap-1 max-w-[85%]",
						msg.role === "user" ? "ml-auto items-end" : "items-start",
					)}
				>
					<div
						className={cn(
							"px-4 py-2 rounded-2xl text-sm whitespace-pre-wrap",
							msg.role === "user"
								? "bg-primary text-primary-foreground rounded-tr-sm"
								: "bg-muted/50 border rounded-tl-sm",
						)}
					>
						{msg.content}
					</div>
					<span className="text-[10px] text-muted-foreground px-1">
						{msg.role === "user" ? "You" : "Jules Planner"} •{" "}
						{msg.createdAt.toLocaleTimeString([], {
							hour: "2-digit",
							minute: "2-digit",
						})}
					</span>
				</div>
			))}
		</div>
	);
}
