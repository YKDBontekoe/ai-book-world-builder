"use client";

import { createContext, useContext } from "react";

interface WriterLayoutContextType {
	isSidebarOpen: boolean;
	toggleSidebar: () => void;
}

export const WriterLayoutContext = createContext<WriterLayoutContextType | null>(
	null,
);

export function useWriterLayoutContext() {
	const context = useContext(WriterLayoutContext);
	if (!context) {
		throw new Error(
			"useWriterLayoutContext must be used within a WriterLayoutProvider",
		);
	}
	return context;
}
