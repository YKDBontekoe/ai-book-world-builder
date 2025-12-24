"use client";

import type { ReactNode } from "react";
import { useChatContext } from "@/components/organisms/chat/chat-context";
import { ChatHeader } from "@/components/organisms/chat/chat-header";
import { ProjectContextBar } from "@/components/organisms/sidebar/project-context-bar";
import { ChatMessage } from "@/lib/types";

interface ChatLayoutProps {
	chatId: string;
	isReadonly: boolean;
	initialVisibilityType: any; // Using any to avoid complex imports if type isn't exported perfectly
	messagesLength: number;
	children: ReactNode;
	header: ReactNode;
}

export function ChatLayout({
	chatId,
	isReadonly,
	initialVisibilityType,
	messagesLength,
	children,
	header,
}: ChatLayoutProps) {
	const {
		projects,
		selectedProject,
		selectedProjectId,
		applyProjectSelection,
	} = useChatContext();

	return (
		<div className="flex h-dvh min-w-0 flex-col bg-background">
			{/* Compact Project Context Bar - only show for new chats */}
			{messagesLength === 0 && (
				<ProjectContextBar
					onProjectSelect={applyProjectSelection}
					projects={projects}
					selectedProject={selectedProject}
					selectedProjectId={selectedProjectId}
				/>
			)}

			<div className="overscroll-behavior-contain flex min-w-0 flex-1 touch-pan-y flex-col">
				{header}
				<div className="relative flex-1 overflow-hidden flex flex-col">
					{children}
				</div>
			</div>
		</div>
	);
}
