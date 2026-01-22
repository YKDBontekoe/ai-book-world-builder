"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import {
	createChapterAction,
	deleteChapterAction,
	reorderChaptersAction,
	updateChapterAction,
} from "@/app/actions/chapter-ops";
import {
	getOutlineData,
	type SerializedOutline,
} from "@/app/actions/project-stats";
import { QUERY_KEYS } from "@/lib/query-options";

export function useOutline(projectId: string | null) {
	const queryClient = useQueryClient();

	const { data: outlineResult, isLoading } = useQuery({
		queryKey: projectId ? QUERY_KEYS.outline(projectId) : ["outline", "null"],
		queryFn: async () => {
			if (!projectId) return null;
			return getOutlineData({ projectId });
		},
		enabled: !!projectId,
	});

	// Mutations
	const reorderMutation = useMutation({
		mutationFn: reorderChaptersAction,
		onError: () => {
			toast.error("Failed to reorder chapters");
			// The onSettled invalidation will handle reverting optimistic UI
		},
		onSettled: (_data, _error, variables) => {
			if (variables) {
				queryClient.invalidateQueries({
					queryKey: QUERY_KEYS.outline(variables.projectId),
				});
			}
		},
	});

	const updateMutation = useMutation({
		mutationFn: updateChapterAction,
		onSuccess: () => {
			toast.success("Chapter updated");
		},
		onError: () => toast.error("Failed to update chapter"),
		onSettled: (_data, _error, variables) => {
			if (variables) {
				queryClient.invalidateQueries({
					queryKey: QUERY_KEYS.outline(variables.projectId),
				});
			}
		},
	});

	const deleteMutation = useMutation({
		mutationFn: deleteChapterAction,
		onSuccess: () => {
			toast.success("Chapter deleted");
		},
		onError: () => toast.error("Failed to delete chapter"),
		onSettled: (_data, _error, variables) => {
			if (variables) {
				queryClient.invalidateQueries({
					queryKey: QUERY_KEYS.outline(variables.projectId),
				});
			}
		},
	});

	const createMutation = useMutation({
		mutationFn: createChapterAction,
		onSuccess: () => {
			toast.success("Chapter added");
		},
		onError: () => toast.error("Failed to add chapter"),
		onSettled: (_data, _error, variables) => {
			if (variables) {
				queryClient.invalidateQueries({
					queryKey: QUERY_KEYS.outline(variables.projectId),
				});
			}
		},
	});

	// Local state for optimistic reordering
	const [chapters, setChapters] = useState<
		SerializedOutline["chapters"] | null
	>(null);

	useEffect(() => {
		if (outlineResult?.success && outlineResult.data?.chapters) {
			setChapters(outlineResult.data.chapters);
		}
	}, [outlineResult]);

	const handleReorder = useCallback(
		(newItems: typeof chapters) => {
			if (!newItems || !projectId) return;

			// Optimistic update
			setChapters(newItems);

			// Call API
			const updates = newItems.map((item, index) => ({
				id: item.id,
				sequence: index + 1,
			}));

			reorderMutation.mutate({
				projectId,
				updates,
			});
		},
		[projectId, reorderMutation],
	);

	const handleAddChapter = () => {
		if (!projectId) return;
		createMutation.mutate({
			projectId,
			title: `Chapter ${chapters ? chapters.length + 1 : 1}`,
		});
	};

	return {
		outlineResult,
		isLoading,
		chapters: chapters || (outlineResult?.data?.chapters ?? []),
		handleReorder,
		handleAddChapter,
		updateMutation,
		deleteMutation,
		createMutation,
		reorderMutation,
	};
}
