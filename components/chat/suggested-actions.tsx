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
							"flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap shadow-sm backdrop-blur-sm",
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
			className="grid w-full gap-3 sm:grid-cols-2"
			data-testid="suggested-actions"
		>
			{displaySuggestions.map((action, index) => (
				<motion.div
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: 20 }}
					initial={{ opacity: 0, y: 20 }}
					key={action.label + index}
					transition={{ delay: 0.05 * index }}
				>
					<Button
						className={cn(
							"group relative h-auto w-full flex-col items-start gap-2 overflow-hidden rounded-xl border p-4 text-left transition-all duration-300",
							"hover:shadow-md",
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
						<div className="flex items-center gap-2 mb-1 w-full">
							<div
								className={cn(
									"p-1.5 rounded-md text-foreground",
									getIconBg(action.type),
								)}
							>
								{getIconForType(action.type)}
							</div>
							<span className="font-semibold text-sm">{action.label}</span>
							{action.reasoning && (
								<span className="ml-auto text-[10px] opacity-60 uppercase font-bold tracking-wider border px-1.5 py-0.5 rounded-full">
									AI
								</span>
							)}
						</div>

						<div className="text-muted-foreground text-xs line-clamp-2 pl-1">
							{action.reasoning || "Suggested based on your project context."}
						</div>

						{/* Hover Shine Effect */}
						<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shine pointer-events-none" />
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
			return <UsersIcon className="size-4" />;
		case "world":
			return <MapPinIcon className="size-4" />;
		case "story":
			return <BookOpenIcon className="size-4" />;
		case "analysis":
			return <CalendarIcon className="size-4" />; // Using Calendar as placeholder or maybe a Chart icon if available
		case "brainstorm":
			return <LightbulbIcon className="size-4" />;
		default:
			return <SparklesIcon className="size-4" />;
	}
}

function getCompactStyle(type: SuggestionType) {
	switch (type) {
		case "character":
			return "bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-300 hover:bg-blue-500/20";
		case "world":
			return "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20";
		case "story":
			return "bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20";
		case "analysis":
			return "bg-purple-500/10 border-purple-500/20 text-purple-700 dark:text-purple-300 hover:bg-purple-500/20";
		case "brainstorm":
			return "bg-cyan-500/10 border-cyan-500/20 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-500/20";
		default:
			return "bg-pink-500/10 border-pink-500/20 text-pink-700 dark:text-pink-300 hover:bg-pink-500/20";
	}
}

function getCardStyle(type: SuggestionType) {
	switch (type) {
		case "character":
			return "bg-gradient-to-br from-blue-500/5 to-transparent border-blue-200 dark:border-blue-900/50 hover:border-blue-400/50";
		case "world":
			return "bg-gradient-to-br from-emerald-500/5 to-transparent border-emerald-200 dark:border-emerald-900/50 hover:border-emerald-400/50";
		case "story":
			return "bg-gradient-to-br from-amber-500/5 to-transparent border-amber-200 dark:border-amber-900/50 hover:border-amber-400/50";
		case "analysis":
			return "bg-gradient-to-br from-purple-500/5 to-transparent border-purple-200 dark:border-purple-900/50 hover:border-purple-400/50";
		case "brainstorm":
			return "bg-gradient-to-br from-cyan-500/5 to-transparent border-cyan-200 dark:border-cyan-900/50 hover:border-cyan-400/50";
		default:
			return "bg-gradient-to-br from-pink-500/5 to-transparent border-pink-200 dark:border-pink-900/50 hover:border-pink-400/50";
	}
}

function getIconBg(type: SuggestionType) {
	switch (type) {
		case "character":
			return "bg-blue-100 dark:bg-blue-900/30";
		case "world":
			return "bg-emerald-100 dark:bg-emerald-900/30";
		case "story":
			return "bg-amber-100 dark:bg-amber-900/30";
		case "analysis":
			return "bg-purple-100 dark:bg-purple-900/30";
		case "brainstorm":
			return "bg-cyan-100 dark:bg-cyan-900/30";
		default:
			return "bg-pink-100 dark:bg-pink-900/30";
	}
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
