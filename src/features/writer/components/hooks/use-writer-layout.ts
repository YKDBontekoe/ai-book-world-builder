import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PanelImperativeHandle } from "react-resizable-panels";
import { useMediaQuery } from "usehooks-ts";

export type ViewMode = "standard" | "zen";

export interface WriterLayoutState {
	isSidebarOpen: boolean;
	isCanvasOpen: boolean;
	viewMode: ViewMode;
	isTypewriterMode: boolean;
	isDirectorMode: boolean;
	isMobile: boolean;
	sidebarRef: React.RefObject<PanelImperativeHandle | null>;
	canvasRef: React.RefObject<PanelImperativeHandle | null>;
	actions: {
		toggleSidebar: () => void;
		toggleCanvas: () => void;
		toggleZenMode: () => void;
		toggleTypewriterMode: () => void;
		toggleDirectorMode: () => void;
		setSidebarOpen: (isOpen: boolean) => void;
		setCanvasOpen: (isOpen: boolean) => void;
	};
}

/**
 * Hook to manage the layout state of the Writer View, including sidebar visibility,
 * view modes (Zen, Standard), and specific editor modes (Typewriter, Director).
 *
 * @returns The current layout state and actions to modify it.
 */
export function useWriterLayout(): WriterLayoutState {
	const isMobile = useMediaQuery("(max-width: 768px)");
	const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
	const [isCanvasOpen, setIsCanvasOpen] = useState(true); // Default open with balanced layout
	const [viewMode, setViewMode] = useState<ViewMode>("standard");
	const [isTypewriterMode, setIsTypewriterMode] = useState(false);
	const [isDirectorMode, setIsDirectorMode] = useState(false);

	const sidebarRef = useRef<PanelImperativeHandle>(null);
	const canvasRef = useRef<PanelImperativeHandle>(null);

	const toggleSidebar = useCallback(() => {
		if (isMobile) {
			setIsSidebarOpen((prev) => !prev);
			return;
		}

		const panel = sidebarRef.current;
		if (panel) {
			if (panel.isCollapsed()) {
				panel.expand();
				setIsSidebarOpen(true);
			} else {
				panel.collapse();
				setIsSidebarOpen(false);
			}
		} else {
			setIsSidebarOpen((prev) => !prev);
		}
	}, [isMobile]);

	const toggleCanvas = useCallback(() => {
		if (isMobile) {
			setIsCanvasOpen((prev) => !prev);
			return;
		}

		const panel = canvasRef.current;
		if (panel) {
			if (panel.isCollapsed()) {
				panel.expand();
				setIsCanvasOpen(true);
			} else {
				panel.collapse();
				setIsCanvasOpen(false);
			}
		} else {
			setIsCanvasOpen((prev) => !prev);
		}
	}, [isMobile]);

	const toggleZenMode = useCallback(() => {
		setViewMode((prev) => (prev === "standard" ? "zen" : "standard"));
	}, []);

	const toggleTypewriterMode = useCallback(() => {
		setIsTypewriterMode((prev) => !prev);
	}, []);

	const toggleDirectorMode = useCallback(() => {
		setIsDirectorMode((prev) => !prev);
	}, []);

	useEffect(() => {
		if (isMobile) {
			setIsSidebarOpen(false);
			setIsCanvasOpen(false);
		}
	}, [isMobile]);

	const setSidebarOpen = useCallback((isOpen: boolean) => {
		setIsSidebarOpen(isOpen);
	}, []);

	const setCanvasOpen = useCallback((isOpen: boolean) => {
		setIsCanvasOpen(isOpen);
	}, []);

	const actions = useMemo(
		() => ({
			toggleSidebar,
			toggleCanvas,
			toggleZenMode,
			toggleTypewriterMode,
			toggleDirectorMode,
			setSidebarOpen,
			setCanvasOpen,
		}),
		[
			toggleSidebar,
			toggleCanvas,
			toggleZenMode,
			toggleTypewriterMode,
			toggleDirectorMode,
			setSidebarOpen,
			setCanvasOpen,
		],
	);

	return {
		isSidebarOpen,
		isCanvasOpen,
		viewMode,
		isTypewriterMode,
		isDirectorMode,
		isMobile,
		sidebarRef,
		canvasRef,
		actions,
	};
}
