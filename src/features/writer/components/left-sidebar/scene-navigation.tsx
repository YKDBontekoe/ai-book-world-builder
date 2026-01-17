"use client";

import { isEqual } from "lodash";
import {
	BookPlus,
	ChevronsDown,
	ChevronsUp,
	FilePlus2,
	Loader2,
	Plus,
	Search,
	Sparkles,
} from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useDebounceCallback } from "usehooks-ts";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/atoms/accordion";
import { Button } from "@/components/atoms/button";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuTrigger,
} from "@/components/atoms/context-menu";
import { Input } from "@/components/atoms/input";
import { ScrollArea } from "@/components/atoms/scroll-area";
import { EmptyState } from "@/components/molecules/empty-state";
import {
	createNewChapter,
	createSceneInChapter,
	deleteScene,
	generateScene,
	updateSceneTitle,
} from "@/features/writer/actions";
import { SceneItem } from "@/features/writer/components/left-sidebar/scene-item";
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
	const [isGenerating, setIsGenerating] = useState(false);
	const [isCreatingChapter, setIsCreatingChapter] = useState(false);
	const [expandedChapters, setExpandedChapters] = useState<string[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

	// Stable setter for expanded chapters to prevent loops
	const handleExpandedChange = useCallback((newValues: string[]) => {
		setExpandedChapters((prev) =>
			isEqual(prev, newValues) ? prev : newValues,
		);
	}, []);

	// ⚡ Bolt: Store activeSceneId in ref to prevent prop instability in onDelete
	// This prevents all SceneItems from re-rendering when selection changes
	const activeSceneIdRef = useRef(activeSceneId);
	useEffect(() => {
		activeSceneIdRef.current = activeSceneId;
	}, [activeSceneId]);

	// Initialize expanded state when structure loads - only if not already initialized
	const hasInitializedRef = useRef(false);

	useEffect(() => {
		if (structure && structure.length > 0 && !hasInitializedRef.current) {
			const initialIds = structure.map((c) => c.id);
			setExpandedChapters(initialIds);
			hasInitializedRef.current = true;
		}
	}, [structure]); // Only depend on structure for initialization

	// Search handling
	const updateDebouncedSearch = useCallback((value: string) => {
		setDebouncedSearchTerm(value);
	}, []);

	const debouncedSearch = useDebounceCallback(updateDebouncedSearch, 300);

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(e.target.value);
		debouncedSearch(e.target.value);
	};

	const filteredStructure = useMemo(() => {
		if (!structure) return null;
		if (!debouncedSearchTerm) return structure;

		const lowerTerm = debouncedSearchTerm.toLowerCase();
		return structure
			.map((chapter) => {
				const titleMatch = chapter.title.toLowerCase().includes(lowerTerm);
				const matchingScenes = chapter.scenes.filter((scene) =>
					scene.title.toLowerCase().includes(lowerTerm),
				);

				// If chapter matches, we include it.
				// If we want to show all scenes when chapter matches, we return chapter as is.
				// However, filtering scenes usually helps narrowing down.
				// Let's decide: Show chapter if title matches OR has matching scenes.
				// AND filter scenes to only show matches, unless chapter title matches (then show all?? No, keeps it cleaner to filter).
				// Actually, if I search "Chapter 1", I expect to see Chapter 1 and maybe its scenes.
				// If I search "Scene A", I expect to see Chapter 1 > Scene A.
				// Let's stick to strict filtering for scenes.

				if (matchingScenes.length > 0) {
					return {
						...chapter,
						scenes: matchingScenes,
					};
				}

				if (titleMatch) {
					// If only chapter title matches, show it with all scenes (or empty? maybe better to show scenes context)
					return chapter;
				}

				return null;
			})
			.filter(Boolean) as ChapterWithScenes[];
	}, [structure, debouncedSearchTerm]);

	// Auto-expand on search
	useEffect(() => {
		if (debouncedSearchTerm && filteredStructure) {
			const matchingIds = filteredStructure.map((c) => c.id);
			setExpandedChapters((prev) => {
				// Merge existing expanded with new matches or just set matches?
				// Usually search results should be expanded.
				// Let's just set them to expanded.
				return isEqual(prev, matchingIds) ? prev : matchingIds;
			});
		}
	}, [debouncedSearchTerm, filteredStructure]);

	const handleExpandAll = useCallback(() => {
		if (structure) {
			const allIds = structure.map((c) => c.id);
			setExpandedChapters((prev) => (isEqual(prev, allIds) ? prev : allIds));
		}
	}, [structure]);

	const handleCollapseAll = useCallback(() => {
		setExpandedChapters((prev) => (prev.length === 0 ? prev : []));
	}, []);

	const handleGenerateNextScene = useCallback(
		async (chapterId: string, prevSceneId?: string) => {
			setIsGenerating(true);
			const toastId = toast.loading("Generating new scene...");

			try {
				const result = await generateScene(chapterId, prevSceneId);
				if (result.success && result.sceneId) {
					toast.success("Scene generated!", { id: toastId });
					onStructureUpdate?.();
				} else {
					toast.error("Generation failed", { id: toastId });
				}
			} catch (_e) {
				toast.error("Error generating scene", { id: toastId });
			} finally {
				setIsGenerating(false);
			}
		},
		[onStructureUpdate],
	);

	const handleCreateSceneManually = useCallback(
		async (chapterId: string) => {
			const toastId = toast.loading("Creating scene...");
			try {
				const result = await createSceneInChapter(chapterId, "New Scene");
				if (result.success && result.sceneId) {
					toast.success("Scene created", { id: toastId });
					onStructureUpdate?.();
					// Optionally select the new scene
					onSceneSelect(result.sceneId);
				} else {
					toast.error(result.error || "Failed to create scene", {
						id: toastId,
					});
				}
			} catch (_e) {
				toast.error("Error creating scene", { id: toastId });
			}
		},
		[onStructureUpdate, onSceneSelect],
	);

	const handleRenameScene = useCallback(
		async (sceneId: string, newTitle: string) => {
			const toastId = toast.loading("Renaming scene...");
			try {
				const result = await updateSceneTitle(sceneId, newTitle);
				if (result.success) {
					toast.success("Scene renamed", { id: toastId });
					onStructureUpdate?.();
				} else {
					toast.error("Failed to rename scene", { id: toastId });
				}
			} catch (_e) {
				toast.error("Error renaming scene", { id: toastId });
			}
		},
		[onStructureUpdate],
	);

	const handleDeleteScene = useCallback(
		async (sceneId: string) => {
			const toastId = toast.loading("Deleting scene...");
			try {
				const result = await deleteScene(sceneId);
				if (result.success) {
					toast.success("Scene deleted", { id: toastId });
					onStructureUpdate?.();
					// Use ref to check current selection without invalidating callback
					if (activeSceneIdRef.current === sceneId) {
						onSceneSelect(null); // Clear selection
					}
				} else {
					toast.error(result.error || "Failed to delete scene", {
						id: toastId,
					});
				}
			} catch (_e) {
				toast.error("Error deleting scene", { id: toastId });
			}
		},
		[onStructureUpdate, onSceneSelect],
	);

	const handleCreateChapter = async () => {
		setIsCreatingChapter(true);
		const toastId = toast.loading("Creating new chapter...");
		try {
			const result = await createNewChapter(project.id);
			if (result.success) {
				toast.success("Chapter created!", { id: toastId });
				onStructureUpdate?.();
			} else {
				toast.error("Failed to create chapter", { id: toastId });
			}
		} catch (_e) {
			toast.error("Error creating chapter", { id: toastId });
		} finally {
			setIsCreatingChapter(false);
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center p-8">
				<Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
			</div>
		);
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
		<div className="flex flex-col h-full">
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
					<div className="p-4 text-center text-sm text-muted-foreground">
						No chapters or scenes found matching "{searchTerm}"
					</div>
				) : (
					<Accordion
						type="multiple"
						value={expandedChapters}
						onValueChange={handleExpandedChange}
						className="w-full"
					>
						{displayStructure.map((chapter) => (
							<AccordionItem
								key={chapter.id}
								value={chapter.id}
								className="border-b-0 px-2"
							>
								<ContextMenu>
									<ContextMenuTrigger disabled={readOnly}>
										<AccordionTrigger className="hover:no-underline py-2 text-sm font-medium">
											<span className="truncate text-left">
												{chapter.title}
											</span>
										</AccordionTrigger>
									</ContextMenuTrigger>
									<ContextMenuContent>
										<ContextMenuItem
											onClick={() => handleGenerateNextScene(chapter.id)}
											disabled={isGenerating}
										>
											<Sparkles className="mr-2 h-4 w-4" />
											Generate New Scene
										</ContextMenuItem>
										<ContextMenuItem
											onClick={() => handleCreateSceneManually(chapter.id)}
										>
											<FilePlus2 className="mr-2 h-4 w-4" />
											Add Scene Manually
										</ContextMenuItem>
									</ContextMenuContent>
								</ContextMenu>

								<AccordionContent className="pb-2 pt-0">
									<div className="flex flex-col gap-1 pl-2 relative ml-2">
										{chapter.scenes.map((scene) => (
											<SceneItem
												key={scene.id}
												id={scene.id}
												title={scene.title}
												isActive={activeSceneId === scene.id}
												chapterId={chapter.id}
												onSelect={onSceneSelect}
												onGenerateNext={handleGenerateNextScene}
												isGenerating={isGenerating}
												onRename={handleRenameScene}
												onDelete={handleDeleteScene}
												readOnly={readOnly}
											/>
										))}
										<Button
											variant="ghost"
											size="sm"
											className="justify-start h-8 w-full px-2 text-xs text-muted-foreground italic"
											onClick={() => handleCreateSceneManually(chapter.id)}
											disabled={isGenerating || readOnly}
										>
											<Plus className="mr-2 h-3 w-3" />
											Add Scene
										</Button>
									</div>
								</AccordionContent>
							</AccordionItem>
						))}
						{/* Always allow adding a new chapter at the bottom, even when searching?
                            Maybe not when searching, it might be confusing.
                            But usually "Add" buttons should persist.
                            Let's keep it but maybe warn user? No, standard pattern is to keep it.
                         */}
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
		</div>
	);
});
