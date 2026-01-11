import { useCallback, useState } from "react";
import { toast } from "sonner";
import { getProjectStructure } from "@/features/writer/actions";
import type { ChapterWithScenes } from "@/lib/types";

interface UseProjectStructureProps {
	projectId: string;
	initialStructure?: ChapterWithScenes[];
	initialStructureText?: string;
}

interface UseProjectStructureReturn {
	structure: ChapterWithScenes[] | null;
	setStructure: React.Dispatch<
		React.SetStateAction<ChapterWithScenes[] | null>
	>;
	structureText: string;
	setStructureText: React.Dispatch<React.SetStateAction<string>>;
	isLoading: boolean;
	fetchStructure: () => Promise<void>;
	updateSceneInStructure: (sceneId: string, content: string) => void;
}

/**
 * Manages the project structure (chapters and scenes) state.
 * Handles fetching, updating, and syncing structure data.
 *
 * @param props - Configuration properties
 * @param props.projectId - The ID of the project to manage
 * @param props.initialStructure - Optional initial structure data
 * @param props.initialStructureText - Optional initial text representation
 * @returns Object containing structure state and management functions
 */
export function useProjectStructure({
	projectId,
	initialStructure,
	initialStructureText,
}: UseProjectStructureProps): UseProjectStructureReturn {
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
				setStructure(newStructure);
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
