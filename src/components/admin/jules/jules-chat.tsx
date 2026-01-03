"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowLeft, Check, ExternalLink, Loader2, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
	approveJulesPlanAction,
	getJulesSessionDetailsAction,
	sendJulesMessageAction,
} from "@/app/actions/jules";
import { GlassCard } from "@/components/molecules/glass-card";
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { ScrollArea } from "@/components/atoms/scroll-area";
import type { JulesActivity } from "@/lib/jules-client";

interface JulesChatProps {
	sessionId: string;
	onBack: () => void;
}

export function JulesChat({ sessionId, onBack }: JulesChatProps) {
	const queryClient = useQueryClient();
	const scrollRef = useRef<HTMLDivElement>(null);
	const [input, setInput] = useState("");

	const { data, isLoading } = useQuery({
		queryKey: ["jules", "session", sessionId],
		queryFn: () => getJulesSessionDetailsAction(sessionId),
		refetchInterval: 5000,
	});

	const { mutate: sendMessage, isPending: isSending } = useMutation({
		mutationFn: async (message: string) => {
			const result = await sendJulesMessageAction(sessionId, message);
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
		},
	});

	const { mutate: approvePlan, isPending: isApproving } = useMutation({
		mutationFn: async () => {
			const result = await approveJulesPlanAction(sessionId);
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
		},
	});

	// biome-ignore lint/correctness/useExhaustiveDependencies: data dependency for scroll
	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, [data?.data?.activities]);

	const handleSubmit = (e: React.FormEvent) => {
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

	const session = data?.data?.session;
	const activities = data?.data?.activities || [];

	const displayableActivities = activities
		.filter(
			(a) =>
				a.planGenerated ||
				a.planApproved ||
				a.userMessaged ||
				a.agentMessaged ||
				a.progressUpdated ||
				a.sessionFailed ||
				a.sessionCompleted,
		)
		.sort(
			(a, b) =>
				new Date(a.createTime).getTime() - new Date(b.createTime).getTime(),
		);

	return (
		<div className="flex flex-col h-[700px] gap-4">
			{/* Header */}
			<div className="flex items-center justify-between pb-4 border-b">
				<div className="flex items-center gap-3">
					<Button variant="ghost" size="icon" onClick={onBack}>
						<ArrowLeft className="h-4 w-4" />
					</Button>
					<div>
						<div className="flex items-center gap-2">
							<h2 className="font-semibold text-lg">
								{session?.title || "Session Details"}
							</h2>
							<Badge variant="outline">{session?.state}</Badge>
						</div>
						<p className="text-xs text-muted-foreground">ID: {sessionId}</p>
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
				<GlassCard className="p-4 bg-yellow-500/10 border-yellow-500/20 flex items-center justify-between">
					<div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
						<Loader2 className="h-4 w-4 animate-spin" />
						<span className="font-medium">Plan requires approval</span>
					</div>
					<Button
						onClick={() => approvePlan()}
						disabled={isApproving}
						className="gap-2"
					>
						{isApproving ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							<Check className="h-4 w-4" />
						)}
						Approve Plan
					</Button>
				</GlassCard>
			)}

			{/* PR Status */}
			{session?.outputs?.map((output, i) =>
				output.pullRequest ? (
					<GlassCard
						// biome-ignore lint/suspicious/noArrayIndexKey: no stable id
						key={i}
						className="p-3 bg-green-500/10 border-green-500/20 flex items-center justify-between"
					>
						<span className="text-sm font-medium text-green-600">
							Pull Request: {output.pullRequest.title}
						</span>
						<Button size="sm" variant="ghost" asChild>
							<a
								href={output.pullRequest.url}
								target="_blank"
								rel="noopener noreferrer"
							>
								View PR <ExternalLink className="ml-2 h-3 w-3" />
							</a>
						</Button>
					</GlassCard>
				) : null,
			)}

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

						{displayableActivities.map((activity, idx) => (
							<ActivityItem
								// biome-ignore lint/suspicious/noArrayIndexKey: no stable id
								key={idx}
								activity={activity}
							/>
						))}
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

function ActivityItem({ activity }: { activity: JulesActivity }) {
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
			</div>
			<span className="text-[10px] text-muted-foreground">
				Jules • {format(new Date(activity.createTime), "HH:mm")}
			</span>
		</div>
	);
}
