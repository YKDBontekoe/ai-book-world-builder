"use client";

import { Copy, MoreHorizontal, Pencil, Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
	deleteScene,
	duplicateScene,
	updateSceneTitle,
} from "@/app/actions/scene-ops";
import { generateScene } from "@/app/actions/writer";
import { Button } from "@/components/atoms/button";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSeparator,
	ContextMenuTrigger,
} from "@/components/atoms/context-menu";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/atoms/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/atoms/dropdown-menu";
import { Input } from "@/components/atoms/input";
import { cn } from "@/lib/utils";

interface SceneItemProps {
	scene: {
		id: string;
		title: string;
		sequence: number;
		content?: string | null;
	};
	chapterId: string;
	isActive: boolean;
	onSelect: () => void;
	onUpdate: () => void;
}

export function SceneItem({
	scene,
	chapterId,
	isActive,
	onSelect,
	onUpdate,
}: SceneItemProps) {
	const [_isRenaming, setIsRenaming] = useState(false);
	const [newName, setNewName] = useState(scene.title);
	const [isActionLoading, setIsActionLoading] = useState(false);
	const [showRenameDialog, setShowRenameDialog] = useState(false);

	const handleRename = async () => {
		if (!newName.trim() || newName === scene.title) {
			setIsRenaming(false);
			setShowRenameDialog(false);
			return;
		}

		const toastId = toast.loading("Renaming...");
		const result = await updateSceneTitle(scene.id, newName);

		if (result.success) {
			toast.success("Renamed", { id: toastId });
			onUpdate();
		} else {
			toast.error("Failed to rename", { id: toastId });
			setNewName(scene.title);
		}
		setIsRenaming(false);
		setShowRenameDialog(false);
	};

	const handleDuplicate = async () => {
		setIsActionLoading(true);
		const toastId = toast.loading("Duplicating...");
		const result = await duplicateScene(scene.id);
		if (result.success) {
			toast.success("Duplicated", { id: toastId });
			onUpdate();
		} else {
			toast.error("Failed to duplicate", { id: toastId });
		}
		setIsActionLoading(false);
	};

	const handleDelete = async () => {
		if (!confirm("Are you sure you want to delete this scene?")) return;
		setIsActionLoading(true);
		const toastId = toast.loading("Deleting...");
		const result = await deleteScene(scene.id);
		if (result.success) {
			toast.success("Deleted", { id: toastId });
			onUpdate();
		} else {
			toast.error("Failed to delete", { id: toastId });
		}
		setIsActionLoading(false);
	};

	const handleGenerateNext = async () => {
		setIsActionLoading(true);
		const toastId = toast.loading("Generating next scene...");
		const result = await generateScene(chapterId, scene.id);
		if (result.success) {
			toast.success("Generated", { id: toastId });
			onUpdate();
		} else {
			toast.error("Failed to generate", { id: toastId });
		}
		setIsActionLoading(false);
	};

	// Quick status indicator
	const isEmpty = !scene.content || scene.content.trim().length === 0;

	return (
		<>
			<ContextMenu>
				<ContextMenuTrigger>
					<div className="group flex items-center gap-1 relative">
						<button
							type="button"
							onClick={onSelect}
							onDoubleClick={() => setShowRenameDialog(true)}
							disabled={isActionLoading}
							className={cn(
								"flex-1 flex items-center gap-2 px-2 py-1.5 text-sm rounded-md transition-colors text-left",
								isActive
									? "bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium"
									: "text-muted-foreground hover:bg-sidebar-accent/50",
								isActionLoading && "opacity-50 cursor-wait",
							)}
						>
							<div
								className={cn(
									"h-1.5 w-1.5 rounded-full",
									isEmpty
										? "border border-current bg-transparent"
										: "bg-current",
									"opacity-50",
								)}
								title={isEmpty ? "Empty Scene" : "Has Content"}
							/>
							<span className="truncate flex-1">{scene.title}</span>
						</button>

						{/* Quick Actions Hover Menu */}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className={cn(
										"h-6 w-6 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity absolute right-1",
										isActive && "opacity-100",
									)}
								>
									<MoreHorizontal className="h-3 w-3" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-40">
								<DropdownMenuItem onClick={() => setShowRenameDialog(true)}>
									<Pencil className="mr-2 h-3.5 w-3.5" />
									Rename
								</DropdownMenuItem>
								<DropdownMenuItem onClick={handleDuplicate}>
									<Copy className="mr-2 h-3.5 w-3.5" />
									Duplicate
								</DropdownMenuItem>
								<DropdownMenuItem onClick={handleGenerateNext}>
									<Sparkles className="mr-2 h-3.5 w-3.5" />
									Continue
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									onClick={handleDelete}
									className="text-destructive focus:text-destructive"
								>
									<Trash2 className="mr-2 h-3.5 w-3.5" />
									Delete
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</ContextMenuTrigger>
				<ContextMenuContent>
					<ContextMenuItem onClick={() => setShowRenameDialog(true)}>
						<Pencil className="mr-2 h-4 w-4" />
						Rename
					</ContextMenuItem>
					<ContextMenuItem onClick={handleDuplicate}>
						<Copy className="mr-2 h-4 w-4" />
						Duplicate
					</ContextMenuItem>
					<ContextMenuItem onClick={handleGenerateNext}>
						<Sparkles className="mr-2 h-4 w-4" />
						Generate Continuation
					</ContextMenuItem>
					<ContextMenuSeparator />
					<ContextMenuItem onClick={handleDelete} className="text-destructive">
						<Trash2 className="mr-2 h-4 w-4" />
						Delete Scene
					</ContextMenuItem>
				</ContextMenuContent>
			</ContextMenu>

			<Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Rename Scene</DialogTitle>
					</DialogHeader>
					<div className="py-4">
						<Input
							value={newName}
							onChange={(e) => setNewName(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter") handleRename();
							}}
							autoFocus
							className="glass-input"
						/>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setShowRenameDialog(false)}
						>
							Cancel
						</Button>
						<Button onClick={handleRename}>Save</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
