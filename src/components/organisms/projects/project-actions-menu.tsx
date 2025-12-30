"use client";

import { Copy, Edit, MoreHorizontal, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
	deleteProject,
	forkProject,
	renameProject,
} from "@/app/actions/projects";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/atoms/alert-dialog";
import { Button } from "@/components/atoms/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/atoms/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/atoms/dropdown-menu";
import { Input } from "@/components/atoms/input";

interface ProjectActionsMenuProps {
	projectId: string;
	projectName: string;
	projectDescription?: string | null;
	onDelete?: () => void;
}

export function ProjectActionsMenu({
	projectId,
	projectName,
	projectDescription,
	onDelete,
}: ProjectActionsMenuProps) {
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [showRenameDialog, setShowRenameDialog] = useState(false);
	const [newName, setNewName] = useState(projectName);
	const [newDescription, setNewDescription] = useState(
		projectDescription || "",
	);
	const [isDeleting, setIsDeleting] = useState(false);
	const [isForking, setIsForking] = useState(false);
	const [isRenaming, setIsRenaming] = useState(false);

	useEffect(() => {
		if (showRenameDialog) {
			setNewName(projectName);
			setNewDescription(projectDescription || "");
		}
	}, [showRenameDialog, projectName, projectDescription]);

	const handleDelete = async () => {
		if (onDelete) {
			// Use optimistic delete provided by parent
			onDelete();
			// Optimistic delete handles UI updates/undo, so we just close the dropdown/dialog logic
			return;
		}

		// Fallback to traditional delete if no optimistic handler provided
		setIsDeleting(true);
		try {
			const result = await deleteProject(projectId);
			if (result && "error" in result) {
				toast.error(result.error);
			} else {
				toast.success("Project deleted");
			}
		} catch (error) {
			toast.error("Failed to delete project");
		} finally {
			setIsDeleting(false);
			setShowDeleteDialog(false);
		}
	};

	const handleFork = async () => {
		setIsForking(true);
		toast.info("Forking project...");
		try {
			const result = await forkProject(projectId);
			if (result && "error" in result) {
				toast.error(result.error);
			} else {
				toast.success("Project forked successfully");
			}
		} catch (error) {
			toast.error("Failed to fork project");
		} finally {
			setIsForking(false);
		}
	};

	const handleRename = async () => {
		setIsRenaming(true);
		try {
			const result = await renameProject(projectId, newName, newDescription);
			if (result && "error" in result) {
				toast.error(result.error);
			} else {
				toast.success("Project renamed");
				setShowRenameDialog(false);
			}
		} catch (error) {
			toast.error("Failed to rename project");
		} finally {
			setIsRenaming(false);
		}
	};

	return (
		<>
			<div
				onClick={(e) => e.stopPropagation()}
				onKeyDown={(e) => e.stopPropagation()}
			>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8 p-0 hover:bg-muted/50 focus-visible:ring-0 focus-visible:ring-offset-0"
							onClick={(e) => e.stopPropagation()}
						>
							<span className="sr-only">Open menu</span>
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-[160px]">
						<DropdownMenuItem
							onClick={(e) => {
								e.stopPropagation();
								setShowRenameDialog(true);
							}}
						>
							<Edit className="mr-2 h-4 w-4" />
							Rename
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={(e) => {
								e.stopPropagation();
								handleFork();
							}}
							disabled={isForking}
						>
							<Copy className="mr-2 h-4 w-4" />
							Duplicate
						</DropdownMenuItem>
						<DropdownMenuItem
							className="text-destructive focus:text-destructive"
							onClick={(e) => {
								e.stopPropagation();
								if (onDelete) {
									handleDelete();
								} else {
									setShowDeleteDialog(true);
								}
							}}
						>
							<Trash className="mr-2 h-4 w-4" />
							Delete
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			{/* Only render Alert Dialog if we don't have an optimistic handler */}
			{!onDelete && (
				<AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
					<AlertDialogContent onClick={(e) => e.stopPropagation()}>
						<AlertDialogHeader>
							<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
							<AlertDialogDescription>
								This action cannot be undone. This will permanently delete the
								project "{projectName}" and remove all its data.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel
								disabled={isDeleting}
								onClick={(e) => e.stopPropagation()}
							>
								Cancel
							</AlertDialogCancel>
							<AlertDialogAction
								onClick={(e) => {
									e.preventDefault();
									e.stopPropagation();
									handleDelete();
								}}
								disabled={isDeleting}
								className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
							>
								{isDeleting ? "Deleting..." : "Delete"}
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			)}

			<Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
				<DialogContent onClick={(e) => e.stopPropagation()}>
					<DialogHeader>
						<DialogTitle>Rename Project</DialogTitle>
						<DialogDescription>
							Make changes to your project here. Click save when you're done.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Input
								id="name"
								value={newName}
								onChange={(e) => setNewName(e.target.value)}
								placeholder="Project Name"
								autoFocus
							/>
						</div>
						<div className="grid gap-2">
							<Input
								id="description"
								value={newDescription}
								onChange={(e) => setNewDescription(e.target.value)}
								placeholder="Description (optional)"
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={(e) => {
								e.stopPropagation();
								setShowRenameDialog(false);
							}}
							disabled={isRenaming}
						>
							Cancel
						</Button>
						<Button
							onClick={(e) => {
								e.stopPropagation();
								handleRename();
							}}
							disabled={isRenaming}
						>
							{isRenaming ? "Saving..." : "Save Changes"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
