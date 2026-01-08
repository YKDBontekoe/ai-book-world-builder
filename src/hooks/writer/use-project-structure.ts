import { useCallback, useState } from "react";
import { toast } from "sonner";
import { getProjectStructure } from "@/app/actions/writer";
import type { ChapterWithScenes } from "@/lib/types";

interface UseProjectStructureProps {
	projectId: string;
	initialStructure?: ChapterWithScenes[];
	initialStructureText?: string;
}

export function useProjectStructure({
	projectId,
	initialStructure,
	initialStructureText,
}: UseProjectStructureProps) {
	const [structure, setStructure] = useState<ChapterWithScenes[] | null>(
		initialStructure ?? null,
	);
	const [structureText, setStructureText] = useState(
		initialStructureText ?? "",
	);
	const [isLoading, setIsLoading] = useState(!initialStructure);

	const fetchStructure = useCallback(async () => {
		setIsLoading(true);
		try {
			const result = await getProjectStructure({ projectId });
			if (result.success && result.data.structure) {
				const { structure: newStructure, structureText: newText } = result.data;
				setStructure(newStructure as unknown as ChapterWithScenes[]);
				if (newText) {
					setStructureText(newText);
				}
			} else {
				toast.error("Failed to load project structure");
			}
		} catch (error) {
			console.error("Failed to fetch structure:", error);
			toast.error("An error occurred loading the project");
		} finally {
			setIsLoading(false);
		}
	}, [projectId]);

	// Callback to sync content updates from editor back to structure state
	const updateSceneInStructure = useCallback(
		(sceneId: string, content: string) => {
			setStructure((prev) =>
				prev
					? prev.map((c) => ({
							...c,
							scenes: c.scenes.map((s) =>
								s.id === sceneId ? { ...s, content } : s,
							),
						}))
					: null,
			);
		},
		[],
	);

	return {
		structure,
		setStructure,
		structureText,
		setStructureText,
		isLoading,
		fetchStructure,
		updateSceneInStructure,
	};
}
