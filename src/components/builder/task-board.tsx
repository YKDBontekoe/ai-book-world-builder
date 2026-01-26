"use client";

import { useQueryClient } from "@tanstack/react-query";
import { type JSX, useEffect, useMemo, useState } from "react";
import { useLocalStorage } from "usehooks-ts";
import type { GitHubIssue } from "@/app/actions/github";
import { GitHubConfigModal } from "@/components/organisms/github-config-modal";
import { useTaskBoardData } from "@/hooks/use-task-board-data";
import { ItemDetail } from "../admin/github/item-detail";
import { BuilderChatView } from "./chat/builder-chat-view";
import { JulesChat } from "./jules/jules-chat";
import { TaskBoardColumn } from "./task-board/task-board-column";
import { TaskBoardToolbar } from "./task-board/task-board-toolbar";
import { TaskBoardSkeleton } from "./task-board-skeleton";
import { buildColumns, exportToCsv } from "./task-board-utils";
import type { TaskItem } from "./task-card";

export function TaskBoard(): JSX.Element {
	const [activeTab, setActiveTab] = useState<"board" | "chat">("board");
	const [selectedItem, setSelectedItem] = useState<TaskItem | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [typeFilter, setTypeFilter] = useLocalStorage<
		"all" | "issue" | "pr" | "session"
	>("builder-type-filter", "all");
	const [isCompact, setIsCompact] = useLocalStorage(
		"builder-compact-mode",
		false,
	);
	const [showConfigModal, setShowConfigModal] = useState(false);
	const queryClient = useQueryClient();

	const {
		sources,
		issues,
		issuesError,
		closedIssues,
		closedIssuesError,
		prs,
		prsError,
		closedPrs,
		closedPrsError,
		sessions,
		startFix,
		isLoading,
	} = useTaskBoardData();

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

	const columns = useMemo(() => {
		return buildColumns(
			issues,
			closedIssues,
			prs,
			closedPrs,
			sessions,
			searchQuery,
			typeFilter,
		);
	}, [issues, closedIssues, prs, closedPrs, sessions, searchQuery, typeFilter]);

	const handleFix = (issue: GitHubIssue) => {
		if (confirm(`Ask Jules to fix issue #${issue.number}?`)) {
			startFix(issue);
		}
	};

	const handleExport = () => {
		exportToCsv(columns);
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
			<GitHubConfigModal
				isOpen={showConfigModal}
				onOpenChange={setShowConfigModal}
				onSuccess={() => {
					queryClient.invalidateQueries({ queryKey: ["github"] });
				}}
			/>

			<TaskBoardToolbar
				activeTab={activeTab}
				setActiveTab={setActiveTab}
				searchQuery={searchQuery}
				setSearchQuery={setSearchQuery}
				typeFilter={typeFilter}
				setTypeFilter={setTypeFilter}
				isCompact={isCompact}
				setIsCompact={setIsCompact}
				onExport={handleExport}
			/>

			{activeTab === "chat" ? (
				<BuilderChatView />
			) : isLoading ? (
				<TaskBoardSkeleton />
			) : (
				<div className="flex-1 min-h-0 overflow-x-auto pb-4">
					<div className="flex h-full gap-6 min-w-[1000px]">
						{columns.map((col) => (
							<TaskBoardColumn
								key={col.id}
								column={col}
								isCompact={isCompact}
								defaultSource={sources?.[0]?.name}
								onSelect={setSelectedItem}
								onFix={handleFix}
							/>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
