import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
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
import type { JulesPlan, Session } from "@/lib/jules-client";
import type { SystemMessage } from "../components/system-message-item";

export interface UseJulesChatReturn {
	input: string;
	setInput: (value: string) => void;
	systemMessages: SystemMessage[];
	session: Session | undefined;
	activities: any[]; // Using any to avoid circular deps or complex imports, matching inferred type
	metadata: any;
	isLoading: boolean;
	isSending: boolean;
	sendMessage: (message: string) => void;
	approvePlan: () => void;
	isApproving: boolean;
	reviewData: {
		riskLevel: string;
		analysis: string;
		recommendations: string[];
	} | null;
	reviewPlan: (plan: JulesPlan) => void;
	isReviewing: boolean;
	sendPlanFeedback: (variables: {
		decision: "reject" | "request_changes";
		notes?: string;
	}) => void;
	isSendingFeedback: boolean;
	repoFullName: string | null;
	baseBranch: string | undefined;
	headBranch: string | null;
	pullRequest: any;
	pullRequestStatus: any;
	mergePullRequest: () => void;
	isMerging: boolean;
	enhancedPullRequest: any;
	canMerge: boolean;
}

export function useJulesChat(sessionId: string): UseJulesChatReturn {
	const queryClient = useQueryClient();
	const [input, setInput] = useState("");
	const [systemMessages, setSystemMessages] = useState<SystemMessage[]>([]);
	const lastStatusRef = useRef<string | null>(null);
	const lastErrorRef = useRef<string | null>(null);
	const prErrorRef = useRef<string | null>(null);
	const prStatusErrorRef = useRef<string | null>(null);

	// Track the attempted message for retries
	const attemptedMessageRef = useRef<string>("");

	// Track activities in a ref for callbacks
	const activitiesRef = useRef<any[]>([]);

	const pushSystemMessage = useCallback(
		(message: Omit<SystemMessage, "id" | "createdAt">) => {
			setSystemMessages((prev) => [
				...prev,
				{
					id: crypto.randomUUID(),
					createdAt: new Date().toISOString(),
					...message,
				},
			]);
		},
		[],
	);

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

	// Keep activitiesRef in sync
	useEffect(() => {
		activitiesRef.current = activities;
	}, [activities]);

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
			attemptedMessageRef.current = message;
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
				onAction: () => sendMessage(attemptedMessageRef.current),
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
					// Use ref to get latest activities
					const currentActivities = activitiesRef.current;
					const planActivity = currentActivities.find((a) => a.planGenerated);
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

	useEffect(() => {
		if (pullRequestStatus && pullRequest) {
			const signature = JSON.stringify({
				state: pullRequestStatus.state,
				mergeable: pullRequestStatus.mergeable,
				hasConflicts: pullRequestStatus.hasConflicts,
				checks: pullRequestStatus.checks.map((check: any) => ({
					name: check.name,
					status: check.status,
					conclusion: check.conclusion,
				})),
			});
			if (lastStatusRef.current && lastStatusRef.current !== signature) {
				const checksSummary = pullRequestStatus.checks.length
					? `${pullRequestStatus.checks.filter((check: any) => check.conclusion === "success").length}/${pullRequestStatus.checks.length} checks passing`
					: "no checks";
				const mergeable =
					pullRequestStatus.mergeable === null
						? "mergeability pending"
						: pullRequestStatus.mergeable
							? "mergeable"
							: "not mergeable";
				const conflicts = pullRequestStatus.hasConflicts
					? "conflicts detected"
					: "no conflicts";
				const summary = `${pullRequestStatus.state} • ${checksSummary} • ${mergeable} • ${conflicts}`;

				pushSystemMessage({
					variant: "info",
					message: `PR status updated for #${pullRequest.number}: ${summary}`,
				});
			}
			lastStatusRef.current = signature;
		}
	}, [pullRequestStatus, pullRequest, pushSystemMessage]);

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
	}, [pullRequestError, pushSystemMessage]);

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
	}, [pullRequestStatusError, pushSystemMessage]);

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
	}, [data, isLoading, queryClient, sessionId, pushSystemMessage]);

	return {
		input,
		setInput,
		systemMessages,
		session,
		activities,
		metadata,
		isLoading,
		isSending,
		sendMessage,
		approvePlan,
		isApproving,
		reviewData,
		reviewPlan,
		isReviewing,
		sendPlanFeedback,
		isSendingFeedback,
		repoFullName,
		baseBranch,
		headBranch,
		pullRequest,
		pullRequestStatus,
		mergePullRequest,
		isMerging,
		enhancedPullRequest: pullRequest
			? {
					...pullRequest,
					status: pullRequestStatus ?? pullRequest.status,
				}
			: null,
		canMerge: !!metadata?.repository?.permissions?.push,
	};
}
