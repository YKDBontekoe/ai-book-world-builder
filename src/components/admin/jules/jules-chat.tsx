"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
	ArrowLeft,
	Check,
	ExternalLink,
	Loader2,
	Send,
	Shield,
	ShieldAlert,
	ShieldCheck,
} from "lucide-react";
import { type FormEvent, type JSX, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
	getGitHubPullRequestByBranchAction,
	getGitHubPullRequestStatusAction,
	mergeGitHubPullRequestAction,
} from "@/app/actions/github";
import {
	approveJulesPlanAction,
	getJulesSessionDetailsAction,
	getJulesSessionMetadataAction,
	sendJulesMessageAction,
	sendJulesPlanFeedbackAction,
} from "@/app/actions/jules";
import { reviewJulesPlanAction } from "@/app/actions/jules-ai";
import { Alert, AlertDescription, AlertTitle } from "@/components/atoms/alert";
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { ScrollArea } from "@/components/atoms/scroll-area";
import { GlassCard } from "@/components/molecules/glass-card";
import type { GitHubPullRequestStatus } from "@/lib/github-types";
import type { JulesActivity, JulesPlan } from "@/lib/jules-client";
import { ArtifactRenderer } from "./artifact-renderer";
import { JulesPullRequestCard } from "./jules-pr-card";

/**
 * Props for the JulesChat component.
 */
interface JulesChatProps {
	/** By ID of the session to display. */
	sessionId: string;
	/** Callback when the back button is clicked. */
	onBack: () => void;
}

/**
 * Chat interface for interacting with a Jules session.
 */
export function JulesChat({ sessionId, onBack }: JulesChatProps): JSX.Element {
	const queryClient = useQueryClient();
	const scrollRef = useRef<HTMLDivElement>(null);
	const [input, setInput] = useState("");
	const [systemMessages, setSystemMessages] = useState<SystemMessage[]>([]);
	const lastStatusRef = useRef<string | null>(null);
	const lastErrorRef = useRef<string | null>(null);
	const prErrorRef = useRef<string | null>(null);
	const prStatusErrorRef = useRef<string | null>(null);

	const { data, isLoading } = useQuery({
		queryKey: ["jules", "session", sessionId],
		queryFn: async () => {
			const result = await getJulesSessionDetailsAction({ sessionId });
			if (!result.success) throw new Error(result.error);
			return result.data;
		},
		refetchInterval: 5000,
	});

	const session = data?.session;
	const activities = data?.activities || [];

	const { data: metadata } = useQuery({
		queryKey: ["jules", "session-metadata", sessionId],
		queryFn: async () => {
			const result = await getJulesSessionMetadataAction({ sessionId });
			if (!result.success) throw new Error(result.error);
			return result.data;
		},
		refetchInterval: 10000,
	});

	const { mutate: sendMessage, isPending: isSending } = useMutation({
		mutationFn: async (message: string) => {
			const result = await sendJulesMessageAction({
				sessionId,
				prompt: message,
			});
			if (!result.success) throw new Error(result.error);
			return result;
		},
		onSuccess: () => {
			setInput("");
			toast.success("Message sent");
			queryClient.invalidateQueries({
				queryKey: ["jules", "session", sessionId],
			});
		},
		onError: () => {
			toast.error("Failed to send message");
			pushSystemMessage({
				variant: "error",
				message: "Failed to send message to Jules.",
				actionLabel: "Retry",
				onAction: () => sendMessage(input),
			});
		},
	});

	const { mutate: approvePlan, isPending: isApproving } = useMutation({
		mutationFn: async () => {
			const result = await approveJulesPlanAction({ sessionId });
			if (!result.success) throw new Error(result.error);
			return result;
		},
		onSuccess: () => {
			toast.success("Plan approved");
			queryClient.invalidateQueries({
				queryKey: ["jules", "session", sessionId],
			});
		},
		onError: () => {
			toast.error("Failed to approve plan");
			pushSystemMessage({
				variant: "error",
				message: "Plan approval failed. You can retry or request changes.",
				actionLabel: "Retry",
				onAction: () => approvePlan(),
			});
		},
	});

	const [reviewData, setReviewData] = useState<{
		riskLevel: string;
		analysis: string;
		recommendations: string[];
	} | null>(null);

	const { mutate: reviewPlan, isPending: isReviewing } = useMutation({
		mutationFn: async (plan: JulesPlan) => {
			const result = await reviewJulesPlanAction({ plan });
			if (!result.success) throw new Error(result.error);
			return result.data;
		},
		onSuccess: (data) => {
			setReviewData(data);
			toast.success("Plan reviewed by AI");
		},
		onError: () => {
			toast.error("Failed to review plan");
			pushSystemMessage({
				variant: "error",
				message: "AI review failed. You can retry the review.",
				actionLabel: "Retry",
				onAction: () => {
					const planActivity = activities.find((a) => a.planGenerated);
					if (planActivity?.planGenerated?.plan) {
						reviewPlan(planActivity.planGenerated.plan);
					}
				},
			});
		},
	});

	const { mutate: sendPlanFeedback, isPending: isSendingFeedback } =
		useMutation({
			mutationFn: async ({
				decision,
				notes,
			}: {
				decision: "reject" | "request_changes";
				notes?: string;
			}) => {
				const result = await sendJulesPlanFeedbackAction({
					sessionId,
					decision,
					notes,
				});
				if (!result.success) throw new Error(result.error);
				return result;
			},
			onSuccess: (_, variables) => {
				toast.success(
					variables.decision === "reject"
						? "Plan rejected"
						: "Requested plan changes",
				);
				queryClient.invalidateQueries({
					queryKey: ["jules", "session", sessionId],
				});
			},
			onError: (_error, variables) => {
				toast.error("Failed to send plan feedback");
				pushSystemMessage({
					variant: "error",
					message: "Unable to send plan feedback. Please retry.",
					actionLabel: "Retry",
					onAction: () => sendPlanFeedback(variables),
				});
			},
		});

	const repoFullName = metadata?.repository?.fullName ?? null;
	const baseBranch =
		metadata?.baseBranch ??
		data?.session?.sourceContext?.githubRepoContext?.startingBranch;
	const headBranch = data?.session?.id ? `jules/${data.session.id}` : null;

	const { data: pullRequest, error: pullRequestError } = useQuery({
		queryKey: ["github", "pull-request", repoFullName, baseBranch, headBranch],
		queryFn: async () => {
			if (!repoFullName || !baseBranch || !headBranch) {
				return null;
			}
			const result = await getGitHubPullRequestByBranchAction({
				repoFullName,
				base: baseBranch,
				head: headBranch,
			});
			if (!result.success) throw new Error(result.error);
			return result.data;
		},
		enabled: !!repoFullName && !!baseBranch && !!headBranch,
		refetchInterval: 15000,
	});

	const { data: pullRequestStatus, error: pullRequestStatusError } = useQuery({
		queryKey: [
			"github",
			"pull-request-status",
			repoFullName,
			pullRequest?.number,
		],
		queryFn: async () => {
			if (!repoFullName || !pullRequest?.number) {
				throw new Error("Missing PR context");
			}
			const result = await getGitHubPullRequestStatusAction({
				repoFullName,
				pullRequestNumber: pullRequest.number,
			});
			if (!result.success) throw new Error(result.error);
			return result.data;
		},
		enabled: !!repoFullName && !!pullRequest?.number,
		refetchInterval: 10000,
	});

	const { mutate: mergePullRequest, isPending: isMerging } = useMutation({
		mutationFn: async () => {
			if (!repoFullName || !pullRequest?.number) {
				throw new Error("Missing PR context");
			}
			const result = await mergeGitHubPullRequestAction({
				repoFullName,
				pullRequestNumber: pullRequest.number,
			});
			if (!result.success) throw new Error(result.error);
			return result.data;
		},
		onSuccess: () => {
			toast.success("Pull request merge initiated");
		},
		onError: () => {
			toast.error("Failed to merge pull request");
			pushSystemMessage({
				variant: "error",
				message: "Merge failed. Check status and retry if needed.",
			});
		},
	});

	// biome-ignore lint/correctness/useExhaustiveDependencies: data dependency for scroll
	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, [data?.activities, systemMessages]);

	useEffect(() => {
		if (pullRequestStatus && pullRequest) {
			const signature = serializeStatus(pullRequestStatus);
			if (lastStatusRef.current && lastStatusRef.current !== signature) {
				pushSystemMessage({
					variant: "info",
					message: `PR status updated for #${pullRequest.number}: ${formatStatusSummary(
						pullRequestStatus,
					)}`,
				});
			}
			lastStatusRef.current = signature;
		}
	}, [pullRequestStatus, pullRequest]);

	useEffect(() => {
		if (pullRequestError) {
			const message =
				"Unable to load the pull request from GitHub. Retry in a moment.";
			if (prErrorRef.current !== message) {
				pushSystemMessage({
					variant: "error",
					message,
				});
				prErrorRef.current = message;
			}
		}
	}, [pullRequestError]);

	useEffect(() => {
		if (pullRequestStatusError) {
			const message =
				"Unable to load PR status checks from GitHub. Retry in a moment.";
			if (prStatusErrorRef.current !== message) {
				pushSystemMessage({
					variant: "error",
					message,
				});
				prStatusErrorRef.current = message;
			}
		}
	}, [pullRequestStatusError]);

	useEffect(() => {
		if (!data && isLoading) return;
		if (!data) {
			const errorMessage =
				"Unable to load session activities. Check your connection and retry.";
			if (lastErrorRef.current !== errorMessage) {
				pushSystemMessage({
					variant: "error",
					message: errorMessage,
					actionLabel: "Retry",
					onAction: () =>
						queryClient.invalidateQueries({
							queryKey: ["jules", "session", sessionId],
						}),
				});
				lastErrorRef.current = errorMessage;
			}
		}
	}, [data, isLoading, queryClient, sessionId]);

	const pushSystemMessage = (message: NewSystemMessage) => {
		setSystemMessages((prev) => [
			...prev,
			{
				id: crypto.randomUUID(),
				createdAt: new Date().toISOString(),
				...message,
			},
		]);
	};

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		if (!input.trim() || isSending) return;
		sendMessage(input);
	};

	if (isLoading && !data) {
		return (
			<div className="h-[600px] flex items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	const displayableActivities = activities
		.filter(
			(a: JulesActivity) =>
				a.planGenerated ||
				a.planApproved ||
				a.userMessaged ||
				a.agentMessaged ||
				a.progressUpdated ||
				a.sessionFailed ||
				a.sessionCompleted,
		)
		.sort(
			(a: JulesActivity, b: JulesActivity) =>
				new Date(a.createTime).getTime() - new Date(b.createTime).getTime(),
		);

	const timelineItems: TimelineItem[] = [
		...displayableActivities.map((activity) => ({
			kind: "activity" as const,
			createdAt: activity.createTime,
			activity,
		})),
		...systemMessages.map((message) => ({
			kind: "system" as const,
			createdAt: message.createdAt,
			message,
		})),
	].sort(
		(a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
	);

	const canMerge = !!metadata?.repository?.permissions?.push;
	const enhancedPullRequest = pullRequest
		? {
				...pullRequest,
				status: pullRequestStatus ?? pullRequest.status,
			}
		: null;

	return (
		<div className="flex flex-col h-[700px] gap-4">
			{/* Header */}
			<div className="flex items-center justify-between pb-4 border-b">
				<div className="flex items-center gap-3">
					<Button
						variant="ghost"
						size="icon"
						onClick={onBack}
						aria-label="Go back"
					>
						<ArrowLeft className="h-4 w-4" />
					</Button>
					<div>
						<div className="flex items-center gap-2">
							<h2 className="font-semibold text-lg">
								{session?.title || "Session Details"}
							</h2>
							<Badge variant="outline">{session?.state}</Badge>
						</div>
						<p className="text-xs text-muted-foreground">
							ID: {sessionId}
							{repoFullName && baseBranch && (
								<span className="ml-2 text-muted-foreground/80">
									• {repoFullName} @ {baseBranch}
								</span>
							)}
						</p>
					</div>
				</div>
				{session?.url && (
					<Button variant="outline" size="sm" asChild>
						<a href={session.url} target="_blank" rel="noopener noreferrer">
							View in Console
							<ExternalLink className="ml-2 h-3 w-3" />
						</a>
					</Button>
				)}
			</div>

			{/* Plan Approval Banner */}
			{session?.state === "AWAITING_PLAN_APPROVAL" && (
				<div className="space-y-4">
					{reviewData && (
						<Alert
							variant={
								reviewData.riskLevel === "LOW" ? "default" : "destructive"
							}
							className="bg-background/80 backdrop-blur-md"
						>
							{reviewData.riskLevel === "LOW" ? (
								<ShieldCheck className="h-4 w-4 text-green-500" />
							) : (
								<ShieldAlert className="h-4 w-4" />
							)}
							<AlertTitle>
								AI Security Review: {reviewData.riskLevel} Risk
							</AlertTitle>
							<AlertDescription className="mt-2 text-xs">
								<p className="mb-2">{reviewData.analysis}</p>
								<ul className="list-disc list-inside">
									{reviewData.recommendations.map((rec, i) => (
										// biome-ignore lint/suspicious/noArrayIndexKey: stable
										<li key={i}>{rec}</li>
									))}
								</ul>
							</AlertDescription>
						</Alert>
					)}

					<GlassCard className="p-4 bg-yellow-500/10 border-yellow-500/20 flex flex-wrap items-center justify-between gap-4">
						<div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
							<Loader2 className="h-4 w-4 animate-spin" />
							<span className="font-medium">Plan requires approval</span>
						</div>
						<div className="flex items-center gap-2">
							{!reviewData && activities.find((a) => a.planGenerated) && (
								<Button
									variant="secondary"
									size="sm"
									onClick={() => {
										const planActivity = activities.find(
											(a) => a.planGenerated,
										);
										if (planActivity?.planGenerated?.plan) {
											reviewPlan(planActivity.planGenerated.plan);
										}
									}}
									disabled={isReviewing}
									className="gap-2"
								>
									{isReviewing ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : (
										<Shield className="h-4 w-4" />
									)}
									AI Review
								</Button>
							)}
							<Button
								variant="outline"
								onClick={() =>
									sendPlanFeedback({ decision: "request_changes" })
								}
								disabled={isSendingFeedback}
							>
								Request Changes
							</Button>
							<Button
								variant="outline"
								onClick={() => sendPlanFeedback({ decision: "reject" })}
								disabled={isSendingFeedback}
							>
								Reject Plan
							</Button>
							<Button
								onClick={() => approvePlan()}
								disabled={isApproving}
								className="gap-2"
								aria-label={isApproving ? "Approving plan" : "Approve plan"}
							>
								{isApproving ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									<Check className="h-4 w-4" />
								)}
								{isApproving ? "Approving..." : "Approve Plan"}
							</Button>
						</div>
					</GlassCard>
				</div>
			)}

			{/* PR Status */}
			{enhancedPullRequest ? (
				<JulesPullRequestCard
					pullRequest={enhancedPullRequest}
					repoFullName={repoFullName ?? ""}
					baseBranch={baseBranch ?? ""}
					headBranch={headBranch ?? ""}
					canMerge={canMerge}
					isMerging={isMerging}
					onMerge={() => mergePullRequest()}
					onAskFollowUp={() =>
						setInput(
							`Can you review PR #${enhancedPullRequest.number} status and next steps?`,
						)
					}
				/>
			) : null}

			{/* Chat Area */}
			<GlassCard className="flex-1 overflow-hidden flex flex-col p-0">
				<ScrollArea className="flex-1 p-4" ref={scrollRef}>
					<div className="space-y-6">
						{session?.prompt && (
							<div className="flex flex-col gap-1 items-end">
								<div className="bg-primary text-primary-foreground px-4 py-2 rounded-2xl rounded-tr-sm max-w-[80%]">
									{session.prompt}
								</div>
								<span className="text-[10px] text-muted-foreground">Start</span>
							</div>
						)}

						{timelineItems.map((item) =>
							item.kind === "activity" ? (
								<ActivityItem key={item.activity.id} activity={item.activity} />
							) : (
								<SystemMessageItem key={item.message.id} item={item.message} />
							),
						)}
					</div>
				</ScrollArea>

				{/* Input */}
				<div className="p-4 border-t bg-muted/20">
					<form onSubmit={handleSubmit} className="flex gap-2">
						<Input
							value={input}
							onChange={(e) => setInput(e.target.value)}
							placeholder={
								session?.state === "COMPLETED"
									? "Session completed"
									: "Reply to Jules..."
							}
							disabled={isSending || session?.state === "COMPLETED"}
						/>
						<Button
							type="submit"
							disabled={
								isSending || !input.trim() || session?.state === "COMPLETED"
							}
							aria-label={isSending ? "Sending message" : "Send message"}
						>
							{isSending ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<Send className="h-4 w-4" />
							)}
						</Button>
					</form>
				</div>
			</GlassCard>
		</div>
	);
}

type SystemMessage = {
	id: string;
	createdAt: string;
	variant: "info" | "error";
	message: string;
	actionLabel?: string;
	onAction?: () => void;
};

type NewSystemMessage = Omit<SystemMessage, "id" | "createdAt">;

type TimelineItem =
	| {
			kind: "activity";
			createdAt: string;
			activity: JulesActivity;
	  }
	| {
			kind: "system";
			createdAt: string;
			message: SystemMessage;
	  };

function serializeStatus(status: GitHubPullRequestStatus): string {
	return JSON.stringify({
		state: status.state,
		mergeable: status.mergeable,
		hasConflicts: status.hasConflicts,
		checks: status.checks.map((check) => ({
			name: check.name,
			status: check.status,
			conclusion: check.conclusion,
		})),
	});
}

function formatStatusSummary(status: GitHubPullRequestStatus): string {
	const checksSummary = status.checks.length
		? `${status.checks.filter((check) => check.conclusion === "success").length}/${
				status.checks.length
			} checks passing`
		: "no checks";
	const mergeable =
		status.mergeable === null
			? "mergeability pending"
			: status.mergeable
				? "mergeable"
				: "not mergeable";
	const conflicts = status.hasConflicts ? "conflicts detected" : "no conflicts";
	return `${status.state} • ${checksSummary} • ${mergeable} • ${conflicts}`;
}

/**
 * Renders a single activity item (message, plan, progress, etc.)
 */
function ActivityItem({ activity }: { activity: JulesActivity }): JSX.Element {
	const isUser = activity.userMessaged !== undefined;

	if (isUser) {
		return (
			<div className="flex flex-col gap-1 items-end">
				<div className="bg-primary text-primary-foreground px-4 py-2 rounded-2xl rounded-tr-sm max-w-[80%]">
					{activity.userMessaged?.userMessage}
				</div>
				<span className="text-[10px] text-muted-foreground">
					{format(new Date(activity.createTime), "HH:mm")}
				</span>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-1 items-start">
			<div className="bg-muted px-4 py-2 rounded-2xl rounded-tl-sm max-w-[80%] space-y-2">
				{/* Agent Message */}
				{activity.agentMessaged && (
					<div className="whitespace-pre-wrap">
						{activity.agentMessaged.agentMessage}
					</div>
				)}

				{/* Plan Generated */}
				{activity.planGenerated && (
					<div className="text-sm font-mono bg-background/50 p-2 rounded border">
						<div className="font-semibold mb-1 text-xs uppercase text-muted-foreground">
							Plan Generated
						</div>
						<ul className="list-disc list-inside space-y-1">
							{activity.planGenerated.plan.steps.map((step, i) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: stable enough
								<li key={i} className="text-xs">
									<span
										className={
											step.state === "COMPLETED"
												? "text-green-500"
												: step.state === "IN_PROGRESS"
													? "text-blue-500"
													: ""
										}
									>
										{step.state === "COMPLETED" ? "✅ " : "○ "}
									</span>
									{step.description}
								</li>
							))}
						</ul>
					</div>
				)}

				{/* Progress Update */}
				{activity.progressUpdated && (
					<div className="text-xs italic text-muted-foreground">
						<span className="font-semibold">
							{activity.progressUpdated.title}:
						</span>{" "}
						{activity.progressUpdated.description}
					</div>
				)}

				{/* Plan Approved */}
				{activity.planApproved && (
					<div className="text-xs font-medium text-green-600 flex items-center gap-1">
						<Check className="h-3 w-3" /> Plan Approved
					</div>
				)}

				{/* Error */}
				{activity.sessionFailed && (
					<div className="text-sm text-red-500 font-medium">
						❌ Session Failed: {activity.sessionFailed.reason}
					</div>
				)}

				{/* Completed */}
				{activity.sessionCompleted && (
					<div className="text-sm text-green-600 font-medium">
						🎉 Session Completed
					</div>
				)}

				{/* Artifacts */}
				{activity.artifacts && activity.artifacts.length > 0 && (
					<ArtifactRenderer artifacts={activity.artifacts} />
				)}
			</div>
			<span className="text-[10px] text-muted-foreground">
				Jules • {format(new Date(activity.createTime), "HH:mm")}
			</span>
		</div>
	);
}

function SystemMessageItem({ item }: { item: SystemMessage }): JSX.Element {
	return (
		<div className="flex flex-col items-center gap-2">
			<GlassCard
				className={`px-4 py-2 text-xs ${
					item.variant === "error"
						? "bg-red-500/10 border-red-500/20 text-red-600"
						: "bg-blue-500/10 border-blue-500/20 text-blue-700"
				}`}
			>
				<div className="flex flex-col items-center gap-2 text-center">
					<span>{item.message}</span>
					{item.actionLabel && item.onAction && (
						<Button size="sm" variant="outline" onClick={item.onAction}>
							{item.actionLabel}
						</Button>
					)}
				</div>
			</GlassCard>
			<span className="text-[10px] text-muted-foreground">
				System • {format(new Date(item.createdAt), "HH:mm")}
			</span>
		</div>
	);
}
