"use client";

import { createContext, useContext } from "react";

export type ViewMode = "standard" | "zen";

interface WriterLayoutContextType {
	isSidebarOpen: boolean;
	toggleSidebar: () => void;
	viewMode: ViewMode;
	toggleZenMode: () => void;
	isTypewriterMode: boolean;
	toggleTypewriterMode: () => void;
	isDirectorMode: boolean;
	toggleDirectorMode: () => void;
}

export const WriterLayoutContext =
	createContext<WriterLayoutContextType | null>(null);

export function useWriterLayoutContext() {
	const context = useContext(WriterLayoutContext);
	if (!context) {
		throw new Error(
			"useWriterLayoutContext must be used within a WriterLayoutProvider",
		);
	}
	return context;
}
