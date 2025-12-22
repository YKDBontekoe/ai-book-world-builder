"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LinkIcon, MoreHorizontal, Pencil, Trash } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { deleteEntityAction } from "@/app/actions/entities";
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
import { Card } from "@/components/atoms/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/atoms/dropdown-menu";
import { LoadingSpinner } from "@/components/atoms/loading-spinner";
import { QUERY_KEYS } from "@/lib/query-options";
import { cn } from "@/lib/utils";

export type EntityCardProps = {
	entity: {
		id: string;
		projectId: string;
		name: string;
		summary?: string | null;
	};
	relationshipCount?: number;
	className?: string;
	onDelete?: () => void;
};

function EntityActions({
	entityId,
	projectId,
	entityName,
	onDeleteSuccess,
}: {
	entityId: string;
	projectId: string;
	entityName: string;
	onDeleteSuccess?: () => void;
}) {
	const [showDeleteAlert, setShowDeleteAlert] = useState(false);
	const queryClient = useQueryClient();

	const { mutate: handleDelete, isPending: isDeleting } = useMutation({
		mutationFn: async () => {
			await deleteEntityAction(entityId);
		},
		onSuccess: () => {
			// Invalidate queries to refresh the list
			queryClient.invalidateQueries({ queryKey: QUERY_KEYS.entities(projectId) });
			queryClient.invalidateQueries({
				queryKey: QUERY_KEYS.relationships(projectId),
			});
			onDeleteSuccess?.();
			setShowDeleteAlert(false);
		},
		onError: (error) => {
			console.error("Failed to delete entity:", error);
		},
	});

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						size="icon"
						className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 focus:opacity-100"
					>
						<MoreHorizontal className="h-4 w-4" />
						<span className="sr-only">Open menu</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuItem asChild>
						<Link
							href={`/projects/${projectId}/entities/${entityId}`}
							className="flex items-center cursor-pointer"
						>
							<Pencil className="mr-2 h-4 w-4" />
							Edit
						</Link>
					</DropdownMenuItem>
					<DropdownMenuItem
						className="text-destructive focus:text-destructive cursor-pointer"
						onSelect={() => setShowDeleteAlert(true)}
					>
						<Trash className="mr-2 h-4 w-4" />
						Delete
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This will permanently delete{" "}
							<span className="font-medium text-foreground">{entityName}</span>{" "}
							and remove all its relationships. This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={(e) => {
								e.preventDefault();
								handleDelete();
							}}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
							disabled={isDeleting}
						>
							{isDeleting ? (
								<>
									<LoadingSpinner size="sm" className="mr-2" />
									Deleting...
								</>
							) : (
								"Delete"
							)}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}

export function EntityCard({
	entity,
	relationshipCount = 0,
	className,
	onDelete,
}: EntityCardProps) {
	return (
		<Card
			variant="interactive"
			className={cn(
				"group relative p-3 pr-8 glass-surface border-border/50",
				className,
			)}
		>
			<div className="flex items-start justify-between gap-2">
				<div className="flex-1 min-w-0">
					<h4 className="font-medium text-sm truncate">{entity.name}</h4>
					{entity.summary && (
						<p className="mt-1 text-xs text-muted-foreground line-clamp-2">
							{entity.summary}
						</p>
					)}
				</div>
				{relationshipCount > 0 && (
					<div className="flex items-center gap-0.5 rounded-full bg-muted/60 px-1.5 py-0.5 text-muted-foreground">
						<LinkIcon className="h-3 w-3" />
						<span className="text-xs font-medium">{relationshipCount}</span>
					</div>
				)}
			</div>
			<EntityActions
				entityId={entity.id}
				projectId={entity.projectId}
				entityName={entity.name}
				onDeleteSuccess={onDelete}
			/>
		</Card>
	);
}
