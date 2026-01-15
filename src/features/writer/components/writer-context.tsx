"use client";

import type React from "react";
import { createContext, useContext, useMemo } from "react";
import { WriterContentContext } from "@/features/writer/components/writer-content-context";
import { useWriterState } from "@/features/writer/hooks/use-writer-state";
import type { Project } from "@/lib/db/schema";
import type { ChapterWithScenes } from "@/lib/types";

// Stable Writer Context (Structure, Navigation, Project Config)
type WriterContextType = {
	structure: ChapterWithScenes[] | null;
	structureText: string;
	loading: boolean;
	activeSceneId: string | null;
	setActiveSceneId: (id: string | null) => void;
	activeScene: (ChapterWithScenes["scenes"][number] & { content?: string }) | undefined; // Using inferred type from useWriterState would be better, but we are decoupling
	fetchStructure: () => Promise<void>;
	project: Project;
	isReadOnly: boolean;
	activeChapterId?: string;
};

export const WriterContext = createContext<WriterContextType | null>(null);

interface WriterProviderProps {
	children: React.ReactNode;
	project: Project;
	initialStructure?: ChapterWithScenes[];
	initialStructureText?: string;
	isReadOnly?: boolean;
}

export function WriterProvider({
	children,
	project,
	initialStructure,
	initialStructureText,
	isReadOnly = false,
}: WriterProviderProps) {
	const writerState = useWriterState({
		projectId: project.id,
		initialStructure,
		initialStructureText,
		lastViewedSceneId: project.lastViewedSceneId,
	});

	const {
		structure,
		structureText,
		loading,
		activeSceneId,
		setActiveSceneId,
		sceneContent,
		activeScene,
		isSaving,
		lastSaved,
		isSnapshotting,
		handleContentChange,
		setContentDirectly,
		handleSnapshot,
		fetchStructure,
	} = writerState;

	// Derive activeChapterId
	const activeChapterId = useMemo(() => {
		if (!activeSceneId || !structure) return undefined;
		for (const chapter of structure) {
			if (chapter.scenes.some((s) => s.id === activeSceneId)) {
				return chapter.id;
			}
		}
		return undefined;
	}, [activeSceneId, structure]);

	// Stable Structure Context Value
	const structureValue = useMemo(
		() => ({
			structure,
			structureText,
			loading,
			activeSceneId,
			setActiveSceneId,
			activeScene,
			fetchStructure,
			project,
			isReadOnly,
			activeChapterId,
		}),
		[
			structure,
			structureText,
			loading,
			activeSceneId,
			setActiveSceneId,
			activeScene,
			fetchStructure,
			project,
			isReadOnly,
			activeChapterId,
		],
	);

	// Volatile Content Context Value
	const contentValue = useMemo(
		() => ({
			sceneContent,
			isSaving,
			lastSaved,
			isSnapshotting,
			handleContentChange,
			setContentDirectly,
			handleSnapshot,
		}),
		[
			sceneContent,
			isSaving,
			lastSaved,
			isSnapshotting,
			handleContentChange,
			setContentDirectly,
			handleSnapshot,
		],
	);

	return (
		<WriterContext.Provider value={structureValue}>
			<WriterContentContext.Provider value={contentValue}>
				{children}
			</WriterContentContext.Provider>
		</WriterContext.Provider>
	);
}

export function useWriterContext() {
	const context = useContext(WriterContext);
	if (!context) {
		throw new Error("useWriterContext must be used within a WriterProvider");
	}
	return context;
}
