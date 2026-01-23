"use client";

import { Filter, LayoutList, Maximize2, Minimize2, Search, Sparkles } from "lucide-react";
import { type JSX, useState } from "react";
import { useLocalStorage } from "usehooks-ts";
import type { GitHubIssue } from "@/app/actions/github";
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
import { Button } from "@/components/atoms/button";
import { ItemDetail } from "../admin/github/item-detail";
import { CreateFeatureDialog } from "./create-feature-dialog";
import { JulesChat } from "./jules/jules-chat";
import { TaskCard, type TaskItem } from "./task-card";
import { BuilderChatView } from "./chat/builder-chat-view";
import { useTaskBoardData } from "./hooks/use-task-board-data";
import { useTaskBoardFilter } from "./hooks/use-task-board-filter";

export function TaskBoard(): JSX.Element {
	const [activeTab, setActiveTab] = useState<"board" | "chat">("board");
	const [selectedItem, setSelectedItem] = useState<TaskItem | null>(null);
	const [isCompact, setIsCompact] = useLocalStorage(
		"builder-compact-mode",
		false,
	);

	// --- Custom Hooks ---
	const {
		sources,
		issues,
		closedIssues,
		prs,
		closedPrs,
		sessions,
		startFix,
	} = useTaskBoardData();

	const {
		searchQuery,
		setSearchQuery,
		typeFilter,
		setTypeFilter,
		columns,
	} = useTaskBoardFilter({
		issues,
		closedIssues,
		prs,
		closedPrs,
		sessions,
	});

	// Use the first available source for feature planning
	const defaultSource = sources?.[0]?.name;

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

				{/* View Switcher */}
				<div className="flex items-center bg-background/50 p-1 rounded-md border">
					<Button
						variant={activeTab === "board" ? "secondary" : "ghost"}
						size="sm"
						onClick={() => setActiveTab("board")}
						className="h-7 text-xs"
					>
						Task Board
					</Button>
					<Button
						variant={activeTab === "chat" ? "secondary" : "ghost"}
						size="sm"
						onClick={() => setActiveTab("chat")}
						className="h-7 text-xs gap-2"
					>
						<Sparkles className="w-3 h-3 text-primary" />
						Planner Chat
					</Button>
				</div>

				{activeTab === "board" && (
					<>
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
					</>
				)}
			</div>

			{activeTab === "chat" ? (
				<BuilderChatView />
			) : (
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
			)}
		</div>
	);
}
