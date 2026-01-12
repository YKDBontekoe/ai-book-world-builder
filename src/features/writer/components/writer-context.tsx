"use client";

import type React from "react";
import { createContext, useContext, useMemo } from "react";
import { useWriterState } from "@/features/writer/hooks/use-writer-state";
import type { Project } from "@/lib/db/schema";
import type { ChapterWithScenes } from "@/lib/types";

type UseWriterStateReturnType = ReturnType<typeof useWriterState>;

type WriterContextType = UseWriterStateReturnType & {
	project: Project;
	isReadOnly: boolean;
	activeChapterId?: string; // Derived from activeScene
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

	const value = useMemo(
		() => ({
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
			handleSnapshot,
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
			sceneContent,
			activeScene,
			isSaving,
			lastSaved,
			isSnapshotting,
			handleContentChange,
			handleSnapshot,
			fetchStructure,
			project,
			isReadOnly,
			activeChapterId,
		],
	);

	return (
		<WriterContext.Provider value={value}>{children}</WriterContext.Provider>
	);
}

export function useWriterContext() {
	const context = useContext(WriterContext);
	if (!context) {
		throw new Error("useWriterContext must be used within a WriterProvider");
	}
	return context;
}
