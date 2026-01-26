"use client";

import { useQueryClient } from "@tanstack/react-query";
import { type JSX, useCallback, useEffect, useMemo, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { useLocalStorage } from "usehooks-ts";
import type { GitHubIssue } from "@/app/actions/github";
import { GitHubConfigModal } from "@/components/organisms/github-config-modal";
import { useTaskBoardData } from "@/hooks/use-task-board-data";
import { ItemDetail } from "../admin/github/item-detail";
import { BuilderChatView } from "./chat/builder-chat-view";
import { JulesChat } from "./jules/jules-chat";
import { BulkActionsToolbar } from "./task-board/bulk-actions-toolbar";
import { TaskBoardColumn } from "./task-board/task-board-column";
import { TaskBoardToolbar } from "./task-board/task-board-toolbar";
import { TaskBoardSkeleton } from "./task-board-skeleton";
import { buildColumns, exportToCSV } from "./task-board-utils";
import type { TaskItem } from "./task-card";

const getItemId = (item: TaskItem) =>
	item.type === "session" ? item.data.id : item.data.number.toString();

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
	const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

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

	// Selection Handlers
	const handleToggleSelection = useCallback((item: TaskItem) => {
		const id = getItemId(item);
		setSelectedItems((prev) => {
			const next = new Set(prev);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		});
	}, []);

	const handleClearSelection = useCallback(() => {
		setSelectedItems(new Set());
	}, []);

	const handleSelectAll = useCallback(() => {
		const allIds = columns.flatMap((col) => col.items.map(getItemId));
		setSelectedItems(new Set(allIds));
		toast.info(`Selected ${allIds.length} items`);
	}, [columns]);

	const handleCopySelection = useCallback(() => {
		const selected = columns
			.flatMap((col) => col.items)
			.filter((item) => selectedItems.has(getItemId(item)));
		if (selected.length === 0) return;

		const text = selected
			.map((item) => {
				const id = getItemId(item);
				const title =
					item.type === "session"
						? item.data.title || item.data.prompt
						: item.data.title;
				return `[${item.type.toUpperCase()} ${id}] ${title}`;
			})
			.join("\n");

		navigator.clipboard.writeText(text);
		toast.success(`Copied ${selected.length} items to clipboard`);
	}, [columns, selectedItems]);

	const handleExportSelection = useCallback(() => {
		const selected = columns
			.flatMap((col) => col.items)
			.filter((item) => selectedItems.has(getItemId(item)));
		if (selected.length === 0) return;
		exportToCSV(selected);
		toast.success("Exported selection to CSV");
	}, [columns, selectedItems]);

	const handleExportAll = useCallback(() => {
		const allItems = columns.flatMap((col) => col.items);
		if (allItems.length === 0) return;
		exportToCSV(allItems);
		toast.success("Exported all items to CSV");
	}, [columns]);

	// Hotkeys
	useHotkeys(
		"meta+a, ctrl+a",
		(e) => {
			e.preventDefault();
			handleSelectAll();
		},
		{ enabled: !selectedItem },
		[handleSelectAll, selectedItem],
	);

	useHotkeys(
		"esc",
		() => {
			handleClearSelection();
		},
		{ enabled: !selectedItem },
		[handleClearSelection, selectedItem],
	);

	useHotkeys(
		"meta+c, ctrl+c",
		(e) => {
			if (selectedItems.size > 0) {
				e.preventDefault();
				handleCopySelection();
			}
		},
		{ enabled: !selectedItem },
		[handleCopySelection, selectedItems, selectedItem],
	);

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
		<div className="flex flex-col h-full gap-4 relative">
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
				onExport={handleExportAll}
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
								selectedItems={selectedItems}
								onToggleSelection={handleToggleSelection}
							/>
						))}
					</div>
				</div>
			)}

			<BulkActionsToolbar
				selectedCount={selectedItems.size}
				onClear={handleClearSelection}
				onCopy={handleCopySelection}
				onExport={handleExportSelection}
			/>
		</div>
	);
}
