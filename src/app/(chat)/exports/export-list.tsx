"use client";

import { useMutation } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Download, FileText, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { DeleteExportButton } from "@/app/(chat)/exports/delete-export-button";
import { deleteBulkExports } from "@/app/actions/exports";
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import { Checkbox } from "@/components/atoms/checkbox";
import { EmptyState } from "@/components/molecules/empty-state";
import { GlassCard } from "@/components/molecules/glass-card";
import type { BookExport } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

interface ExportWithProject extends BookExport {
	projectName: string;
}

interface ExportListProps {
	exports: ExportWithProject[];
}

export function ExportList({ exports }: ExportListProps) {
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const [showConfirmation, setShowConfirmation] = useState(false);
	const router = useRouter();

	const toggleSelection = (id: string) => {
		const newSelection = new Set(selectedIds);
		if (newSelection.has(id)) {
			newSelection.delete(id);
		} else {
			newSelection.add(id);
		}
		setSelectedIds(newSelection);
		setShowConfirmation(false); // Reset confirmation if selection changes
	};

	const toggleAll = () => {
		if (selectedIds.size === exports.length) {
			setSelectedIds(new Set());
		} else {
			setSelectedIds(new Set(exports.map((e) => e.id)));
		}
		setShowConfirmation(false);
	};

	const { mutate: handleBulkDelete, isPending: isDeleting } = useMutation({
		mutationFn: async () => {
			const result = await deleteBulkExports({
				exportIds: Array.from(selectedIds),
			});
			if (!result.success) throw new Error(result.error);
			return result;
		},
		onSuccess: () => {
			toast.success(`Deleted ${selectedIds.size} exports`);
			setSelectedIds(new Set());
			setShowConfirmation(false);
			router.refresh();
		},
		onError: () => {
			toast.error("Failed to delete exports");
		},
	});

	if (exports.length === 0) {
		return (
			<EmptyState
				variant="glass"
				title="No exports yet"
				description="Export your books from the project page to see them here."
				icon={BookOpen}
				action={
					<Button asChild>
						<Link href="/projects">Go to Projects</Link>
					</Button>
				}
			/>
		);
	}

	return (
		<div className="relative grid gap-4 pb-24">
			<div className="flex items-center justify-between mb-2 px-2">
				<div className="flex items-center gap-2">
					<Checkbox
						checked={selectedIds.size === exports.length && exports.length > 0}
						onCheckedChange={toggleAll}
						id="select-all"
					/>
					<label
						htmlFor="select-all"
						className="text-sm text-muted-foreground cursor-pointer select-none"
					>
						Select All
					</label>
				</div>
				<div className="text-sm text-muted-foreground">
					{selectedIds.size} selected
				</div>
			</div>

			{exports.map((exportItem) => (
				<GlassCard
					key={exportItem.id}
					variant="liquid"
					className={cn(
						"p-6 transition-colors duration-200",
						selectedIds.has(exportItem.id)
							? "bg-primary/5 border-primary/20"
							: "",
					)}
				>
					<div className="flex flex-row items-center justify-between gap-4">
						<div className="flex items-center gap-4">
							<Checkbox
								checked={selectedIds.has(exportItem.id)}
								onCheckedChange={() => toggleSelection(exportItem.id)}
								onClick={(e) => e.stopPropagation()}
							/>
							{exportItem.format === "pdf" ? (
								<div className="p-2.5 rounded-xl bg-red-500/10 text-red-500">
									<FileText size={24} />
								</div>
							) : (
								<div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
									<BookOpen size={24} />
								</div>
							)}
							<div>
								<h3 className="font-semibold text-base">
									{exportItem.projectName}
								</h3>
								<div className="flex items-center gap-2 mt-1">
									<Badge
										variant="outline"
										className="text-[10px] h-5 px-1.5 uppercase"
									>
										{exportItem.format}
									</Badge>
									<span className="text-muted-foreground text-xs">
										{new Date(exportItem.createdAt).toLocaleDateString()}
									</span>
									{exportItem.status === "pending" && (
										<Badge variant="secondary" className="text-[10px] h-5">
											Processing
										</Badge>
									)}
									{exportItem.status === "failed" && (
										<Badge variant="destructive" className="text-[10px] h-5">
											Failed
										</Badge>
									)}
								</div>
							</div>
						</div>
						<div className="flex items-center gap-2">
							{exportItem.status === "completed" && exportItem.blobUrl && (
								<Button asChild size="sm" variant="outline">
									<a
										href={exportItem.blobUrl}
										download
										target="_blank"
										rel="noopener noreferrer"
									>
										<Download className="mr-2 size-4" />
										Download
									</a>
								</Button>
							)}
							<DeleteExportButton exportId={exportItem.id} />
						</div>
					</div>
					{exportItem.error && (
						<div className="mt-4 p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
							{exportItem.error}
						</div>
					)}
				</GlassCard>
			))}

			<AnimatePresence>
				{selectedIds.size > 0 && (
					<motion.div
						initial={{ opacity: 0, y: 50 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 50 }}
						className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4"
					>
						<GlassCard
							variant="liquid"
							className="p-4 flex items-center justify-between shadow-xl border-primary/20 bg-background/80 backdrop-blur-xl rounded-2xl"
						>
							<div className="flex items-center gap-2">
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8 rounded-full"
									onClick={() => {
										setSelectedIds(new Set());
										setShowConfirmation(false);
									}}
								>
									<X className="h-4 w-4" />
								</Button>
								<span className="font-medium text-sm">
									{selectedIds.size} selected
								</span>
							</div>

							<div className="flex items-center gap-2">
								{showConfirmation ? (
									<>
										<span className="text-xs text-muted-foreground mr-1">
											Are you sure?
										</span>
										<Button
											variant="ghost"
											size="sm"
											onClick={() => setShowConfirmation(false)}
										>
											Cancel
										</Button>
										<Button
											variant="destructive"
											size="sm"
											onClick={() => handleBulkDelete()}
											disabled={isDeleting}
										>
											{isDeleting && (
												<div className="animate-spin mr-2 h-3 w-3 border-2 border-current border-t-transparent rounded-full" />
											)}
											Yes, Delete
										</Button>
									</>
								) : (
									<Button
										variant="destructive"
										size="sm"
										onClick={() => setShowConfirmation(true)}
									>
										<Trash2 className="mr-2 h-4 w-4" />
										Delete Selected
									</Button>
								)}
							</div>
						</GlassCard>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
