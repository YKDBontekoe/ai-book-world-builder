import { Undo2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { deleteProjects, forkProject } from "@/app/actions/projects";
import { Button } from "@/components/atoms/button";
import { GlassCard } from "@/components/molecules/glass-card";
import type { Project } from "@/lib/db/schema";

export function useProjectActions(
	projects: Project[],
	selectedIds: Set<string>,
	setSelectedIds: (ids: Set<string>) => void,
	setOptimisticDeletedIds: (
		ids: Set<string> | ((prev: Set<string>) => Set<string>),
	) => void,
	optimisticDeletedIds: Set<string>,
) {
	const [isProcessing, setIsProcessing] = useState(false);
	const pendingDeletionRef = useRef<Set<string> | null>(null);
	const undoTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const router = useRouter();

	// Clean up timeout and trigger pending deletions on unmount
	useEffect(() => {
		return () => {
			if (undoTimeoutRef.current) {
				clearTimeout(undoTimeoutRef.current);
			}
			if (pendingDeletionRef.current && pendingDeletionRef.current.size > 0) {
				const ids = Array.from(pendingDeletionRef.current);
				deleteProjects(ids).catch((err) =>
					console.error("Failed to delete pending projects on unmount", err),
				);
				pendingDeletionRef.current = null;
			}
		};
	}, []);

	// biome-ignore lint/correctness/useExhaustiveDependencies: optimisticDeletedIds is needed for optimistic UI updates
	const handleDelete = useCallback(
		(idsToDelete: string[]) => {
			if (idsToDelete.length === 0) return;

			// 1. Optimistic Update
			setOptimisticDeletedIds((prev) => {
				const newOptimisticDeleted = new Set(prev);
				for (const id of idsToDelete) {
					newOptimisticDeleted.add(id);
				}
				return newOptimisticDeleted;
			});

			// Clear selection if any deleted items were selected
			setSelectedIds(
				new Set(
					Array.from(selectedIds).filter((id) => !idsToDelete.includes(id)),
				),
			);

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
					// Optimistic update is already applied
				}
			}, 4500); // Slightly less than toast duration
		},
		[
			optimisticDeletedIds,
			selectedIds,
			setOptimisticDeletedIds,
			setSelectedIds,
		],
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
		URL.revokeObjectURL(url);
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
		URL.revokeObjectURL(url);
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

	return {
		isProcessing,
		handleDelete,
		handleBulkDelete,
		handleBulkExportJson,
		handleBulkExportCsv,
		handleBulkDuplicate,
	};
}
