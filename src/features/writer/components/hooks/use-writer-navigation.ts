import { useCallback } from "react";
import { toast } from "sonner";
import { useWriterContext } from "@/features/writer/components/writer-context";
import type { ChapterWithScenes } from "@/lib/types";

export function useWriterNavigation(): {
	nextScene: () => void;
	prevScene: () => void;
} {
	const { structure, activeSceneId, setActiveSceneId } = useWriterContext();

	const flattenScenes = useCallback((chapters: ChapterWithScenes[]) => {
		return chapters.flatMap((chapter) =>
			chapter.scenes.map((scene) => ({
				id: scene.id,
				chapterId: chapter.id,
				title: scene.title,
			})),
		);
	}, []);

	const navigateScene = useCallback(
		(direction: "next" | "prev") => {
			if (!structure || !activeSceneId) return;

			const scenes = flattenScenes(structure);
			const currentIndex = scenes.findIndex((s) => s.id === activeSceneId);

			if (currentIndex === -1) return;

			let newIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;

			// Clamp
			if (newIndex < 0) newIndex = 0;
			if (newIndex >= scenes.length) newIndex = scenes.length - 1;

			if (newIndex !== currentIndex) {
				const target = scenes[newIndex];
				setActiveSceneId(target.id);
				toast.info(`Navigated to: ${target.title}`, {
					duration: 1500,
					icon: direction === "next" ? "⬇️" : "⬆️",
				});
			}
		},
		[structure, activeSceneId, flattenScenes, setActiveSceneId],
	);

	return {
		nextScene: () => navigateScene("next"),
		prevScene: () => navigateScene("prev"),
	};
}
