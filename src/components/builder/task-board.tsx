"use client";

import { useQueryClient } from "@tanstack/react-query";
import { type JSX, useEffect, useMemo, useState } from "react";
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
import { buildColumns, generateCsv, getItemId } from "./task-board-utils";
import type { TaskItem } from "./task-card";

export function TaskBoard(): JSX.Element {
	const [activeTab, setActiveTab] = useState<"board" | "chat">("board");
	const [selectedItem, setSelectedItem] = useState<TaskItem | null>(null);
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
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

	// --- Bulk Selection Logic ---

	const allItems = useMemo(() => columns.flatMap((c) => c.items), [columns]);

	const toggleSelection = (id: string) => {
		const newSet = new Set(selectedIds);
		if (newSet.has(id)) {
			newSet.delete(id);
		} else {
			newSet.add(id);
		}
		setSelectedIds(newSet);
	};

	const selectAll = () => {
		setSelectedIds(new Set(allItems.map(getItemId)));
		toast.success(`Selected all ${allItems.length} items`);
	};

	const clearSelection = () => {
		setSelectedIds(new Set());
	};

	const handleCopy = () => {
		const itemsToCopy = allItems.filter((item) =>
			selectedIds.has(getItemId(item)),
		);
		if (itemsToCopy.length === 0) return;
		navigator.clipboard.writeText(
			JSON.stringify(
				itemsToCopy.map((i) => i.data),
				null,
				2,
			),
		);
		toast.success(`Copied ${itemsToCopy.length} items to clipboard`);
		clearSelection();
	};

	const handleExport = (itemsOverride?: TaskItem[]) => {
		const itemsToExport =
			itemsOverride ||
			allItems.filter((item) => selectedIds.has(getItemId(item)));

		if (itemsToExport.length === 0) return;

		const csv = generateCsv(itemsToExport);
		const blob = new Blob([csv], { type: "text/csv" });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `builder-export-${new Date().toISOString()}.csv`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		window.URL.revokeObjectURL(url);
		toast.success(`Exported ${itemsToExport.length} items`);
		clearSelection();
	};

	// Shortcuts
	useHotkeys(
		"meta+a, ctrl+a",
		(e) => {
			e.preventDefault();
			selectAll();
		},
		{ enableOnFormTags: false, preventDefault: true },
		[allItems],
	);

	useHotkeys("esc", () => clearSelection(), { enableOnFormTags: false }, []);

	useHotkeys(
		"meta+c, ctrl+c",
		(e) => {
			if (selectedIds.size > 0) {
				e.preventDefault();
				handleCopy();
			}
		},
		{ enableOnFormTags: false },
		[selectedIds, allItems],
	);

	useHotkeys(
		"meta+e, ctrl+e",
		(e) => {
			e.preventDefault();
			if (selectedIds.size > 0) {
				handleExport();
			} else {
				handleExport(allItems);
			}
		},
		{ enableOnFormTags: false },
		[selectedIds, allItems],
	);

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
				onRefresh={() =>
					queryClient.invalidateQueries({ queryKey: ["github"] })
				}
				onExport={() => handleExport(allItems)}
				isRefreshing={isLoading}
			/>

			<BulkActionsToolbar
				selectedCount={selectedIds.size}
				onCopy={handleCopy}
				onExport={() => handleExport()}
				onClear={clearSelection}
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
								selectedIds={selectedIds}
								onToggleSelection={toggleSelection}
							/>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
