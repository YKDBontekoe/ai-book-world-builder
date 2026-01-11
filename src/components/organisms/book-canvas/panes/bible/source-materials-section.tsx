"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookUp2Icon, Check, FileTextIcon, SparklesIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
	analyzeBook,
	getSourceMaterialsForProject,
} from "@/app/actions/book-analysis";
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import { LoadingSpinner } from "@/components/atoms/loading-spinner";
import { QUERY_KEYS } from "@/lib/query-options";

export function SourceMaterialsSection({ projectId }: { projectId: string }) {
	const queryClient = useQueryClient();
	const [analyzedIds, setAnalyzedIds] = useState<Set<string>>(new Set());

	// Source materials often don't have a specific key factory, let's assume one or use inline
	const { data: materials, isLoading } = useQuery({
		queryKey: ["source-materials", projectId],
		queryFn: () => getSourceMaterialsForProject(projectId),
		refetchInterval: 10000,
	});

	const { mutate: analyze, isPending } = useMutation({
		mutationFn: async ({
			materialId,
			filename: _filename,
		}: {
			materialId: string;
			filename: string;
		}) => {
			return analyzeBook({
				sourceMaterialId: materialId,
				projectId,
				extractRelationships: true,
			});
		},
		onMutate: ({ filename }) => {
			return { toastId: toast.loading(`Analyzing "${filename}"...`) };
		},
		onSuccess: (response, { materialId }, context) => {
			if (response.success) {
				toast.success(
					`Created ${response.result.stats.entitiesCreated} entities and ${response.result.stats.relationshipsCreated} relationships!`,
					{ id: context?.toastId },
				);
				setAnalyzedIds((prev) => new Set([...prev, materialId]));
				// Refresh entities and relationships
				queryClient.invalidateQueries({
					queryKey: QUERY_KEYS.entities(projectId),
				});
				queryClient.invalidateQueries({
					queryKey: QUERY_KEYS.relationships(projectId),
				});
			} else {
				toast.error(response.error, { id: context?.toastId });
			}
		},
		onError: (error, _, context) => {
			toast.error(error instanceof Error ? error.message : "Analysis failed", {
				id: context?.toastId,
			});
		},
	});

	const processedMaterials =
		materials?.filter((m) => m.status === "processed") ?? [];

	if (isLoading || processedMaterials.length === 0) {
		return null;
	}

	return (
		<div className="space-y-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
			<div className="flex items-center gap-2">
				<BookUp2Icon className="h-4 w-4 text-amber-500" />
				<h3 className="font-semibold text-sm">Import from Books</h3>
				<Badge variant="secondary" className="text-xs">
					{processedMaterials.length}
				</Badge>
			</div>
			<div className="space-y-2">
				{processedMaterials.map((material) => {
					const isAnalyzed = analyzedIds.has(material.id);
					return (
						<div
							key={material.id}
							className="flex items-center gap-2 rounded-md border bg-card p-2"
						>
							<FileTextIcon className="h-4 w-4 text-muted-foreground shrink-0" />
							<span className="text-sm truncate flex-1">
								{material.filename}
							</span>
							{isAnalyzed ? (
								<Badge variant="secondary" className="gap-1 shrink-0">
									<Check className="h-3 w-3" />
									Done
								</Badge>
							) : (
								<Button
									size="sm"
									variant="ghost"
									className="h-7 px-2 gap-1 shrink-0"
									onClick={() =>
										analyze({
											materialId: material.id,
											filename: material.filename,
										})
									}
									disabled={isPending}
								>
									{isPending ? (
										<LoadingSpinner size="xs" />
									) : (
										<SparklesIcon className="h-3 w-3" />
									)}
									Analyze
								</Button>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}
