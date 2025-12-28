import { useRef, useState } from "react";
import type { ImperativePanelHandle } from "react-resizable-panels";
import { useMediaQuery } from "usehooks-ts";

export type ViewMode = "standard" | "zen";

export interface WriterLayoutState {
	isSidebarOpen: boolean;
	viewMode: ViewMode;
	isTypewriterMode: boolean;
	isDirectorMode: boolean;
	isMobile: boolean;
	sidebarRef: React.RefObject<ImperativePanelHandle>;
	actions: {
		toggleSidebar: () => void;
		toggleZenMode: () => void;
		toggleTypewriterMode: () => void;
		toggleDirectorMode: () => void;
		setSidebarOpen: (isOpen: boolean) => void;
	};
}

export function useWriterLayout(): WriterLayoutState {
	const isMobile = useMediaQuery("(max-width: 768px)");
	const [isSidebarOpen, setIsSidebarOpen] = useState(true);
	const [viewMode, setViewMode] = useState<ViewMode>("standard");
	const [isTypewriterMode, setIsTypewriterMode] = useState(false);
	const [isDirectorMode, setIsDirectorMode] = useState(false);

	const sidebarRef = useRef<ImperativePanelHandle>(null);

	const toggleSidebar = () => {
		const panel = (sidebarRef as React.RefObject<ImperativePanelHandle>).current;
		if (panel) {
			if (isSidebarOpen) {
				panel.collapse();
			} else {
				panel.expand();
			}
		}
	};

	const toggleZenMode = () => {
		setViewMode((prev) => (prev === "standard" ? "zen" : "standard"));
	};

	const toggleTypewriterMode = () => {
		setIsTypewriterMode((prev) => !prev);
	};

	const toggleDirectorMode = () => {
		setIsDirectorMode((prev) => !prev);
	};

	return {
		isSidebarOpen,
		viewMode,
		isTypewriterMode,
		isDirectorMode,
		isMobile,
		sidebarRef,
		actions: {
			toggleSidebar,
			toggleZenMode,
			toggleTypewriterMode,
			toggleDirectorMode,
			setSidebarOpen: setIsSidebarOpen,
		},
	};
}
