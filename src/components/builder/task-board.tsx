"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
	ArrowDownWideNarrow,
	Download,
	Filter,
	LayoutList,
	Maximize2,
	Minimize2,
	RefreshCw,
	Search,
	Sparkles,
} from "lucide-react";
import { type JSX, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useLocalStorage } from "usehooks-ts";
import { startFixSessionAction } from "@/app/actions/builder";
import type { GitHubIssue } from "@/app/actions/github";
import { getIssues, getPullRequests } from "@/app/actions/github";
import {
	getJulesSessionsAction,
	listJulesSourcesAction,
} from "@/app/actions/jules";
import { Button } from "@/components/atoms/button";
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
import { GlassCard } from "@/components/molecules/glass-card";
import { GitHubConfigModal } from "@/components/organisms/github-config-modal";
import { ItemDetail } from "../admin/github/item-detail";
import { BuilderChatView } from "./chat/builder-chat-view";
import { CreateFeatureDialog } from "./create-feature-dialog";
import { JulesChat } from "./jules/jules-chat";
import {
	type Column,
	type SortOption,
	generateCsv,
	sortTasks,
} from "./task-board-utils";
import { TaskBoardSkeleton } from "./task-board-skeleton";
import { TaskCard, type TaskItem } from "./task-card";

export function TaskBoard(): JSX.Element {
	const [activeTab, setActiveTab] = useState<"board" | "chat">("board");
	const [selectedItem, setSelectedItem] = useState<TaskItem | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [typeFilter, setTypeFilter] = useLocalStorage<
		"all" | "issue" | "pr" | "session"
	>("builder-type-filter", "all");
	const [sortOption, setSortOption] = useLocalStorage<SortOption>(
		"builder-sort-option",
		"updated-desc",
	);
	const [isCompact, setIsCompact] = useLocalStorage(
		"builder-compact-mode",
		false,
	);
	const [showConfigModal, setShowConfigModal] = useState(false);
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

	const {
		data: issues,
		error: issuesError,
		isLoading: issuesLoading,
	} = useQuery({
		queryKey: ["github", "issues", "open"],
		queryFn: async () => {
			const res = await getIssues("open");
			if (!res.success) {
				if (res.error === "GITHUB_CONFIG_MISSING") {
					throw new Error(res.error);
				}
				throw new Error(res.error);
			}
			return Array.isArray(res.data) ? res.data : [];
		},
	});

	const {
		data: closedIssues,
		error: closedIssuesError,
		isLoading: closedIssuesLoading,
	} = useQuery({
		queryKey: ["github", "issues", "closed"],
		queryFn: async () => {
			const res = await getIssues("closed");
			if (!res.success) throw new Error(res.error);
			return Array.isArray(res.data) ? res.data : [];
		},
	});

	const {
		data: prs,
		error: prsError,
		isLoading: prsLoading,
	} = useQuery({
		queryKey: ["github", "prs", "open"],
		queryFn: async () => {
			const res = await getPullRequests("open");
			if (!res.success) throw new Error(res.error);
			return Array.isArray(res.data) ? res.data : [];
		},
	});

	const {
		data: closedPrs,
		error: closedPrsError,
		isLoading: closedPrsLoading,
	} = useQuery({
		queryKey: ["github", "prs", "closed"],
		queryFn: async () => {
			const res = await getPullRequests("closed");
			if (!res.success) throw new Error(res.error);
			return Array.isArray(res.data) ? res.data : [];
		},
	});

	const { data: sessions, isLoading: sessionsLoading } = useQuery({
		queryKey: ["jules", "sessions"],
		queryFn: async () => {
			const res = await getJulesSessionsAction({ pageSize: 50 });
			return res.success && res.data && Array.isArray(res.data.sessions)
				? res.data.sessions
				: [];
		},
		refetchInterval: 10000, // Poll for session updates
	});

	// Check for missing GitHub configuration
	useEffect(() => {
		const errors = [issuesError, closedIssuesError, prsError, closedPrsError];
		const configErrorMessage =
			"GITHUB_OWNER and GITHUB_REPO must be set in environment variables or user preferences";

		const hasConfigError = errors.some(
			(error) => error?.message && error.message === configErrorMessage,
		);

		if (hasConfigError) {
			setShowConfigModal(true);
		}
	}, [issuesError, closedIssuesError, prsError, closedPrsError]);

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

	// --- Interaction ---

	const handleFix = (issue: GitHubIssue) => {
		if (confirm(`Ask Jules to fix issue #${issue.number}?`)) {
			startFix(issue);
		}
	};

	const handleRefresh = () => {
		queryClient.invalidateQueries({ queryKey: ["github"] });
		queryClient.invalidateQueries({ queryKey: ["jules"] });
		toast.success("Refreshing data...");
	};

	const handleExportCsv = () => {
		const csvContent = generateCsv(columns);
		const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `builder_tasks_${new Date().toISOString().split("T")[0]}.csv`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		toast.success(
			`Exported ${columns.reduce((acc, col) => acc + col.items.length, 0)} items to CSV`,
		);
	};

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
		].filter(filterItem);

		const sort = (items: TaskItem[]) => sortTasks(items, sortOption);

		return [
			{ id: "backlog", title: "Backlog", items: sort(backlogItems) },
			{
				id: "in_progress",
				title: "In Progress (Jules)",
				items: sort(sessionItems),
			},
			{ id: "review", title: "Review", items: sort(reviewItems) },
			{ id: "done", title: "Done", items: sort(doneItems) },
		];
	}, [
		issues,
		closedIssues,
		prs,
		closedPrs,
		sessions,
		searchQuery,
		typeFilter,
		sortOption,
	]);

	const isLoading =
		issuesLoading ||
		closedIssuesLoading ||
		prsLoading ||
		closedPrsLoading ||
		sessionsLoading;

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
			<GitHubConfigModal
				isOpen={showConfigModal}
				onOpenChange={setShowConfigModal}
				onSuccess={() => {
					queryClient.invalidateQueries({ queryKey: ["github"] });
				}}
			/>

			{/* Power Toolbar */}
			<GlassCard
				size="sm"
				className="flex flex-col sm:flex-row gap-4 items-center justify-between p-2"
			>
				{/* View Switcher */}
				<div className="flex items-center bg-muted/50 p-1 rounded-lg">
					<Button
						variant={activeTab === "board" ? "secondary" : "ghost"}
						size="sm"
						onClick={() => setActiveTab("board")}
						className="h-8 text-xs font-medium px-4 shadow-sm"
					>
						Task Board
					</Button>
					<Button
						variant={activeTab === "chat" ? "secondary" : "ghost"}
						size="sm"
						onClick={() => setActiveTab("chat")}
						className="h-8 text-xs font-medium px-4 gap-2 shadow-sm"
					>
						<Sparkles className="w-3.5 h-3.5 text-primary" />
						Planner Chat
					</Button>
				</div>

				{activeTab === "board" && (
					<div className="flex items-center gap-1">
						<Button
							variant="ghost"
							size="icon"
							onClick={handleRefresh}
							className="h-8 w-8 text-muted-foreground hover:text-foreground"
							title="Refresh Data"
						>
							<RefreshCw className="h-4 w-4" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							onClick={handleExportCsv}
							className="h-8 w-8 text-muted-foreground hover:text-foreground"
							title="Export to CSV"
						>
							<Download className="h-4 w-4" />
						</Button>
					</div>
				)}

				{activeTab === "board" && (
					<motion.div
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ type: "spring", stiffness: 400, damping: 25 }}
						className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto"
					>
						<div className="relative w-full sm:w-64">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
							<Input
								placeholder="Filter tasks..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-9 h-9 bg-background/50 border-transparent focus:border-input focus:bg-background transition-all"
								aria-label="Filter tasks"
							/>
						</div>

						<div className="flex items-center gap-3">
							<div className="flex items-center gap-2">
								<Select
									value={sortOption}
									onValueChange={(v) => setSortOption(v as SortOption)}
								>
									<SelectTrigger className="w-[150px] h-9 bg-background/50 border-transparent focus:border-input focus:bg-background">
										<div className="flex items-center gap-2">
											<ArrowDownWideNarrow className="h-3.5 w-3.5 text-muted-foreground" />
											<SelectValue placeholder="Sort" />
										</div>
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="updated-desc">Recently Updated</SelectItem>
										<SelectItem value="updated-asc">Least Recently Updated</SelectItem>
										<SelectItem value="created-desc">Newest</SelectItem>
										<SelectItem value="created-asc">Oldest</SelectItem>
									</SelectContent>
								</Select>

								<Select
									value={typeFilter}
									onValueChange={(v) =>
										setTypeFilter(v as "all" | "issue" | "pr" | "session")
									}
								>
									<SelectTrigger className="w-[120px] h-9 bg-background/50 border-transparent focus:border-input focus:bg-background">
										<div className="flex items-center gap-2">
											<Filter className="h-3.5 w-3.5 text-muted-foreground" />
											<SelectValue placeholder="Type" />
										</div>
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Types</SelectItem>
										<SelectItem value="issue">Issues</SelectItem>
										<SelectItem value="pr">Pull Requests</SelectItem>
										<SelectItem value="session">Sessions</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="h-6 w-px bg-border/50" />

							<div className="flex items-center gap-2">
								<Label
									htmlFor="compact-mode"
									className="text-xs text-muted-foreground cursor-pointer flex items-center gap-2 select-none hover:text-foreground transition-colors"
								>
									{isCompact ? (
										<Minimize2 className="h-4 w-4" />
									) : (
										<Maximize2 className="h-4 w-4" />
									)}
								</Label>
								<Switch
									id="compact-mode"
									checked={isCompact}
									onCheckedChange={setIsCompact}
									className="scale-75"
								/>
							</div>
						</div>
					</motion.div>
				)}
			</GlassCard>

			{activeTab === "chat" ? (
				<BuilderChatView />
			) : isLoading ? (
				<TaskBoardSkeleton />
			) : (
				<div className="flex-1 min-h-0 overflow-x-auto pb-4">
					<div className="flex h-full gap-6 min-w-[1000px]">
						{columns.map((col) => (
							<div
								key={col.id}
								className="w-[300px] flex-shrink-0 flex flex-col"
							>
								<div className="flex items-center justify-between mb-4 px-1">
									<h3 className="font-semibold text-sm flex items-center gap-2 text-foreground/80">
										{col.title}
										<span className="bg-muted text-muted-foreground px-2 py-0.5 rounded-full text-[10px] font-mono">
											{col.items.length}
										</span>
									</h3>
									{col.id === "backlog" && defaultSource && (
										<CreateFeatureDialog defaultSource={defaultSource} />
									)}
								</div>

								<div className="flex-1 overflow-y-auto pr-2 space-y-3 pb-10">
									<AnimatePresence mode="popLayout">
										{col.items.length === 0 ? (
											<motion.div
												initial={{ opacity: 0, scale: 0.9 }}
												animate={{ opacity: 1, scale: 1 }}
												className="flex flex-col items-center justify-center h-40 text-muted-foreground border-2 border-dashed border-muted-foreground/10 rounded-xl bg-muted/5 p-6 text-center"
											>
												<div className="p-3 bg-muted/20 rounded-full mb-3">
													<LayoutList className="h-6 w-6 opacity-50" />
												</div>
												<p className="text-xs font-medium">
													No items in {col.title}
												</p>
											</motion.div>
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
									</AnimatePresence>
								</div>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
