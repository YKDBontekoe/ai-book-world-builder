"use client";

import { useQuery } from "@tanstack/react-query";
import { FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { GlassCard } from "@/components/molecules/glass-card";
import { useBookCanvasValue } from "@/components/organisms/book-canvas/book-canvas-context";
import { ChatActionHandler } from "@/components/organisms/chat/chat-action-handler";
import { useChatContext } from "@/components/organisms/chat/chat-context";
import { MultimodalInput } from "@/components/organisms/chat/multimodal-input";
import { ProcessLogs } from "@/components/organisms/chat/process-logs";
import type { VisibilityType } from "@/components/organisms/chat/visibility-selector";
import { Messages } from "@/components/organisms/messages/messages";
import { useArtifactSelector } from "@/hooks/use-artifact";
import { useAutoResume } from "@/hooks/use-auto-resume";
import { useChatController } from "@/hooks/use-chat-controller";
import { useChatSync } from "@/hooks/use-chat-sync";
import { useChatToolEffects } from "@/hooks/use-chat-tool-effects";
import type { ChatModel, ChatModelId } from "@/lib/ai/models";
import { api } from "@/lib/api-client";
import type { Vote } from "@/lib/db/schema";
import { QUERY_KEYS, STALE_TIMES } from "@/lib/query-options";
import type { ChatMessage } from "@/lib/types";
import type { AppUsage } from "@/lib/usage";

interface FloatingChatProps {
	id: string;
	initialMessages?: ChatMessage[];
	initialChatModel: ChatModelId;
	initialVisibilityType?: VisibilityType;
	isReadonly?: boolean;
	autoResume?: boolean;
	initialLastContext?: AppUsage;
	availableModels: ChatModel[];
}

export function FloatingChat({
	id,
	initialMessages = [],
	initialChatModel,
	initialVisibilityType = "private",
	isReadonly = false,
	autoResume = false,
	initialLastContext,
	availableModels,
}: FloatingChatProps) {
	const {
		selectedProject,
		selectedProjectId,
		selectedProjectIdRef,
		visibilityType,
	} = useChatContext();

	// Safe Context Access
	// We try to access context. If not present (e.g. Dashboard), we proceed with null
	let activeSceneId: string | null = null;
	const _sceneName: string | null = null;

	// We can't conditionally call hooks.
	// So we need to handle the case where Provider is missing.
	// However, FloatingAssistant is inside layout.tsx which HAS BookCanvasProvider.
	// So theoretically this should be safe.
	// But if we want to be extra safe:
	try {
		const bookCanvas = useBookCanvasValue();
		activeSceneId = bookCanvas.activeSceneId;
	} catch (_e) {
		// Ignore if context is missing (though it shouldn't be in this app structure)
	}

	// Local state for name (though we decided to just show "Active Scene" or rely on a query if we wanted name)
	const [displaySceneName, setDisplaySceneName] = useState<string | null>(null);

	useEffect(() => {
		if (activeSceneId) {
			setDisplaySceneName("Active Scene");
		} else {
			setDisplaySceneName(null);
		}
	}, [activeSceneId]);

	const {
		messages,
		setMessages,
		sendMessage,
		status,
		stop,
		regenerate,
		resumeStream,
		usage,
		currentModelId,
		setCurrentModelId,
		processLogs,
		setProcessLogs,
	} = useChatController({
		id,
		initialMessages,
		initialChatModel,
		initialLastContext,
		selectedProjectIdRef,
		visibilityType,
	});

	const { triggerChatAction } = useChatSync({
		status,
		setProcessLogs,
		selectedProjectId,
	});

	useChatToolEffects({
		messages,
		selectedProjectId,
	});

	const { data: votes } = useQuery({
		queryKey: QUERY_KEYS.votes(id),
		queryFn: () => api.get<Vote[]>(`/api/vote`, { params: { chatId: id } }),
		enabled: messages.length >= 2,
		staleTime: STALE_TIMES.STANDARD,
	});

	const isArtifactVisible = useArtifactSelector((state) => state.isVisible);

	useAutoResume({
		autoResume,
		initialMessages,
		resumeStream,
		setMessages,
	});

	// Wrapper for sendMessage to inject activeSceneId
	const handleSendMessage = async (input: string | any, options?: any) => {
		const body = options?.body || {};
		if (activeSceneId) {
			body.activeSceneId = activeSceneId;
		}
		return sendMessage(input, { ...options, body });
	};

	return (
		<div className="flex flex-col h-full overflow-hidden relative">
			<ChatActionHandler
				sendMessage={handleSendMessage}
				triggerChatAction={triggerChatAction}
			/>

			{/* Minimal Messages Area */}
			<div className="flex-1 overflow-hidden relative flex flex-col min-h-0">
				<Messages
					chatId={id}
					isArtifactVisible={isArtifactVisible}
					isReadonly={isReadonly}
					messages={messages}
					regenerate={regenerate}
					selectedModelId={initialChatModel}
					selectedProject={selectedProject}
					selectedVisibilityType={visibilityType}
					sendMessage={handleSendMessage}
					setMessages={setMessages}
					status={status}
					votes={votes}
				/>
			</div>

			{/* Footer: Logs + Input */}
			<div className="shrink-0 z-10 w-full bg-gradient-to-t from-background via-background/90 to-transparent pb-4 pt-4 px-4">
				<div className="flex flex-col gap-2">
					<ProcessLogs logs={processLogs} />

					{/* Context Chip */}
					{activeSceneId && (
						<div className="flex items-center gap-2 px-2 self-start">
							<GlassCard
								variant="subtle"
								size="none"
								className="flex items-center gap-1.5 px-2 py-1 bg-primary/10 border-primary/20"
							>
								<FileText className="h-3 w-3 text-primary" />
								<span className="text-[10px] font-medium text-primary">
									Linked: {displaySceneName}
								</span>
							</GlassCard>
						</div>
					)}

					<MultimodalInput
						availableModels={availableModels}
						chatId={id}
						onModelChange={setCurrentModelId}
						projectId={selectedProjectId}
						selectedModelId={currentModelId}
						selectedVisibilityType={visibilityType}
						sendMessage={handleSendMessage}
						setMessages={setMessages}
						status={status}
						stop={stop}
						usage={usage}
						className="bg-background/50 backdrop-blur-md" // Override to blend better
					/>
				</div>
			</div>
		</div>
	);
}
