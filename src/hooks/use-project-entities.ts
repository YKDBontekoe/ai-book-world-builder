"use client";

import { useQuery } from "@tanstack/react-query";
import { getEntitiesForProject } from "@/app/actions/entities";

export function useProjectEntities(projectId: string) {
	return useQuery({
		queryKey: ["entities", projectId],
		queryFn: async () => {
			const result = await getEntitiesForProject(projectId);
            if ('error' in result) {
                throw new Error(result.error);
            }
			return result.success;
		},
        staleTime: 1000 * 60 * 5, // 5 minutes
	});
}
