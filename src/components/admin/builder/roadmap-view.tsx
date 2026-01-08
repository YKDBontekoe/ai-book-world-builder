"use client";

import { useQuery } from "@tanstack/react-query";
import {
	Brain,
	ExternalLink,
	Hammer,
	Lightbulb,
	Loader2,
} from "lucide-react";
import type { JSX } from "react";
// biome-ignore lint/correctness/noUnusedImports: <explanation>
import { useState } from "react";
import { getIssues } from "@/app/actions/github";
import { discoverFeaturesAction } from "@/app/actions/jules-ai";
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import { Card } from "@/components/atoms/card";
import { ScrollArea } from "@/components/atoms/scroll-area";
import { cn } from "@/lib/utils";
import { CreateFeatureDialog } from "./create-feature-dialog";

// ============================================================================
// Types
// ============================================================================

type SuggestedFeature = {
	title: string;
	description: string;
	reasoning: string;
	impact: "High" | "Medium" | "Low";
	type: "Feature" | "Refactor" | "Test" | "Docs";
};

// ============================================================================
// Sub-components
// ============================================================================

function FeatureCard({
	issue,
}: {
	issue: { number: number; title: string; body: string };
}) {
	// Simple heuristic: Parent issues might have checklist items in body
	const progress = (issue.body || "").match(/- \[x\]/g)?.length || 0;
	const total = (issue.body || "").match(/- \[ \]/g)?.length || 0;
	const percent =
		total + progress > 0
			? Math.round((progress / (total + progress)) * 100)
			: 0;

	return (
		<Card className="p-4 hover:shadow-md transition-shadow">
			<div className="flex justify-between items-start gap-4">
				<div>
					<div className="flex items-center gap-2 mb-1">
						<span className="text-xs font-mono text-muted-foreground">
							#{issue.number}
						</span>
						<h3 className="font-semibold">{issue.title}</h3>
					</div>
					<p className="text-sm text-muted-foreground line-clamp-2">
						{issue.body?.split("\n")[0]}
					</p>
				</div>
				<a
					href={`https://github.com/YKDBontekoe/ai-book-world-builder/issues/${issue.number}`}
					target="_blank"
					rel="noreferrer"
					className="text-muted-foreground hover:text-primary"
				>
					<ExternalLink className="w-4 h-4" />
				</a>
			</div>
			<div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
				<div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
					<div
						className="h-full bg-primary transition-all duration-500"
						style={{ width: `${percent}%` }}
					/>
				</div>
				<span>{percent}% Complete</span>
			</div>
		</Card>
	);
}

function SuggestionCard({
	suggestion,
}: {
	suggestion: SuggestedFeature;
	onPlan: () => void;
}) {
	return (
		<Card className="p-4 border-dashed border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors">
			<div className="flex justify-between items-start mb-2">
				<Badge variant="outline" className="text-xs">
					{suggestion.type}
				</Badge>
				<Badge
					className={cn(
						"text-xs",
						suggestion.impact === "High" && "bg-orange-500 hover:bg-orange-600",
						suggestion.impact === "Medium" && "bg-blue-500 hover:bg-blue-600",
						suggestion.impact === "Low" && "bg-gray-500 hover:bg-gray-600",
					)}
				>
					{suggestion.impact} Impact
				</Badge>
			</div>
			<h3 className="font-semibold mb-2">{suggestion.title}</h3>
			<p className="text-sm text-muted-foreground mb-3">
				{suggestion.description}
			</p>
			<div className="text-xs bg-background/50 p-2 rounded mb-4">
				<span className="font-semibold">Reasoning: </span>
				{suggestion.reasoning}
			</div>
			<CreateFeatureDialog
				initialTitle={suggestion.title}
				initialDescription={`${suggestion.description}\n\nReasoning: ${suggestion.reasoning}`}
				trigger={
					<Button className="w-full gap-2" size="sm">
						<Hammer className="w-4 h-4" />
						Plan This Feature
					</Button>
				}
			/>
		</Card>
	);
}

// ============================================================================
// Main Component
// ============================================================================

export function RoadmapView(): JSX.Element {
	// Fetch active parent issues (Heuristic: Issues with 'Epics' or 'Features' labels would be better, but we'll list open issues for now)
	const { data: issues } = useQuery({
		queryKey: ["github", "issues", "open"],
		queryFn: async () => {
			const res = await getIssues("open");
			if (!res.success) throw new Error(res.error);
			// Filter for "Parent" issues - simplistic check for now: Has a task list
			return (res.data as any[]).filter((i) =>
				(i.body || "").includes("- [ ]"),
			);
		},
	});

	// AI Suggestions State
	const {
		data: suggestions,
		refetch: brainstorm,
		isFetching: isBrainstormingLoading,
	} = useQuery({
		queryKey: ["jules", "suggestions"],
		queryFn: async () => {
			const res = await discoverFeaturesAction({});
			if (!res.success) throw new Error(res.error);
			return res.data;
		},
		enabled: false, // Only run when button clicked
	});

	return (
		<div className="h-full flex flex-col gap-6 overflow-hidden">
			{/* Header Actions */}
			<div className="flex justify-between items-center px-1">
				<div className="space-y-1">
					<h2 className="text-lg font-semibold">Product Roadmap</h2>
					<p className="text-sm text-muted-foreground">
						Manage high-level features and discover new ideas.
					</p>
				</div>
				<div className="flex gap-2">
					<Button
						variant="secondary"
						onClick={() => brainstorm()}
						disabled={isBrainstormingLoading}
						className="gap-2"
					>
						{isBrainstormingLoading ? (
							<Loader2 className="w-4 h-4 animate-spin" />
						) : (
							<Brain className="w-4 h-4" />
						)}
						Brainstorm Ideas
					</Button>
					<CreateFeatureDialog />
				</div>
			</div>

			<div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-0">
				{/* Active Features Column */}
				<div className="flex flex-col gap-4 min-h-0">
					<h3 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
						<div className="w-2 h-2 rounded-full bg-green-500" />
						Active Features
					</h3>
					<ScrollArea className="flex-1 border rounded-lg bg-muted/20 p-4">
						<div className="space-y-4">
							{issues?.length === 0 && (
								<div className="text-center py-10 text-muted-foreground">
									No active features found.
								</div>
							)}
							{issues?.map((issue) => (
								<FeatureCard key={issue.number} issue={issue} />
							))}
						</div>
					</ScrollArea>
				</div>

				{/* AI Suggestions Column */}
				<div className="flex flex-col gap-4 min-h-0">
					<h3 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
						<div className="w-2 h-2 rounded-full bg-purple-500" />
						AI Suggestions
					</h3>
					<ScrollArea className="flex-1 border rounded-lg bg-muted/20 p-4">
						<div className="space-y-4">
							{!suggestions && !isBrainstormingLoading && (
								<div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground text-center">
									<Lightbulb className="w-8 h-8 mb-2 opacity-50" />
									<p>
										Click "Brainstorm Ideas" to let Jules analyze the project.
									</p>
								</div>
							)}
							{isBrainstormingLoading && (
								<div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground animate-pulse">
									<Brain className="w-8 h-8 mb-2 opacity-50" />
									<p>Analyzing architecture & docs...</p>
								</div>
							)}
							{suggestions?.map((suggestion, i) => (
								<SuggestionCard
									// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
									key={i}
									suggestion={suggestion}
									onPlan={() => {}} // Handled by DialogTrigger inside
								/>
							))}
						</div>
					</ScrollArea>
				</div>
			</div>
		</div>
	);
}
