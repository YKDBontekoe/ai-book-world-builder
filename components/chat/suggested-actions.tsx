"use client";

import type { UseChatHelpers } from "@ai-sdk/react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
	BookOpenIcon,
	CalendarIcon,
	LightbulbIcon,
	Loader2Icon,
	MapPinIcon,
	RefreshCwIcon,
	SparklesIcon,
	UsersIcon,
} from "lucide-react";
import { memo } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";
import type { ChatModelId } from "@/lib/ai/models";
import type { ProjectSummary } from "@/lib/project-context";
import type { ChatMessage } from "@/lib/types";
import { cn } from "@/lib/utils";
import type { VisibilityType } from "./visibility-selector";

type SuggestionType =
	| "story"
	| "character"
	| "world"
	| "analysis"
	| "creative"
	| "brainstorm";

type Suggestion = {
	label: string;
	prompt: string;
	type: SuggestionType;
	reasoning?: string;
};

type SuggestedActionsProps = {
	chatId: string;
	sendMessage: UseChatHelpers<ChatMessage>["sendMessage"];
	selectedVisibilityType: VisibilityType;
	selectedProject?: ProjectSummary | null;
	messages: ChatMessage[];
	isCompact?: boolean;
	selectedModelId: ChatModelId;
};

function PureSuggestedActions({
	sendMessage,
	selectedProject,
	messages,
	isCompact = false,
	selectedModelId,
}: SuggestedActionsProps) {
	const projectId = selectedProject?.id;
	const lastMessageId = messages.at(-1)?.id ?? "init";
	const shouldFetch = !!projectId || messages.length > 0;

	const { data: suggestions, isLoading, refetch, isRefetching } = useQuery({
		queryKey: ["suggestions", projectId, lastMessageId, selectedModelId],
		queryFn: async () => {
			if (!projectId && messages.length === 0) return null;

			return api.post<Suggestion[]>("/api/ai-suggestions", {
				projectId: projectId,
				messages: messages
					.map((m: any) => ({ role: m.role, content: m.content }))
					.slice(-5),
				modelId: selectedModelId,
			});
		},
		enabled: shouldFetch,
		staleTime: 60000,
		placeholderData: getFallbackSuggestions(selectedProject?.name, isCompact),
	});

	const displaySuggestions =
		suggestions ?? getFallbackSuggestions(selectedProject?.name, isCompact);

	const isValidating = isRefetching; // Map for compatibility

	// Compact Mode (Bottom of Chat)
	if (isCompact) {
		return (
			<div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mask-fade-right items-center">
				{(isLoading || isValidating) && (
					<Loader2Icon className="size-3 animate-spin text-muted-foreground mr-1 shrink-0" />
				)}
				{!isLoading && !isValidating && (
					<button
						type="button"
						onClick={() => refetch()}
						className="mr-1 text-muted-foreground hover:text-foreground transition-colors"
					>
						<RefreshCwIcon className="size-3" />
					</button>
				)}
				{displaySuggestions.map((action, index) => (
					<motion.button
						key={action.label + index}
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ delay: 0.05 * index }}
						onClick={() => {
							sendMessage({
								role: "user",
								parts: [{ type: "text", text: action.prompt }],
							});
						}}
						className={cn(
							"flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap shadow-sm",
							"bg-background/80 hover:bg-muted backdrop-blur-sm",
						)}
					>
						<span className="opacity-70 text-primary">{getIconForType(action.type)}</span>
						<span>{action.label}</span>
					</motion.button>
				))}
			</div>
		);
	}

	// Expanded Mode (Empty State)
	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center justify-between px-1">
				<h3 className="text-sm font-medium text-muted-foreground">Suggested Actions</h3>
				<Button
					variant="ghost"
					size="icon"
					className="h-6 w-6"
					onClick={() => refetch()}
					disabled={isLoading || isValidating}
				>
					<RefreshCwIcon className={cn("h-3.5 w-3.5", (isLoading || isValidating) && "animate-spin")} />
				</Button>
			</div>

			<div
				className="grid w-full gap-3 grid-cols-[repeat(auto-fit,minmax(260px,1fr))]"
				data-testid="suggested-actions"
			>
				{displaySuggestions.map((action, index) => (
					<motion.div
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 10 }}
						initial={{ opacity: 0, y: 10 }}
						key={action.label + index}
						transition={{ delay: 0.05 * index }}
					>
						<Button
							className={cn(
								"group relative h-auto w-full flex-col items-start gap-1 overflow-hidden rounded-xl border p-4 text-left transition-all duration-200 shadow-sm",
								"bg-card hover:bg-muted/50 hover:border-primary/30 hover:shadow-md",
							)}
							onClick={() => {
								sendMessage({
									role: "user",
									parts: [{ type: "text", text: action.prompt }],
								});
							}}
							variant="ghost"
						>
							<div className="flex items-center gap-3 w-full mb-1">
								<div
									className={cn(
										"flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary shadow-sm ring-1 ring-inset ring-primary/20",
									)}
								>
									{getIconForType(action.type)}
								</div>
								<span className="font-semibold text-sm text-foreground">
									{action.label}
								</span>
							</div>

							<div className="text-muted-foreground text-xs line-clamp-2 pl-11 opacity-80 leading-relaxed">
								{action.reasoning || action.prompt}
							</div>
						</Button>
					</motion.div>
				))}
			</div>
		</div>
	);
}

// Helpers
function getIconForType(type: SuggestionType) {
	switch (type) {
		case "character":
			return <UsersIcon className="size-4" />;
		case "world":
			return <MapPinIcon className="size-4" />;
		case "story":
			return <BookOpenIcon className="size-4" />;
		case "analysis":
			return <CalendarIcon className="size-4" />;
		case "brainstorm":
			return <LightbulbIcon className="size-4" />;
		default:
			return <SparklesIcon className="size-4" />;
	}
}

function getFallbackSuggestions(
	projectName = "this world",
	isCompact = false,
): Suggestion[] {
	if (isCompact) {
		return [
			{
				label: "Expand Scene",
				prompt: "Help me expand this scene with more sensory details.",
				type: "story",
			},
			{
				label: "Check Consistency",
				prompt: "Analyze the last few messages for any lore inconsistencies.",
				type: "analysis",
			},
			{
				label: "Dialogue Check",
				prompt: "Review the dialogue for natural flow and character voice.",
				type: "character",
			},
		];
	}

	return [
		{
			label: "Conjure a New World",
			prompt:
				"I want to create a new book project. Help me Brainstorm a genre and title.",
			type: "creative",
			reasoning: "Start from scratch with a fresh concept.",
		},
		{
			label: "Surprise Me",
			prompt:
				"Generate a unique story concept involving a twist on a classic trope.",
			type: "creative",
			reasoning: "Get inspired by something unexpected.",
		},
		{
			label: "Flesh Out Characters",
			prompt: `Help me add more depth to the characters in ${projectName}.`,
			type: "character",
			reasoning: "Deepen your cast's backgrounds and motivations.",
		},
		{
			label: "Outline Story",
			prompt: `Review the current state of ${projectName} and propose a chapter outline.`,
			type: "story",
			reasoning: "Structure your plot for better flow.",
		},
	];
}

export const SuggestedActions = memo(PureSuggestedActions, (prev, next) => {
	if (prev.isCompact !== next.isCompact) return false;
	if (prev.messages.length !== next.messages.length) return false;
	if (prev.messages.at(-1)?.id !== next.messages.at(-1)?.id) return false;
	if (prev.selectedProject?.id !== next.selectedProject?.id) return false;
	return true;
});
