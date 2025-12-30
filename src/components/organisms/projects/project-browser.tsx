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
} from "lucide-react";
import { useLocalStorage } from "usehooks-ts";
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
import { useProjectActions } from "@/hooks/use-project-actions";
import {
	type SortOption,
	useProjectFiltering,
	type VisibilityFilter,
} from "@/hooks/use-project-filtering";
import { useProjectSelection } from "@/hooks/use-project-selection-logic";
import type { Project } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

export function ProjectBrowser({ projects }: { projects: Project[] }) {
	const [viewMode, setViewMode] = useLocalStorage<"grid" | "list">(
		"project-view-mode",
		"grid",
	);

	// Custom Hooks for Logic Separation
	const {
		searchQuery,
		setSearchQuery,
		sortOption,
		setSortOption,
		visibilityFilter,
		setVisibilityFilter,
		optimisticDeletedIds,
		setOptimisticDeletedIds,
		filteredProjects,
	} = useProjectFiltering(projects);

	const {
		selectedIds,
		setSelectedIds,
		handleSelect,
		handleSelectAll,
		clearSelection,
	} = useProjectSelection(filteredProjects.map((p) => p.id));

	const {
		isProcessing,
		handleDelete,
		handleBulkDelete,
		handleBulkExportJson,
		handleBulkExportCsv,
		handleBulkDuplicate,
	} = useProjectActions(
		projects,
		selectedIds,
		setSelectedIds,
		setOptimisticDeletedIds,
		optimisticDeletedIds,
	);

	return (
		<div className="space-y-6 relative pb-20">
			{/* Toolbar Section */}
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

			{/* Project Grid/List View */}
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
									onClick={clearSelection}
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
