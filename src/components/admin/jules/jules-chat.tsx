"use client";

import {
	ArrowLeft,
	ExternalLink,
	Loader2,
	Send,
} from "lucide-react";
import {
	type FormEvent,
	type JSX,
	useEffect,
	useRef,
} from "react";

import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { ScrollArea } from "@/components/atoms/scroll-area";
import { GlassCard } from "@/components/molecules/glass-card";
import type { JulesActivity } from "@/lib/jules-client";

import { ActivityItem } from "./chat/components/activity-item";
import { PlanApprovalBanner } from "./chat/components/plan-approval-banner";
import {
	type SystemMessage,
	SystemMessageItem,
} from "./chat/components/system-message-item";
import { useJulesChat } from "./chat/hooks/use-jules-chat";
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

/**
 * Chat interface for interacting with a Jules session.
 */
export function JulesChat({ sessionId, onBack }: JulesChatProps): JSX.Element {
	const scrollRef = useRef<HTMLDivElement>(null);

	const {
		input,
		setInput,
		systemMessages,
		session,
		activities,
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
		mergePullRequest,
		isMerging,
		enhancedPullRequest,
		canMerge,
	} = useJulesChat(sessionId);

	// biome-ignore lint/correctness/useExhaustiveDependencies: data dependency for scroll
	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, [activities, systemMessages]);

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		if (!input.trim() || isSending) return;
		sendMessage(input);
	};

	if (isLoading && !session) {
		return (
			<div className="flex-1 min-h-0 flex items-center justify-center">
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

	return (
		<div className="flex flex-col min-h-0 h-full gap-4">
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
				<PlanApprovalBanner
					reviewData={reviewData}
					isReviewing={isReviewing}
					isApproving={isApproving}
					isSendingFeedback={isSendingFeedback}
					activities={activities}
					onReview={reviewPlan}
					onApprove={() => approvePlan()}
					onRequestChanges={() =>
						sendPlanFeedback({ decision: "request_changes" })
					}
					onReject={() => sendPlanFeedback({ decision: "reject" })}
				/>
			)}

			{/* PR Status */}
			{enhancedPullRequest ? (
				<JulesPullRequestCard
					pullRequest={enhancedPullRequest}
					repoFullName={repoFullName ?? ""}
					baseBranch={baseBranch ?? ""}
					headBranch={enhancedPullRequest.head.ref}
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
			<GlassCard className="flex-1 min-h-0 overflow-hidden flex flex-col p-0">
				<ScrollArea className="flex-1 min-h-0 p-4" ref={scrollRef}>
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
