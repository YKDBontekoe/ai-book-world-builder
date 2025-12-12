"use client";

import type { UseChatHelpers } from "@ai-sdk/react";
import { motion } from "framer-motion";
import {
	BookOpenIcon,
	CalendarIcon,
	LightbulbIcon,
	Loader2Icon,
	MapPinIcon,
	SparklesIcon,
	UsersIcon,
} from "lucide-react";
import { memo } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
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

	// Fetch suggestions from AI
	// We key off projectId, the last message content, AND the selected model to ensure freshness and correct model usage
	const lastMessageId = messages.at(-1)?.id ?? "init";
	const shouldFetch = !!projectId || messages.length > 0;

	const { data: suggestions, isLoading } = useSWR<Suggestion[]>(
		shouldFetch
			? ["suggestions", projectId, lastMessageId, selectedModelId]
			: null,
		async ([_, pid, mid, modelId]) => {
			// Only fetch if we have a project or at least some messages
			if (!pid && messages.length === 0) return null;

			const res = await fetch("/api/ai-suggestions", {
				method: "POST",
				body: JSON.stringify({
					projectId: pid,
					messages: messages
						.map((m: any) => ({ role: m.role, content: m.content }))
						.slice(-5),
					modelId: modelId,
				}),
			});
			if (!res.ok) throw new Error("Failed to fetch suggestions");
			return res.json();
		},
		{
			revalidateOnFocus: false,
			dedupingInterval: 60000, // Cache for 1 minute
			fallbackData: getFallbackSuggestions(selectedProject?.name, isCompact),
		},
	);

	const displaySuggestions =
		suggestions ?? getFallbackSuggestions(selectedProject?.name, isCompact);

	if (isCompact) {
		return (
			<div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mask-fade-right items-center">
				{isLoading && (
					<Loader2Icon className="size-3 animate-spin text-muted-foreground mr-1" />
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
							"flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap",
							getCompactStyle(action.type),
						)}
					>
						<span className="opacity-70">{getIconForType(action.type)}</span>
						<span>{action.label}</span>
					</motion.button>
				))}
			</div>
		);
	}

	return (
		<div
			className="grid w-full gap-2 sm:grid-cols-2"
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
							"group relative h-auto w-full flex-col items-start gap-1 overflow-hidden rounded-lg border p-3 text-left transition-all duration-200",
							"hover:bg-muted/50",
							getCardStyle(action.type),
						)}
						onClick={() => {
							sendMessage({
								role: "user",
								parts: [{ type: "text", text: action.prompt }],
							});
						}}
						variant="ghost"
					>
						<div className="flex items-center gap-2 w-full">
							<div
								className={cn(
									"flex size-6 items-center justify-center rounded-md bg-background/80 shadow-sm ring-1 ring-border/50",
								)}
							>
								{getIconForType(action.type)}
							</div>
							<span className="font-medium text-sm text-foreground/90">
								{action.label}
							</span>
						</div>

						{action.reasoning && (
							<div className="text-muted-foreground text-[10px] line-clamp-1 pl-8 opacity-70">
								{action.reasoning}
							</div>
						)}
					</Button>
				</motion.div>
			))}
		</div>
	);
}

// Helpers
function getIconForType(type: SuggestionType) {
	switch (type) {
		case "character":
			return <UsersIcon className="size-3.5" />;
		case "world":
			return <MapPinIcon className="size-3.5" />;
		case "story":
			return <BookOpenIcon className="size-3.5" />;
		case "analysis":
			return <CalendarIcon className="size-3.5" />; // Using Calendar as placeholder or maybe a Chart icon if available
		case "brainstorm":
			return <LightbulbIcon className="size-3.5" />;
		default:
			return <SparklesIcon className="size-3.5" />;
	}
}

function getCompactStyle(type: SuggestionType) {
	// Simplified styles: removed specific colors for borders/backgrounds to reduce noise
	// Now using a more uniform look with subtle tinting if needed, or just standard badges
	return "bg-secondary/50 border-transparent hover:bg-secondary text-secondary-foreground";
}

function getCardStyle(type: SuggestionType) {
	// Simplified card styles: flattened, less borders, no gradients
	return "bg-card hover:border-primary/20";
}

function getFallbackSuggestions(
	projectName = "this world",
	isCompact = false,
): Suggestion[] {
	return [
		{
			label: "Conjure a New World",
			prompt:
				"I want to create a new book project. Help me Brainstorm a genre and title.",
			type: "creative",
			reasoning: "Start here",
		},
		{
			label: "Surprise Me",
			prompt:
				"Generate a unique story concept involving a twist on a classic trope.",
			type: "creative",
			reasoning: "Get inspired",
		},
		{
			label: "Flesh Out Characters",
			prompt: `Help me add more depth to the characters in ${projectName}.`,
			type: "character",
			reasoning: "Deepen your cast",
		},
		{
			label: "Outline Story",
			prompt: `Review the current state of ${projectName} and propose a chapter outline.`,
			type: "story",
			reasoning: "Structure your plot",
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
