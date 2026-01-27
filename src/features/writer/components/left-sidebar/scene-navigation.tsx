"use client";

import {
	BookPlus,
	CheckSquare,
	ChevronsDown,
	ChevronsUp,
	Download,
	Loader2,
	Plus,
	Search,
	SearchX,
	Trash2,
	X,
} from "lucide-react";
import { memo } from "react";
import { Accordion } from "@/components/atoms/accordion";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { ScrollArea } from "@/components/atoms/scroll-area";
import { EmptyState } from "@/components/molecules/empty-state";
import { GlassCard } from "@/components/molecules/glass-card";
import { SceneNavigationSkeleton } from "@/features/writer/components/left-sidebar/scene-navigation-skeleton";
import { SidebarChapter } from "@/features/writer/components/left-sidebar/sidebar-chapter";
import { useSceneNavigation } from "@/features/writer/hooks/use-scene-navigation";
import { useSceneOperations } from "@/features/writer/hooks/use-scene-operations";
import { useSceneSelection } from "@/features/writer/hooks/use-scene-selection";
import type { Project } from "@/lib/db/schema";
import type { ChapterWithScenes } from "@/lib/types";

interface SceneNavigationProps {
	project: Project;
	activeSceneId: string | null;
	onSceneSelect: (sceneId: string | null) => void;
	structure: ChapterWithScenes[] | null;
	loading: boolean;
	onStructureUpdate?: () => void;
	readOnly?: boolean;
}

export const SceneNavigation = memo(function SceneNavigation({
	project,
	activeSceneId,
	onSceneSelect,
	structure,
	loading,
	onStructureUpdate,
	readOnly,
}: SceneNavigationProps) {
	// ⚡ Bolt: Optimization note: activeSceneId is stored in a ref inside useSceneOperations
	// to prevent prop instability in onDelete, preventing unnecessary re-renders.

	// Operations Hook (Create, Delete, Rename)
	const {
		isGenerating,
		isCreatingChapter,
		deletedSceneIds,
		deletedChapterIds,
		handleGenerateNextScene,
		handleCreateSceneManually,
		handleRenameScene,
		handleDeleteScene,
		performDelete,
		handleCreateChapter,
		handleRenameChapter,
		handleDeleteChapter,
	} = useSceneOperations({
		projectId: project.id,
		activeSceneId,
		onSceneSelect,
		onStructureUpdate,
		structure,
	});

	// Navigation Hook (Search, Expand)
	const {
		expandedChapters,
		handleExpandedChange,
		searchTerm,
		handleSearchChange,
		filteredStructure,
		handleExpandAll,
		handleCollapseAll,
		clearSearch,
	} = useSceneNavigation(structure, deletedSceneIds, deletedChapterIds);

	// Selection Hook (Bulk Actions)
	const {
		isSelectionMode,
		selectedSceneIds,
		toggleSelectionMode,
		toggleSceneSelect,
		handleBulkExport,
		handleBulkDelete,
	} = useSceneSelection(performDelete);

	if (loading) {
		return <SceneNavigationSkeleton />;
	}

	if (!structure) {
		return (
			<div className="p-4 text-sm text-muted-foreground">
				Failed to load structure.
			</div>
		);
	}

	// Only show empty state if there are no chapters AND no search term
	if (structure.length === 0 && !searchTerm) {
		return (
			<div className="h-full flex items-center justify-center p-4">
				<EmptyState
					title="No chapters yet"
					description="Start building your story by adding the first chapter."
					icon={BookPlus}
					variant="glass"
					className="w-full max-w-sm"
					action={
						<Button
							onClick={handleCreateChapter}
							disabled={isCreatingChapter || readOnly}
							variant="default"
							size="sm"
							className="mt-2"
						>
							{isCreatingChapter ? (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							) : (
								<Plus className="mr-2 h-4 w-4" />
							)}
							Add First Chapter
						</Button>
					}
				/>
			</div>
		);
	}

	const displayStructure = filteredStructure || [];

	return (
		<div className="flex flex-col h-full relative">
			<div className="px-4 py-2 space-y-2">
				<div className="relative">
					<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
					<Input
						placeholder="Search scenes..."
						aria-label="Search scenes"
						value={searchTerm}
						onChange={handleSearchChange}
						className="pl-8 h-9 text-sm"
					/>
				</div>
				<div className="flex items-center justify-between">
					<span className="text-xs font-medium text-muted-foreground">
						{displayStructure.length} Chapters
						{searchTerm &&
							` (${structure.length - displayStructure.length} hidden)`}
					</span>
					<div className="flex gap-1">
						<Button
							variant={isSelectionMode ? "secondary" : "ghost"}
							size="icon"
							className="h-6 w-6"
							onClick={toggleSelectionMode}
							title="Select Scenes"
						>
							{isSelectionMode ? (
								<X className="h-3 w-3" />
							) : (
								<CheckSquare className="h-3 w-3" />
							)}
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="h-6 w-6"
							onClick={handleExpandAll}
							title="Expand All"
						>
							<ChevronsDown className="h-3 w-3" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="h-6 w-6"
							onClick={handleCollapseAll}
							title="Collapse All"
						>
							<ChevronsUp className="h-3 w-3" />
						</Button>
					</div>
				</div>
			</div>
			<ScrollArea className="flex-1">
				{displayStructure.length === 0 && searchTerm ? (
					<div className="flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in-95 duration-200">
						<div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/20 mb-3">
							<SearchX className="h-6 w-6 text-muted-foreground/50" />
						</div>
						<p className="text-sm font-medium text-foreground">
							No matches found
						</p>
						<p className="text-xs text-muted-foreground mt-1 max-w-[180px]">
							No chapters or scenes match "{searchTerm}"
						</p>
						<Button
							variant="ghost"
							size="sm"
							className="mt-4 h-7 text-xs"
							onClick={clearSearch}
						>
							Clear Search
						</Button>
					</div>
				) : (
					<Accordion
						type="multiple"
						value={expandedChapters}
						onValueChange={handleExpandedChange}
						className="w-full"
					>
						{displayStructure.map((chapter) => (
							<SidebarChapter
								key={chapter.id}
								chapter={chapter}
								activeSceneId={activeSceneId}
								isGenerating={isGenerating}
								readOnly={readOnly}
								isSelectionMode={isSelectionMode}
								selectedSceneIds={selectedSceneIds}
								onSceneSelect={onSceneSelect}
								onGenerateNextScene={handleGenerateNextScene}
								onCreateSceneManually={handleCreateSceneManually}
								onRenameScene={handleRenameScene}
								onDeleteScene={handleDeleteScene}
								onToggleSceneSelect={toggleSceneSelect}
								onRenameChapter={handleRenameChapter}
								onDeleteChapter={handleDeleteChapter}
							/>
						))}
						{!searchTerm && (
							<div className="p-2">
								<Button
									variant="ghost"
									size="sm"
									className="w-full justify-start text-muted-foreground"
									onClick={handleCreateChapter}
									disabled={isCreatingChapter || readOnly}
								>
									{isCreatingChapter ? (
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									) : (
										<Plus className="mr-2 h-4 w-4" />
									)}
									Add Chapter
								</Button>
							</div>
						)}
					</Accordion>
				)}
			</ScrollArea>
			{isSelectionMode && (
				<div className="absolute bottom-4 left-4 right-4 z-20">
					<GlassCard
						variant="liquid"
						className="p-1.5 flex gap-2 shadow-xl border-border/50"
					>
						<Button
							size="sm"
							variant="ghost"
							className="flex-1 text-xs hover:bg-destructive/10 hover:text-destructive text-muted-foreground"
							onClick={handleBulkDelete}
							disabled={selectedSceneIds.size === 0}
						>
							<Trash2 className="mr-2 h-3 w-3" />
							Delete ({selectedSceneIds.size})
						</Button>
						<div className="w-px bg-border/50 my-1" />
						<Button
							size="sm"
							variant="ghost"
							className="flex-1 text-xs text-muted-foreground hover:text-foreground"
							onClick={handleBulkExport}
							disabled={selectedSceneIds.size === 0}
						>
							<Download className="mr-2 h-3 w-3" />
							Export ({selectedSceneIds.size})
						</Button>
					</GlassCard>
				</div>
			)}
		</div>
	);
});
