"use client";

import { useQuery } from "@tanstack/react-query";
import { getEntitiesForProject } from "@/app/actions/entities";

export function useProjectEntities(projectId: string) {
	return useQuery({
		queryKey: ["entities", projectId],
		queryFn: async () => {
			const result = await getEntitiesForProject({ projectId });
			if (!result.success) {
				throw new Error(result.error);
			}
			return result.data;
		},
		staleTime: 1000 * 60 * 5, // 5 minutes
	});
}
