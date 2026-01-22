"use client";

import {
	type UseMutationResult,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
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
import type { Result } from "@/lib/result";

export type UseOutlineReturn = {
	outlineResult: Awaited<ReturnType<typeof getOutlineData>> | null | undefined;
	isLoading: boolean;
	chapters: SerializedOutline["chapters"];
	handleReorder: (newItems: SerializedOutline["chapters"] | null) => void;
	handleAddChapter: () => void;
	updateMutation: UseMutationResult<
		Result<{ success: boolean }>,
		Error,
		{
			projectId: string;
			chapterId: string;
			data: { title: string; notes?: string };
		},
		unknown
	>;
	deleteMutation: UseMutationResult<
		Result<{ success: boolean }>,
		Error,
		{ projectId: string; chapterId: string },
		unknown
	>;
	createMutation: UseMutationResult<
		Result<any>,
		Error,
		{ projectId: string; title: string; notes?: string },
		unknown
	>;
	reorderMutation: UseMutationResult<
		Result<{ success: boolean }>,
		Error,
		{ projectId: string; updates: { id: string; sequence: number }[] },
		{ previousData: Awaited<ReturnType<typeof getOutlineData>> | undefined }
	>;
};

export function useOutline(projectId: string | null): UseOutlineReturn {
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
		onMutate: async (variables) => {
			await queryClient.cancelQueries({
				queryKey: QUERY_KEYS.outline(variables.projectId),
			});

			const previousData = queryClient.getQueryData<
				Awaited<ReturnType<typeof getOutlineData>>
			>(QUERY_KEYS.outline(variables.projectId));

			if (previousData?.success && previousData.data) {
				const newChapters = [...previousData.data.chapters];
				// Apply updates vaguely or just trust the local state?
				// The local state passed to `handleReorder` is authoritative for the UI.
				// But here we only have `updates` which is just IDs and sequences.
				// We need to re-sort `previousData` based on `variables.updates`.
				// Actually, `handleReorder` already updated the local `chapters` state,
				// so the UI is optimistic via state.
				// But we should also update the query cache to be consistent.

				const updateMap = new Map(
					variables.updates.map((u) => [u.id, u.sequence]),
				);
				const sortedChapters = newChapters
					.map((c) => ({
						...c,
						sequence: updateMap.get(c.id) ?? c.sequence,
					}))
					.sort((a, b) => a.sequence - b.sequence);

				queryClient.setQueryData(QUERY_KEYS.outline(variables.projectId), {
					...previousData,
					data: {
						...previousData.data,
						chapters: sortedChapters,
					},
				});
			}

			return { previousData };
		},
		onError: (_err, variables, context) => {
			toast.error("Failed to reorder chapters");
			if (context?.previousData) {
				queryClient.setQueryData(
					QUERY_KEYS.outline(variables.projectId),
					context.previousData,
				);
			}
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
		(newItems: SerializedOutline["chapters"] | null) => {
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
