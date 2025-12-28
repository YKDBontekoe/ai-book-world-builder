"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
	ArrowDownAZ,
	ArrowUpAZ,
	ChevronDown,
	Clock,
	Copy,
	Download,
	Eye,
	FileJson,
	FileText,
	LayoutGrid,
	List,
	Search,
	Trash2,
	Undo2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useLocalStorage } from "usehooks-ts";
import { deleteProjects, forkProject } from "@/app/actions/projects";
import { Button } from "@/components/atoms/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/atoms/dropdown-menu";
import { Input } from "@/components/atoms/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/atoms/select";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/atoms/tooltip";
import { EmptyState } from "@/components/molecules/empty-state";
import { GlassCard } from "@/components/molecules/glass-card";
import { ProjectGrid } from "@/components/organisms/projects/project-grid";
import { ProjectList } from "@/components/organisms/projects/project-list";
import type { Project } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

type SortOption = "newest" | "oldest" | "a-z" | "z-a";
type VisibilityFilter = "all" | "public" | "private";

export function ProjectBrowser({
	projects,
}: {
	projects: Project[];
}) {
	const [searchQuery, setSearchQuery] = useState("");
	const [sortOption, setSortOption] = useState<SortOption>("newest");
	const [visibilityFilter, setVisibilityFilter] =
		useState<VisibilityFilter>("all");
	const [viewMode, setViewMode] = useLocalStorage<"grid" | "list">(
		"project-view-mode",
		"grid",
	);
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const [isProcessing, setIsProcessing] = useState(false);

	// Optimistic UI state
	const [optimisticDeletedIds, setOptimisticDeletedIds] = useState<Set<string>>(
		new Set(),
	);
	const pendingDeletionRef = useRef<Set<string> | null>(null);
	const undoTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const router = useRouter();

	const handleSelect = (id: string) => {
		const newSelected = new Set(selectedIds);
		if (newSelected.has(id)) {
			newSelected.delete(id);
		} else {
			newSelected.add(id);
		}
		setSelectedIds(newSelected);
	};

	const handleSelectAll = () => {
		if (selectedIds.size === filteredProjects.length) {
			setSelectedIds(new Set());
		} else {
			setSelectedIds(new Set(filteredProjects.map((p) => p.id)));
		}
	};

	const filteredProjects = useMemo(() => {
		let result = [...projects];

		// Filter out optimistically deleted projects
		result = result.filter((p) => !optimisticDeletedIds.has(p.id));

		// Filter by Visibility
		if (visibilityFilter !== "all") {
			result = result.filter((p) => p.visibility === visibilityFilter);
		}

		// Filter by Search
		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			result = result.filter(
				(p) =>
					p.name.toLowerCase().includes(query) ||
					p.description?.toLowerCase().includes(query),
			);
		}

		// Sort
		result.sort((a, b) => {
			switch (sortOption) {
				case "newest":
					return (
						new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
					);
				case "oldest":
					return (
						new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
					);
				case "a-z":
					return a.name.localeCompare(b.name);
				case "z-a":
					return b.name.localeCompare(a.name);
				default:
					return 0;
			}
		});

		return result;
	}, [
		projects,
		searchQuery,
		sortOption,
		optimisticDeletedIds,
		visibilityFilter,
	]);

	// Clean up timeout and trigger pending deletions on unmount
	useEffect(() => {
		return () => {
			if (undoTimeoutRef.current) {
				clearTimeout(undoTimeoutRef.current);
			}
			// If there are pending deletions when the component unmounts (e.g. navigation),
			// we should fire them immediately to avoid "silent cancellation".
			if (pendingDeletionRef.current && pendingDeletionRef.current.size > 0) {
				const ids = Array.from(pendingDeletionRef.current);
				// We use void to fire-and-forget, but catch errors to log them
				deleteProjects(ids).catch((err) =>
					console.error("Failed to delete pending projects on unmount", err),
				);
				pendingDeletionRef.current = null;
			}
		};
	}, []);

	const handleDelete = useCallback(
		(idsToDelete: string[]) => {
			if (idsToDelete.length === 0) return;

			// 1. Optimistic Update
			const newOptimisticDeleted = new Set(optimisticDeletedIds);
			for (const id of idsToDelete) {
				newOptimisticDeleted.add(id);
			}
			setOptimisticDeletedIds(newOptimisticDeleted);

			// Clear selection if any deleted items were selected
			setSelectedIds((prev) => {
				const next = new Set(prev);
				for (const id of idsToDelete) {
					next.delete(id);
				}
				return next;
			});

			// Track pending deletion
			pendingDeletionRef.current = new Set(idsToDelete);

			// 2. Undo Toast
			toast.custom(
				(t) => (
					<GlassCard
						variant="liquid"
						className="flex items-center gap-4 p-4 w-full max-w-md mx-auto pointer-events-auto"
					>
						<div className="flex-1 text-sm">
							Deleted {idsToDelete.length} project
							{idsToDelete.length > 1 ? "s" : ""}
						</div>
						<Button
							size="sm"
							variant="outline"
							className="gap-2 h-8"
							onClick={() => {
								// Undo logic
								toast.dismiss(t);
								if (undoTimeoutRef.current)
									clearTimeout(undoTimeoutRef.current);
								setOptimisticDeletedIds((prev) => {
									const next = new Set(prev);
									for (const id of idsToDelete) {
										next.delete(id);
									}
									return next;
								});
								pendingDeletionRef.current = null; // Clear pending
							}}
						>
							<Undo2 className="h-3.5 w-3.5" />
							Undo
						</Button>
					</GlassCard>
				),
				{ duration: 5000 },
			);

			// 3. Delayed Server Action
			if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);

			undoTimeoutRef.current = setTimeout(async () => {
				// Execute deletion
				const result = await deleteProjects(idsToDelete);

				// Clear pending state as we've executed it
				pendingDeletionRef.current = null;
				undoTimeoutRef.current = null;

				if (result?.error) {
					toast.error("Failed to delete projects");
					// Revert optimistic update
					setOptimisticDeletedIds((prev) => {
						const next = new Set(prev);
						for (const id of idsToDelete) {
							next.delete(id);
						}
						return next;
					});
				} else {
					// Success
					setOptimisticDeletedIds((prev) => {
						const next = new Set(prev);
						for (const id of idsToDelete) {
							next.delete(id);
						}
						return next;
					});
				}
			}, 4500); // Slightly less than toast duration
		},
		[optimisticDeletedIds],
	);

	const handleBulkDelete = () => {
		handleDelete(Array.from(selectedIds));
	};

	const handleBulkExportJson = () => {
		const projectsToExport = projects.filter((p) => selectedIds.has(p.id));
		const dataStr = JSON.stringify(projectsToExport, null, 2);
		const blob = new Blob([dataStr], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `projects_export_${new Date().toISOString().split("T")[0]}.json`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		toast.success(`Exported ${projectsToExport.length} projects to JSON`);
		setSelectedIds(new Set());
	};

	const handleBulkExportCsv = () => {
		const projectsToExport = projects.filter((p) => selectedIds.has(p.id));

		const headers = [
			"ID",
			"Name",
			"Description",
			"Created At",
			"Visibility",
			"Folder Count",
		];

		const csvContent = [
			headers.join(","),
			...projectsToExport.map((p) => {
				const row = [
					p.id,
					`"${(p.name || "").replace(/"/g, '""')}"`,
					`"${(p.description || "").replace(/"/g, '""')}"`,
					new Date(p.createdAt).toISOString(),
					p.visibility,
					p.folders.length,
				];
				return row.join(",");
			}),
		].join("\n");

		const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `projects_export_${new Date().toISOString().split("T")[0]}.csv`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		toast.success(`Exported ${projectsToExport.length} projects to CSV`);
		setSelectedIds(new Set());
	};

	const handleBulkDuplicate = async () => {
		setIsProcessing(true);
		const idsToDuplicate = Array.from(selectedIds);
		toast.info(`Duplicating ${idsToDuplicate.length} projects...`);

		const results = await Promise.allSettled(
			idsToDuplicate.map((id) => forkProject(id, undefined)),
		);

		const successCount = results.filter(
			(r) => r.status === "fulfilled" && !("error" in r.value),
		).length;
		const failureCount = idsToDuplicate.length - successCount;

		if (failureCount === 0) {
			toast.success("All projects duplicated successfully");
			setSelectedIds(new Set());
		} else {
			toast.warning(
				`Duplicated ${successCount} projects. Failed to duplicate ${failureCount}.`,
			);
		}

		router.refresh();
		setIsProcessing(false);
	};

	return (
		<div className="space-y-6 relative pb-20">
			<div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
				<div className="relative w-full sm:max-w-md">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search projects..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						onClear={() => setSearchQuery("")}
						className="pl-9 bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary/50 transition-colors"
					/>
				</div>
				<div className="flex items-center gap-2 w-full sm:w-auto">
					<Select
						value={visibilityFilter}
						onValueChange={(value) =>
							setVisibilityFilter(value as VisibilityFilter)
						}
					>
						<SelectTrigger className="w-full sm:w-[140px] bg-background/50 backdrop-blur-sm border-border/50">
							<div className="flex items-center gap-2 text-muted-foreground">
								<Eye className="h-4 w-4" />
								<SelectValue placeholder="Visibility" />
							</div>
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All</SelectItem>
							<SelectItem value="private">Private</SelectItem>
							<SelectItem value="public">Public</SelectItem>
						</SelectContent>
					</Select>

					<div className="h-8 w-px bg-border/50 mx-1" />

					<div className="flex items-center bg-background/50 backdrop-blur-sm border border-border/50 rounded-lg p-1 mr-2">
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant="ghost"
										size="icon"
										className={cn(
											"h-7 w-7 rounded-lg transition-all",
											viewMode === "grid"
												? "bg-background shadow-sm text-primary"
												: "text-muted-foreground hover:text-foreground",
										)}
										onClick={() => setViewMode("grid")}
									>
										<LayoutGrid className="h-4 w-4" />
									</Button>
								</TooltipTrigger>
								<TooltipContent>Grid view</TooltipContent>
							</Tooltip>

							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant="ghost"
										size="icon"
										className={cn(
											"h-7 w-7 rounded-lg transition-all",
											viewMode === "list"
												? "bg-background shadow-sm text-primary"
												: "text-muted-foreground hover:text-foreground",
										)}
										onClick={() => setViewMode("list")}
									>
										<List className="h-4 w-4" />
									</Button>
								</TooltipTrigger>
								<TooltipContent>List view</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					</div>

					<Select
						value={sortOption}
						onValueChange={(value) => setSortOption(value as SortOption)}
					>
						<SelectTrigger className="w-full sm:w-[180px] bg-background/50 backdrop-blur-sm border-border/50">
							<div className="flex items-center gap-2 text-muted-foreground">
								<SortIcon sort={sortOption} />
								<SelectValue placeholder="Sort by" />
							</div>
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="newest">Newest First</SelectItem>
							<SelectItem value="oldest">Oldest First</SelectItem>
							<SelectItem value="a-z">Name (A-Z)</SelectItem>
							<SelectItem value="z-a">Name (Z-A)</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			<div className="relative min-h-[200px]">
				{filteredProjects.length === 0 && searchQuery ? (
					<EmptyState
						title="No projects found"
						description="Try adjusting your search query to find what you're looking for."
						icon={Search}
						variant="glass"
						action={
							<Button
								variant="link"
								onClick={() => setSearchQuery("")}
								className="text-primary"
							>
								Clear search
							</Button>
						}
					/>
				) : (
					<AnimatePresence mode="wait">
						<motion.div
							key={viewMode}
							initial={{ opacity: 0, scale: 0.98 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.98 }}
							transition={{ type: "spring", stiffness: 400, damping: 25 }}
						>
							{viewMode === "grid" ? (
								<ProjectGrid
									projects={filteredProjects}
									selectedIds={selectedIds}
									onSelect={handleSelect}
									onDeleteProject={(id) => handleDelete([id])}
								/>
							) : (
								<ProjectList
									projects={filteredProjects}
									selectedIds={selectedIds}
									onSelect={handleSelect}
									onDeleteProject={(id) => handleDelete([id])}
								/>
							)}
						</motion.div>
					</AnimatePresence>
				)}
			</div>

			{/* Selection Action Bar */}
			<AnimatePresence>
				{selectedIds.size > 0 && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 20 }}
						className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4"
					>
						<GlassCard
							variant="liquid"
							className="flex items-center justify-between p-3 pl-5 pr-3 shadow-xl border-primary/20 backdrop-blur-xl"
						>
							<div className="flex items-center gap-4">
								<div className="text-sm font-medium">
									{selectedIds.size} selected
								</div>
								<div className="h-4 w-px bg-border" />
								<Button
									variant="ghost"
									size="sm"
									className="h-8 text-muted-foreground hover:text-foreground"
									onClick={() => setSelectedIds(new Set())}
								>
									Deselect All
								</Button>
								<Button
									variant="ghost"
									size="sm"
									className="h-8 text-muted-foreground hover:text-foreground"
									onClick={handleSelectAll}
								>
									Select All
								</Button>
							</div>
							<div className="flex items-center gap-2 border-r border-border pr-2 mr-2">
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											size="sm"
											variant="ghost"
											className="gap-2 text-muted-foreground hover:text-foreground"
											disabled={isProcessing}
										>
											<Download className="h-4 w-4" />
											Export
											<ChevronDown className="h-3 w-3 opacity-50" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="start">
										<DropdownMenuItem onClick={handleBulkExportJson}>
											<FileJson className="mr-2 h-4 w-4" />
											<span>Export to JSON</span>
										</DropdownMenuItem>
										<DropdownMenuItem onClick={handleBulkExportCsv}>
											<FileText className="mr-2 h-4 w-4" />
											<span>Export to CSV</span>
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
								<Button
									size="sm"
									variant="ghost"
									className="gap-2 text-muted-foreground hover:text-foreground"
									onClick={handleBulkDuplicate}
									disabled={isProcessing}
								>
									<Copy className="h-4 w-4" />
									Duplicate
								</Button>
							</div>

							<Button
								size="sm"
								variant="destructive"
								className="gap-2 shadow-lg hover:shadow-destructive/20"
								onClick={handleBulkDelete}
								disabled={isProcessing}
							>
								<Trash2 className="h-4 w-4" />
								Delete
							</Button>
						</GlassCard>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

function SortIcon({ sort }: { sort: SortOption }) {
	switch (sort) {
		case "a-z":
			return <ArrowDownAZ className="h-4 w-4" />;
		case "z-a":
			return <ArrowUpAZ className="h-4 w-4" />;
		default:
			return <Clock className="h-4 w-4" />;
	}
}
