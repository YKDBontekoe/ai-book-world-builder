"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type JSX, useMemo, useState } from "react";
import { toast } from "sonner";
import { startFixSessionAction } from "@/app/actions/builder";
import type { GitHubIssue } from "@/app/actions/github";
import { getIssues, getPullRequests } from "@/app/actions/github";
import {
	approveJulesPlanAction,
	getJulesSessionsAction,
	listJulesSourcesAction,
} from "@/app/actions/jules";
import { ItemDetail } from "../github/item-detail";
import { JulesChat } from "../jules/jules-chat";
import { CreateFeatureDialog } from "./create-feature-dialog";
import { TaskCard, type TaskItem } from "./task-card";

type ColumnType = "backlog" | "in_progress" | "review" | "done";

interface Column {
	id: ColumnType;
	title: string;
	items: TaskItem[];
}

export function TaskBoard(): JSX.Element {
	const [selectedItem, setSelectedItem] = useState<TaskItem | null>(null);
	const [approvingSessionId, setApprovingSessionId] = useState<string | null>(
		null,
	);
	const queryClient = useQueryClient();

	// --- Data Fetching ---

	const { data: sources } = useQuery({
		queryKey: ["jules", "sources"],
		queryFn: async () => {
			const res = await listJulesSourcesAction();
			if (!res.success) throw new Error(res.error);
			return res.data;
		},
	});

	// Use the first available source for feature planning
	const defaultSource = sources?.[0]?.name;

	const { data: issues } = useQuery({
		queryKey: ["github", "issues", "open"],
		queryFn: async () => {
			const res = await getIssues("open");
			return res.success && Array.isArray(res.data) ? res.data : [];
		},
	});

	const { data: closedIssues } = useQuery({
		queryKey: ["github", "issues", "closed"],
		queryFn: async () => {
			const res = await getIssues("closed");
			return res.success && Array.isArray(res.data) ? res.data : [];
		},
	});

	const { data: prs } = useQuery({
		queryKey: ["github", "prs", "open"],
		queryFn: async () => {
			const res = await getPullRequests("open");
			return res.success && Array.isArray(res.data) ? res.data : [];
		},
	});

	const { data: closedPrs } = useQuery({
		queryKey: ["github", "prs", "closed"],
		queryFn: async () => {
			const res = await getPullRequests("closed");
			return res.success && Array.isArray(res.data) ? res.data : [];
		},
	});

	const { data: sessions } = useQuery({
		queryKey: ["jules", "sessions"],
		queryFn: async () => {
			const res = await getJulesSessionsAction({ pageSize: 50 });
			return res.success && res.data && Array.isArray(res.data.sessions)
				? res.data.sessions
				: [];
		},
		refetchInterval: 10000, // Poll for session updates
	});

	// --- Mutations ---

	const { mutate: startFix } = useMutation({
		mutationFn: async (issue: GitHubIssue) => {
			const res = await startFixSessionAction({ issueNumber: issue.number });
			if (!res.success) throw new Error(res.error);
			return res.data;
		},
		onSuccess: (_newSession) => {
			toast.success("Jules is working on the fix!");
			queryClient.invalidateQueries({ queryKey: ["jules", "sessions"] });
		},
		onError: (err) => {
			toast.error(`Failed to start fix: ${err.message}`);
		},
	});

	const { mutate: approvePlan } = useMutation({
		mutationFn: async (sessionId: string) => {
			setApprovingSessionId(sessionId);
			const res = await approveJulesPlanAction({ sessionId });
			if (!res.success) throw new Error(res.error);
			return res;
		},
		onSuccess: () => {
			toast.success("Plan approved");
			queryClient.invalidateQueries({ queryKey: ["jules", "sessions"] });
		},
		onError: (err) => {
			toast.error(`Failed to approve plan: ${err.message}`);
		},
		onSettled: () => {
			setApprovingSessionId(null);
		},
	});

	// --- Data Organization ---

	const columns: Column[] = useMemo(() => {
		const backlogItems: TaskItem[] = (Array.isArray(issues) ? issues : []).map(
			(i) => ({
				type: "issue",
				data: i,
			}),
		);

		const sessionItems: TaskItem[] = (Array.isArray(sessions) ? sessions : [])
			.filter(
				(s) =>
					s.state !== "COMPLETED" &&
					s.state !== "FAILED" &&
					s.state !== "PAUSED",
			)
			.map((s) => ({ type: "session", data: s }));

		const reviewItems: TaskItem[] = (Array.isArray(prs) ? prs : []).map(
			(p) => ({
				type: "pr",
				data: p,
			}),
		);

		const doneItems: TaskItem[] = [
			...(Array.isArray(closedPrs) ? closedPrs : []).map((p) => ({
				type: "pr" as const,
				data: p,
			})),
			...(Array.isArray(closedIssues) ? closedIssues : []).map((i) => ({
				type: "issue" as const,
				data: i,
			})),
		].sort(
			(a, b) =>
				new Date(b.data.updated_at).getTime() -
				new Date(a.data.updated_at).getTime(),
		);

		return [
			{ id: "backlog", title: "Backlog", items: backlogItems },
			{ id: "in_progress", title: "In Progress (Jules)", items: sessionItems },
			{ id: "review", title: "Review", items: reviewItems },
			{ id: "done", title: "Done", items: doneItems },
		];
	}, [issues, closedIssues, prs, closedPrs, sessions]);

	// --- Interaction ---

	const handleFix = (issue: GitHubIssue) => {
		if (confirm(`Ask Jules to fix issue #${issue.number}?`)) {
			startFix(issue);
		}
	};

	const handleApprove = (sessionId: string) => {
		approvePlan(sessionId);
	};

	if (selectedItem) {
		if (selectedItem.type === "session") {
			return (
				<JulesChat
					sessionId={selectedItem.data.id}
					onBack={() => setSelectedItem(null)}
				/>
			);
		}
		return (
			<ItemDetail
				type={selectedItem.type}
				number={selectedItem.data.number}
				onBack={() => setSelectedItem(null)}
			/>
		);
	}

	return (
		<div className="h-[calc(100vh-12rem)] overflow-x-auto pb-4">
			<div className="flex h-full gap-6 min-w-[1000px]">
				{columns.map((col) => (
					<div key={col.id} className="w-[300px] flex-shrink-0 flex flex-col">
						<div className="flex items-center justify-between mb-3 px-1">
							<h3 className="font-semibold text-sm flex items-center gap-2">
								{col.title}
								<span className="bg-muted text-muted-foreground px-2 py-0.5 rounded-full text-xs">
									{col.items.length}
								</span>
							</h3>
							{col.id === "backlog" && defaultSource && (
								<CreateFeatureDialog defaultSource={defaultSource} />
							)}
						</div>

						<div className="flex-1 overflow-y-auto pr-2 space-y-3">
							{col.items.length === 0 ? (
								<div className="text-center py-8 text-xs text-muted-foreground border-2 border-dashed rounded-lg">
									No items
								</div>
							) : (
								col.items.map((item) => (
									<TaskCard
										key={
											item.type === "session" ? item.data.id : item.data.number
										}
										item={item}
										onSelect={setSelectedItem}
										onFix={item.type === "issue" ? handleFix : undefined}
										onApprove={
											item.type === "session" ? handleApprove : undefined
										}
										isApproving={
											item.type === "session"
												? approvingSessionId === item.data.id
												: false
										}
									/>
								))
							)}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
