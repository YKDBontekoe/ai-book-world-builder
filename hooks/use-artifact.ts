"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import type { UIArtifact } from "@/components/artifact";
import { GC_TIMES, QUERY_KEYS, STALE_TIMES } from "@/lib/query-options";

export const initialArtifactData: UIArtifact = {
	documentId: "",
	content: "",
	kind: "text",
	title: "",
	status: "idle",
	isVisible: false,
	boundingBox: {
		top: 0,
		left: 0,
		width: 0,
		height: 0,
	},
};

type Selector<T> = (state: UIArtifact) => T;

export function useArtifactSelector<Selected>(selector: Selector<Selected>) {
	const { data: localArtifact } = useQuery({
		queryKey: QUERY_KEYS.artifact(),
		staleTime: STALE_TIMES.LOCAL,
		gcTime: GC_TIMES.LOCAL,
		initialData: initialArtifactData,
	});

	const selectedValue = useMemo(() => {
		if (!localArtifact) {
			return selector(initialArtifactData);
		}
		return selector(localArtifact);
	}, [localArtifact, selector]);

	return selectedValue;
}

export function useArtifact() {
	const queryClient = useQueryClient();

	const { data: localArtifact } = useQuery({
		queryKey: QUERY_KEYS.artifact(),
		staleTime: STALE_TIMES.LOCAL,
		gcTime: GC_TIMES.LOCAL,
		initialData: initialArtifactData,
	});

	const artifact = useMemo(() => {
		if (!localArtifact) {
			return initialArtifactData;
		}
		return localArtifact;
	}, [localArtifact]);

	const setArtifact = useCallback(
		(updaterFn: UIArtifact | ((currentArtifact: UIArtifact) => UIArtifact)) => {
			queryClient.setQueryData(
				QUERY_KEYS.artifact(),
				(currentArtifact: UIArtifact | undefined) => {
					const artifactToUpdate = currentArtifact || initialArtifactData;

					if (typeof updaterFn === "function") {
						return updaterFn(artifactToUpdate);
					}

					return updaterFn;
				},
			);
		},
		[queryClient],
	);

	const { data: localArtifactMetadata } = useQuery({
		queryKey: artifact.documentId
			? QUERY_KEYS.artifactMetadata(artifact.documentId)
			: ["artifact-metadata", "null"], // Use a dummy key if null to allow hook to run, but enabled: false might be better
		enabled: !!artifact.documentId,
		staleTime: STALE_TIMES.LOCAL,
		gcTime: GC_TIMES.LOCAL,
		initialData: null,
	});

	const setMetadata = useCallback(
		(updaterFn: any) => {
			if (!artifact.documentId) return;

			queryClient.setQueryData(
				QUERY_KEYS.artifactMetadata(artifact.documentId),
				(currentMetadata: any) => {
					if (typeof updaterFn === "function") {
						return updaterFn(currentMetadata);
					}
					return updaterFn;
				},
			);
		},
		[queryClient, artifact.documentId],
	);

	return useMemo(
		() => ({
			artifact,
			setArtifact,
			metadata: localArtifactMetadata,
			setMetadata,
		}),
		[artifact, setArtifact, localArtifactMetadata, setMetadata],
	);
}
