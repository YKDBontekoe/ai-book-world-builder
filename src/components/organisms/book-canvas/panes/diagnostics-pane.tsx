"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	AlertOctagonIcon,
	AlertTriangleIcon,
	BookIcon,
	CheckCircleIcon,
	CheckIcon,
	GlobeIcon,
	InfoIcon,
	Loader2,
	RefreshCwIcon,
	Sparkles,
	SparklesIcon,
	TrendingUpIcon,
	UsersIcon,
	XCircleIcon,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import {
	analyzeProjectAction,
	getProjectIssuesAction,
	resolveIssueAction,
} from "@/app/actions/analysis";
import { getProjectStats } from "@/app/actions/project-stats";
import { Button } from "@/components/atoms/button";
import { useBookCanvasLayout } from "@/components/organisms/book-canvas/book-canvas-context";
import type { ConsistencyIssue } from "@/lib/db/schema/issues";
import { QUERY_KEYS } from "@/lib/query-options";
import { cn } from "@/lib/utils";

function ScoreRing({
	score,
	label,
	icon: Icon,
	color,
}: {
	score: number;
	label: string;
	icon: React.ElementType;
	color: string;
}) {
	const getScoreClass = (s: number) => {
		if (s >= 70) return "text-green-600 dark:text-green-400";
		if (s >= 40) return "text-amber-600 dark:text-amber-400";
		return "text-muted-foreground";
	};

	const getStrokeColor = (s: number) => {
		if (s >= 70) return "stroke-green-500";
		if (s >= 40) return "stroke-amber-500";
		return "stroke-muted-foreground/30";
	};

	return (
		<div className="flex flex-col items-center gap-1.5">
			<div className="relative flex h-16 w-16 items-center justify-center">
				<svg className="-rotate-90 h-full w-full" viewBox="0 0 36 36">
					<path
						className="stroke-muted/30"
						d="M18 2.5 a 15.5 15.5 0 1 1 0 31 a 15.5 15.5 0 1 1 0 -31"
						fill="none"
						strokeWidth="3"
					/>
					<path
						className={cn("transition-all duration-500", getStrokeColor(score))}
						d="M18 2.5 a 15.5 15.5 0 1 1 0 31 a 15.5 15.5 0 1 1 0 -31"
						fill="none"
						strokeDasharray={`${score}, 100`}
						strokeLinecap="round"
						strokeWidth="3"
					/>
				</svg>
				<div className="absolute flex flex-col items-center">
					<Icon className={cn("h-4 w-4 mb-0.5", color)} />
					<span className={cn("font-bold text-sm", getScoreClass(score))}>
						{score}
					</span>
				</div>
			</div>
			<span className="text-muted-foreground text-xs font-medium">{label}</span>
		</div>
	);
}

function IssueCard({
	issue,
	onResolve,
}: {
	issue: ConsistencyIssue;
	onResolve: (id: string) => void;
}) {
	const isResolved = issue.status === "resolved";

	return (
		<div
			className={cn(
				"p-3 rounded-lg border text-sm transition-all",
				isResolved ? "bg-muted/30 opacity-60" : "bg-background",
				!isResolved &&
					issue.severity === "critical" &&
					"border-red-500/50 bg-red-500/5",
				!isResolved &&
					issue.severity === "high" &&
					"border-amber-500/50 bg-amber-500/5",
			)}
		>
			<div className="flex items-start gap-2">
				{issue.severity === "critical" ? (
					<AlertOctagonIcon className="h-4 w-4 text-red-500 mt-0.5" />
				) : issue.severity === "high" ? (
					<AlertTriangleIcon className="h-4 w-4 text-amber-500 mt-0.5" />
				) : (
					<InfoIcon className="h-4 w-4 text-blue-500 mt-0.5" />
				)}
				<div className="flex-1 space-y-1">
					<p className="font-medium leading-tight">{issue.description}</p>
					{issue.suggestion && (
						<p className="text-xs text-muted-foreground">
							💡 {issue.suggestion}
						</p>
					)}
				</div>
				{!isResolved && (
					<Button
						variant="ghost"
						size="icon"
						className="h-6 w-6"
						onClick={() => onResolve(issue.id)}
					>
						<CheckIcon className="h-3 w-3" />
					</Button>
				)}
			</div>
		</div>
	);
}

export function DiagnosticsPane() {
	const { projectId } = useBookCanvasLayout();
	const queryClient = useQueryClient();

	const { data: statsResult, isLoading: isLoadingStats } = useQuery({
		queryKey: projectId
			? QUERY_KEYS.diagnostics(projectId)
			: ["diagnostics", "null"],
		queryFn: async () => {
			if (!projectId) return null;
			return getProjectStats({ projectId });
		},
		enabled: !!projectId,
		refetchInterval: 5000,
	});

	const stats = statsResult?.success ? statsResult.data : null;

	const { data: issuesResult, isLoading: isLoadingIssues } = useQuery({
		queryKey: projectId ? QUERY_KEYS.issues(projectId) : ["issues", "null"],
		queryFn: async () => {
			if (!projectId) return null;
			return getProjectIssuesAction({ projectId });
		},
		enabled: !!projectId,
	});

	const { mutate: analyze, isPending: isAnalyzing } = useMutation({
		mutationFn: async () => {
			if (!projectId) return;
			const res = await analyzeProjectAction({ projectId });
			if (!res.success) throw new Error(res.error);
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: QUERY_KEYS.issues(projectId!),
			});
			toast.success("Analysis complete");
		},
		onError: () => {
			toast.error("Analysis failed");
		},
	});

	const { mutate: resolve } = useMutation({
		mutationFn: async (issueId: string) => {
			if (!projectId) return;
			const res = await resolveIssueAction({ projectId, issueId });
			if (!res.success) throw new Error(res.error);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: QUERY_KEYS.issues(projectId!),
			});
		},
	});

	if (!projectId) {
		return (
			<div className="flex h-full flex-col items-center justify-center p-8 text-center">
				<TrendingUpIcon className="h-10 w-10 text-muted-foreground/50 mb-3" />
				<p className="font-medium text-sm">No Project Selected</p>
				<p className="text-xs text-muted-foreground mt-1">
					Select a project to view readiness metrics
				</p>
			</div>
		);
	}

	const issues = issuesResult?.success ? issuesResult.data : [];
	const openIssues =
		issues?.filter((i: ConsistencyIssue) => i.status === "open") || [];
	const resolvedIssues =
		issues?.filter((i: ConsistencyIssue) => i.status === "resolved") || [];

	const readiness = stats?.readiness ?? {
		characters: { score: 0, feedback: "Add characters to get started" },
		worldBuilding: { score: 0, feedback: "Create locations and items" },
		plotStructure: { score: 0, feedback: "Create an outline" },
		overall: 0,
	};

	const overallScore = readiness.overall;

	return (
		<div className="flex flex-col gap-6 p-4 overflow-y-auto h-full">
			{/* Header */}
			<div className="flex items-center gap-2">
				<h3 className="font-semibold text-lg">Diagnostics</h3>
				<span
					className={cn(
						"rounded-full px-2 py-0.5 text-xs font-medium transition-colors",
						overallScore >= 60
							? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
							: overallScore >= 30
								? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
								: "bg-muted text-muted-foreground",
					)}
				>
					{overallScore}% Ready
				</span>
			</div>

			{/* Consistency Section */}
			<div className="space-y-3">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<AlertTriangleIcon className="h-4 w-4 text-primary" />
						<h4 className="font-medium text-sm">Continuity Check</h4>
					</div>
					<Button
						size="sm"
						variant="secondary"
						onClick={() => analyze()}
						disabled={isAnalyzing}
					>
						{isAnalyzing ? (
							<Loader2 className="mr-2 h-3 w-3 animate-spin" />
						) : (
							<RefreshCwIcon className="mr-2 h-3 w-3" />
						)}
						Run Analysis
					</Button>
				</div>

				<div className="space-y-2">
					{openIssues.length === 0 && !isAnalyzing && (
						<div className="text-center p-4 border rounded-lg bg-muted/20 text-muted-foreground text-xs">
							No active issues found. Run analysis to check your draft.
						</div>
					)}
					{openIssues.map((issue: any) => (
						<IssueCard key={issue.id} issue={issue} onResolve={resolve} />
					))}
				</div>
			</div>

			<div className="h-px bg-border/50" />

			{/* Score Rings */}
			<div className="flex justify-around rounded-xl border bg-gradient-to-b from-muted/20 to-muted/5 p-4">
				<ScoreRing
					color="text-purple-500"
					icon={UsersIcon}
					label="Characters"
					score={readiness.characters.score}
				/>
				<ScoreRing
					color="text-emerald-500"
					icon={GlobeIcon}
					label="World"
					score={readiness.worldBuilding.score}
				/>
				<ScoreRing
					color="text-blue-500"
					icon={BookIcon}
					label="Plot"
					score={readiness.plotStructure.score}
				/>
			</div>

			{/* CTA */}
			<div className="flex flex-col gap-2">
				<Button asChild className="w-full gap-2" size="lg">
					<Link href={`/projects/${projectId}/generate`}>
						<Sparkles className="h-4 w-4" />
						Open Book Generator
					</Link>
				</Button>
			</div>
		</div>
	);
}
