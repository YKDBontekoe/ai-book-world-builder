"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
	ArrowDownAZ,
	ArrowUpAZ,
	Clock,
	Eye,
	LayoutGrid,
	List,
	Search,
	Undo2,
} from "lucide-react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { Button } from "@/components/atoms/button";
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
import { BulkActionsBar } from "@/components/organisms/projects/bulk-actions-bar";
import {
	type SortOption,
	useProjectBrowser,
	type VisibilityFilter,
} from "@/components/organisms/projects/hooks/use-project-browser";
import { ProjectGrid } from "@/components/organisms/projects/project-grid";
import { ProjectList } from "@/components/organisms/projects/project-list";
import type { Project } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

export function ProjectBrowser({ projects }: { projects: Project[] }) {
	const {
		searchQuery,
		setSearchQuery,
		sortOption,
		setSortOption,
		visibilityFilter,
		setVisibilityFilter,
		viewMode,
		setViewMode,
		selectedIds,
		setSelectedIds,
		isProcessing,
		filteredProjects,
		handleSelect,
		handleSelectAll,
		handleDelete,
		undoDelete,
		handleBulkDuplicate,
	} = useProjectBrowser(projects);

	const handleDeleteWithToast = (idsToDelete: string[]) => {
		handleDelete(idsToDelete);

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
							toast.dismiss(t);
							undoDelete(idsToDelete);
						}}
					>
						<Undo2 className="h-3.5 w-3.5" />
						Undo
					</Button>
				</GlassCard>
			),
			{ duration: 5000 },
		);
	};

	const handleBulkDelete = () => {
		handleDeleteWithToast(Array.from(selectedIds));
	};

	// Bind Delete key here in the UI component where we have access to handleBulkDelete
	useHotkeys(
		"delete, backspace",
		() => {
			handleBulkDelete();
		},
		{ enabled: selectedIds.size > 0 },
	);

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

	return (
		<div className="space-y-6 relative pb-20">
			<div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
				<div className="relative w-full sm:max-w-md">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
					<Input
						placeholder="Search projects..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						onClear={() => setSearchQuery("")}
						className="pl-9"
					/>
				</div>
				<div className="flex items-center gap-2 w-full sm:w-auto">
					<Select
						value={visibilityFilter}
						onValueChange={(value) =>
							setVisibilityFilter(value as VisibilityFilter)
						}
					>
						<SelectTrigger className="w-full sm:w-[140px]">
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

					<div className="flex items-center glass-surface border border-border/50 rounded-lg p-1 mr-2">
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
						<SelectTrigger className="w-full sm:w-[180px]">
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
									// Pass handleSelect to accept the 2nd argument (shiftKey detection in Grid/List)
									onSelect={handleSelect}
									onDeleteProject={(id) => handleDeleteWithToast([id])}
								/>
							) : (
								<ProjectList
									projects={filteredProjects}
									selectedIds={selectedIds}
									onSelect={handleSelect}
									onDeleteProject={(id) => handleDeleteWithToast([id])}
								/>
							)}
						</motion.div>
					</AnimatePresence>
				)}
			</div>

			<BulkActionsBar
				selectedCount={selectedIds.size}
				isProcessing={isProcessing}
				onClear={() => setSelectedIds(new Set())}
				onSelectAll={handleSelectAll}
				onDelete={handleBulkDelete}
				onDuplicate={handleBulkDuplicate}
				onExportJson={handleBulkExportJson}
				onExportCsv={handleBulkExportCsv}
			/>
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
