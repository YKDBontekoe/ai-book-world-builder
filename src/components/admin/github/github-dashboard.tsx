"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertCircle, GitFork, GitPullRequest, Star } from "lucide-react";
import { useState } from "react";
import { getRepoStats } from "@/app/actions/github";
import { GlassCard } from "@/components/molecules/glass-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IssueList } from "./issue-list";
import { ItemDetail } from "./item-detail";
import { PRList } from "./pr-list";

type ViewState =
	| { view: "list"; type: "pr" | "issue" }
	| { view: "detail"; type: "pr" | "issue"; id: number };

export function GitHubDashboard() {
	const [viewState, setViewState] = useState<ViewState>({
		view: "list",
		type: "pr",
	});
	const [filterState, setFilterState] = useState<"open" | "closed" | "all">(
		"open",
	);

	const { data: stats } = useQuery({
		queryKey: ["github", "stats"],
		queryFn: getRepoStats,
	});

	const handleSelect = (id: number) => {
		setViewState({ view: "detail", type: viewState.type, id });
	};

	const handleBack = () => {
		setViewState({ view: "list", type: viewState.type });
	};

	const handleTabChange = (val: string) => {
		if (val === "prs" || val === "issues") {
			setViewState({ view: "list", type: val === "prs" ? "pr" : "issue" });
		}
	};

	return (
		<div className="space-y-6">
			{/* Header Stats */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<GlassCard className="p-4 flex items-center justify-between">
					<div>
						<p className="text-sm text-muted-foreground">Stars</p>
						<p className="text-2xl font-bold">
							{stats?.success ? stats.data.stars : "-"}
						</p>
					</div>
					<Star className="h-5 w-5 text-yellow-500" />
				</GlassCard>
				<GlassCard className="p-4 flex items-center justify-between">
					<div>
						<p className="text-sm text-muted-foreground">Forks</p>
						<p className="text-2xl font-bold">
							{stats?.success ? stats.data.forks : "-"}
						</p>
					</div>
					<GitFork className="h-5 w-5 text-blue-500" />
				</GlassCard>
				<GlassCard className="p-4 flex items-center justify-between">
					<div>
						<p className="text-sm text-muted-foreground">Open Issues</p>
						<p className="text-2xl font-bold">
							{stats?.success ? stats.data.openIssues : "-"}
						</p>
					</div>
					<AlertCircle className="h-5 w-5 text-green-500" />
				</GlassCard>
			</div>

			{viewState.view === "detail" ? (
				<ItemDetail
					number={viewState.id}
					type={viewState.type}
					onBack={handleBack}
				/>
			) : (
				<Tabs
					defaultValue="prs"
					value={viewState.type === "pr" ? "prs" : "issues"}
					onValueChange={handleTabChange}
					className="w-full"
				>
					<div className="flex items-center justify-between mb-4">
						<TabsList>
							<TabsTrigger value="prs" className="flex items-center gap-2">
								<GitPullRequest className="h-4 w-4" />
								Pull Requests
							</TabsTrigger>
							<TabsTrigger value="issues" className="flex items-center gap-2">
								<AlertCircle className="h-4 w-4" />
								Issues
							</TabsTrigger>
						</TabsList>

						<div className="flex bg-muted/50 p-1 rounded-lg">
							<button
								type="button"
								onClick={() => setFilterState("open")}
								className={`px-3 py-1 text-sm rounded-md transition-all ${
									filterState === "open"
										? "bg-background shadow-sm"
										: "text-muted-foreground hover:text-foreground"
								}`}
							>
								Open
							</button>
							<button
								type="button"
								onClick={() => setFilterState("closed")}
								className={`px-3 py-1 text-sm rounded-md transition-all ${
									filterState === "closed"
										? "bg-background shadow-sm"
										: "text-muted-foreground hover:text-foreground"
								}`}
							>
								Closed
							</button>
							<button
								type="button"
								onClick={() => setFilterState("all")}
								className={`px-3 py-1 text-sm rounded-md transition-all ${
									filterState === "all"
										? "bg-background shadow-sm"
										: "text-muted-foreground hover:text-foreground"
								}`}
							>
								All
							</button>
						</div>
					</div>

					<TabsContent value="prs" className="mt-0">
						<PRList onSelect={handleSelect} state={filterState} />
					</TabsContent>
					<TabsContent value="issues" className="mt-0">
						<IssueList onSelect={handleSelect} state={filterState} />
					</TabsContent>
				</Tabs>
			)}
		</div>
	);
}
