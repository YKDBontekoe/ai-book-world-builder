"use client";

import { createContext, useContext } from "react";
import type { useSceneContent } from "@/features/writer/hooks/use-scene-content";

type UseSceneContentReturnType = ReturnType<typeof useSceneContent>;

type WriterContentContextType = {
	sceneContent: string;
	isSaving: boolean;
	lastSaved: Date | null;
	handleContentChange: (newContent: string) => void;
	setContentDirectly: (content: string) => void;
	isSnapshotting: boolean;
	handleSnapshot: () => Promise<void>;
};

export const WriterContentContext =
	createContext<WriterContentContextType | null>(null);

export function useWriterContent() {
	const context = useContext(WriterContentContext);
	if (!context) {
		throw new Error(
			"useWriterContent must be used within a WriterProvider (and WriterContentContext.Provider)",
		);
	}
	return context;
}
