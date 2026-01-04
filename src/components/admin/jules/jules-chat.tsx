"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
	ArrowLeft,
	Check,
	ExternalLink,
	LayoutDashboard,
	ListTodo,
	Loader2,
	Send,
	Shield,
	ShieldAlert,
	ShieldCheck,
} from "lucide-react";
import { type JSX, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
	approveJulesPlanAction,
	getJulesSessionDetailsAction,
	sendJulesMessageAction,
} from "@/app/actions/jules";
import { reviewJulesPlanAction } from "@/app/actions/jules-ai";
import { Alert, AlertDescription, AlertTitle } from "@/components/atoms/alert";
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/atoms/resizable";
import { ScrollArea } from "@/components/atoms/scroll-area";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@/components/atoms/tabs";
import { GlassCard } from "@/components/molecules/glass-card";
import type { JulesActivity, JulesPlan } from "@/lib/jules-client";
import { PlanProgress } from "./plan-progress";
import { SessionArtifacts } from "./session-artifacts";

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
	const [activeTab, setActiveTab] = useState("plan");

	const { data, isLoading } = useQuery({
		queryKey: ["jules", "session", sessionId],
		queryFn: async () => {
			const result = await getJulesSessionDetailsAction({ sessionId });
			if (!result.success) throw new Error(result.error);
			return result.data;
		},
		refetchInterval: 5000,
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
		},
	});

	// biome-ignore lint/correctness/useExhaustiveDependencies: data dependency for scroll
	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, [data?.activities]);

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

	const session = data?.session;
	const activities = data?.activities || [];

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

	return (
		<div className="flex flex-col h-[800px] bg-background border rounded-lg overflow-hidden shadow-sm">
			{/* Header */}
			<div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
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
							<h2 className="font-semibold text-lg leading-tight">
								{session?.title || "Session Details"}
							</h2>
							<Badge variant="outline" className="text-[10px] h-5">
								{session?.state}
							</Badge>
						</div>
						<div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
							<span className="font-mono">{sessionId.split("/").pop()}</span>
							<span>•</span>
							<span>
								{session?.sourceContext?.githubRepoContext?.startingBranch ||
									"main"}
							</span>
						</div>
					</div>
				</div>
				<div className="flex items-center gap-2">
					{session?.url && (
						<Button variant="ghost" size="sm" asChild>
							<a href={session.url} target="_blank" rel="noopener noreferrer">
								Console
								<ExternalLink className="ml-2 h-3 w-3" />
							</a>
						</Button>
					)}
				</div>
			</div>

			{/* Main Content Area - Split Pane */}
			<div className="flex-1 min-h-0">
				<ResizablePanelGroup direction="horizontal">
					{/* Left: Chat */}
					<ResizablePanel defaultSize={50} minSize={30}>
						<div className="flex flex-col h-full">
							{/* Status Banners */}
							{session?.state === "AWAITING_PLAN_APPROVAL" && (
								<div className="p-4 pb-0 space-y-4">
									{reviewData && (
										<Alert
											variant={
												reviewData.riskLevel === "LOW"
													? "default"
													: "destructive"
											}
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
											<span className="font-medium">
												Plan requires approval
											</span>
										</div>
										<div className="flex items-center gap-2">
											{!reviewData &&
												activities.find((a) => a.planGenerated) && (
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
												onClick={() => approvePlan()}
												disabled={isApproving}
												className="gap-2"
												aria-label={
													isApproving ? "Approving plan" : "Approve plan"
												}
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
							{session?.outputs?.map((output, i) =>
								output.pullRequest ? (
									// biome-ignore lint/suspicious/noArrayIndexKey: stable enough
									<div className="px-4 pt-4" key={i}>
										<GlassCard className="p-3 bg-green-500/10 border-green-500/20 flex items-center justify-between">
											<span className="text-sm font-medium text-green-600">
												PR Created: {output.pullRequest.title}
											</span>
											<Button size="sm" variant="ghost" asChild>
												<a
													href={output.pullRequest.url}
													target="_blank"
													rel="noopener noreferrer"
												>
													View <ExternalLink className="ml-2 h-3 w-3" />
												</a>
											</Button>
										</GlassCard>
									</div>
								) : null,
							)}

							<ScrollArea className="flex-1 p-4" ref={scrollRef}>
								<div className="space-y-6">
									{session?.prompt && (
										<div className="flex flex-col gap-1 items-end">
											<div className="bg-primary text-primary-foreground px-4 py-2 rounded-2xl rounded-tr-sm max-w-[90%]">
												{session.prompt}
											</div>
											<span className="text-[10px] text-muted-foreground">
												Start
											</span>
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
										className="flex-1"
									/>
									<Button
										type="submit"
										size="icon"
										disabled={
											isSending ||
											!input.trim() ||
											session?.state === "COMPLETED"
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
						</div>
					</ResizablePanel>

					<ResizableHandle withHandle />

					{/* Right: Context (Plan/Files) */}
					<ResizablePanel defaultSize={50} minSize={30}>
						<Tabs
							defaultValue="plan"
							value={activeTab}
							onValueChange={setActiveTab}
							className="h-full flex flex-col"
						>
							<div className="border-b px-2 bg-muted/10">
								<TabsList className="w-full justify-start h-12 bg-transparent p-0 gap-4">
									<TabsTrigger
										value="plan"
										className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none px-2"
									>
										<ListTodo className="h-4 w-4 mr-2" />
										Live Plan
									</TabsTrigger>
									<TabsTrigger
										value="artifacts"
										className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none px-2"
									>
										<LayoutDashboard className="h-4 w-4 mr-2" />
										Artifacts & Diffs
									</TabsTrigger>
								</TabsList>
							</div>

							<TabsContent value="plan" className="flex-1 min-h-0 m-0">
								<PlanProgress activities={activities} />
							</TabsContent>

							<TabsContent value="artifacts" className="flex-1 min-h-0 m-0">
								<SessionArtifacts activities={activities} />
							</TabsContent>
						</Tabs>
					</ResizablePanel>
				</ResizablePanelGroup>
			</div>
		</div>
	);
}

/**
 * Renders a single activity item (message, plan, progress, etc.)
 */
function ActivityItem({ activity }: { activity: JulesActivity }): JSX.Element {
	const isUser = activity.userMessaged !== undefined;

	if (isUser) {
		return (
			<div className="flex flex-col gap-1 items-end">
				<div className="bg-primary text-primary-foreground px-4 py-2 rounded-2xl rounded-tr-sm max-w-[90%]">
					{activity.userMessaged?.userMessage}
				</div>
				<span className="text-[10px] text-muted-foreground">
					{format(new Date(activity.createTime), "HH:mm")}
				</span>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-1 items-start max-w-[90%]">
			<div className="bg-muted px-4 py-2 rounded-2xl rounded-tl-sm w-full space-y-2">
				{/* Agent Message */}
				{activity.agentMessaged && (
					<div className="whitespace-pre-wrap">
						{activity.agentMessaged.agentMessage}
					</div>
				)}

				{/* Plan Generated - Short Summary since we have the full panel now */}
				{activity.planGenerated && (
					<div className="text-sm font-mono bg-background/50 p-2 rounded border opacity-70">
						<div className="font-semibold mb-1 text-xs uppercase text-muted-foreground flex items-center gap-2">
							<ListTodo className="h-3 w-3" /> Plan Generated
						</div>
						<p className="text-xs">
							{activity.planGenerated.plan.steps.length} steps created. See
							"Live Plan" for details.
						</p>
					</div>
				)}

				{/* Progress Update */}
				{activity.progressUpdated && (
					<div className="text-xs italic text-muted-foreground flex items-center gap-2">
						<Loader2 className="h-3 w-3 animate-spin" />
						<span>
							<span className="font-semibold">
								{activity.progressUpdated.title}:
							</span>{" "}
							{activity.progressUpdated.description}
						</span>
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
