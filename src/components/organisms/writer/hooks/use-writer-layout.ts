import { useRef, useState } from "react";
import type { PanelImperativeHandle } from "react-resizable-panels";
import { useMediaQuery } from "usehooks-ts";

export type ViewMode = "standard" | "zen";

export interface WriterLayoutState {
	isSidebarOpen: boolean;
	viewMode: ViewMode;
	isTypewriterMode: boolean;
	isDirectorMode: boolean;
	isMobile: boolean;
	sidebarRef: React.RefObject<PanelImperativeHandle>;
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

	const sidebarRef = useRef<PanelImperativeHandle>(null!);

	const toggleSidebar = () => {
		setIsSidebarOpen((prev) => {
			const newOpen = !prev;
			const panel = sidebarRef.current;
			if (panel) {
				if (newOpen) {
					panel.expand();
				} else {
					panel.collapse();
				}
			}
			return newOpen;
		});
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
