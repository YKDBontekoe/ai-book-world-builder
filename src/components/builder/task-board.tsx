"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Filter, LayoutList, Maximize2, Minimize2, Search } from "lucide-react";
import { type JSX, useMemo, useState } from "react";
import { toast } from "sonner";
import { useLocalStorage } from "usehooks-ts";
import { startFixSessionAction } from "@/app/actions/builder";
import type { GitHubIssue } from "@/app/actions/github";
import { getIssues, getPullRequests } from "@/app/actions/github";
import {
	getJulesSessionsAction,
	listJulesSourcesAction,
} from "@/app/actions/jules";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/atoms/select";
import { Switch } from "@/components/atoms/switch";
import { ItemDetail } from "../admin/github/item-detail";
import { CreateFeatureDialog } from "./create-feature-dialog";
import { JulesChat } from "./jules/jules-chat";
import { TaskCard, type TaskItem } from "./task-card";

type ColumnType = "backlog" | "in_progress" | "review" | "done";

interface Column {
	id: ColumnType;
	title: string;
	items: TaskItem[];
}

export function TaskBoard(): JSX.Element {
	const [selectedItem, setSelectedItem] = useState<TaskItem | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [typeFilter, setTypeFilter] = useLocalStorage<
		"all" | "issue" | "pr" | "session"
	>("builder-type-filter", "all");
	const [isCompact, setIsCompact] = useLocalStorage(
		"builder-compact-mode",
		false,
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
			// Optionally switch to the new session immediately?
			// For now, let it appear in "In Progress"
		},
		onError: (err) => {
			toast.error(`Failed to start fix: ${err.message}`);
		},
	});

	// --- Data Organization ---

	const columns: Column[] = useMemo(() => {
		const filterItem = (item: TaskItem) => {
			// Type Filter
			if (typeFilter !== "all" && item.type !== typeFilter) return false;

			// Search Filter
			if (searchQuery) {
				const query = searchQuery.toLowerCase();
				const title = (
					item.type === "session"
						? item.data.title || item.data.prompt
						: item.data.title
				)?.toLowerCase();
				const id = (
					item.type === "session" ? item.data.id : item.data.number.toString()
				)?.toLowerCase();

				if (!title?.includes(query) && !id?.includes(query)) return false;
			}

			return true;
		};

		const backlogItems: TaskItem[] = (Array.isArray(issues) ? issues : [])
			.map((i) => ({
				type: "issue" as const,
				data: i,
			}))
			.filter(filterItem);

		const sessionItems: TaskItem[] = (Array.isArray(sessions) ? sessions : [])
			.filter(
				(s) =>
					s.state !== "COMPLETED" &&
					s.state !== "FAILED" &&
					s.state !== "PAUSED",
			)
			.map((s) => ({ type: "session" as const, data: s }))
			.filter(filterItem);

		const reviewItems: TaskItem[] = (Array.isArray(prs) ? prs : [])
			.map((p) => ({
				type: "pr" as const,
				data: p,
			}))
			.filter(filterItem);

		const doneItems: TaskItem[] = [
			...(Array.isArray(closedPrs) ? closedPrs : []).map((p) => ({
				type: "pr" as const,
				data: p,
			})),
			...(Array.isArray(closedIssues) ? closedIssues : []).map((i) => ({
				type: "issue" as const,
				data: i,
			})),
		]
			.filter(filterItem)
			.sort(
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
	}, [issues, closedIssues, prs, closedPrs, sessions, searchQuery, typeFilter]);

	// --- Interaction ---

	const handleFix = (issue: GitHubIssue) => {
		if (confirm(`Ask Jules to fix issue #${issue.number}?`)) {
			startFix(issue);
		}
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
		<div className="flex flex-col h-full gap-4">
			{/* Power Toolbar */}
			<div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-muted/30 p-3 rounded-lg border border-border/50">
				<div className="relative w-full sm:w-72">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
					<Input
						placeholder="Filter tasks..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-9 h-9 bg-background/50"
						aria-label="Filter tasks"
					/>
				</div>

				<div className="flex items-center gap-4 w-full sm:w-auto">
					<div className="flex items-center gap-2">
						<Filter className="h-4 w-4 text-muted-foreground" />
						<Select
							value={typeFilter}
							onValueChange={(v) =>
								setTypeFilter(v as "all" | "issue" | "pr" | "session")
							}
						>
							<SelectTrigger className="w-[130px] h-9 bg-background/50">
								<SelectValue placeholder="Type" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Types</SelectItem>
								<SelectItem value="issue">Issues</SelectItem>
								<SelectItem value="pr">Pull Requests</SelectItem>
								<SelectItem value="session">Sessions</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="h-6 w-px bg-border" />

					<div className="flex items-center gap-2">
						<Label
							htmlFor="compact-mode"
							className="text-xs text-muted-foreground cursor-pointer flex items-center gap-2"
						>
							{isCompact ? (
								<Minimize2 className="h-4 w-4" />
							) : (
								<Maximize2 className="h-4 w-4" />
							)}
							<span className="hidden sm:inline">Compact</span>
						</Label>
						<Switch
							id="compact-mode"
							checked={isCompact}
							onCheckedChange={setIsCompact}
							className="scale-90"
						/>
					</div>
				</div>
			</div>

			<div className="flex-1 min-h-0 overflow-x-auto pb-4">
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
									<div className="flex flex-col items-center justify-center h-40 text-muted-foreground border-2 border-dashed rounded-lg bg-muted/10">
										<LayoutList className="h-8 w-8 mb-2 opacity-50" />
										<p className="text-xs">No items found</p>
									</div>
								) : (
									col.items.map((item) => (
										<TaskCard
											key={
												item.type === "session"
													? item.data.id
													: item.data.number
											}
											item={item}
											onSelect={setSelectedItem}
											onFix={item.type === "issue" ? handleFix : undefined}
											compact={isCompact}
										/>
									))
								)}
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
