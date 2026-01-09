import { useCallback, useMemo, useRef, useState } from "react";
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
	const [isSidebarOpen, setIsSidebarOpen] = useState(true);
	const [isCanvasOpen, setIsCanvasOpen] = useState(false); // Default closed for Studio feel
	const [viewMode, setViewMode] = useState<ViewMode>("standard");
	const [isTypewriterMode, setIsTypewriterMode] = useState(false);
	const [isDirectorMode, setIsDirectorMode] = useState(false);

	const sidebarRef = useRef<PanelImperativeHandle>(null);
	const canvasRef = useRef<PanelImperativeHandle>(null);

	const toggleSidebar = useCallback(() => {
		const panel = sidebarRef.current;
		if (panel) {
			if (isSidebarOpen) {
				panel.collapse();
			} else {
				panel.expand();
			}
		}
	}, [isSidebarOpen]);

	const toggleCanvas = useCallback(() => {
		const panel = canvasRef.current;
		if (panel) {
			if (isCanvasOpen) {
				panel.collapse();
			} else {
				panel.expand();
			}
		}
	}, [isCanvasOpen]);

	const toggleZenMode = useCallback(() => {
		setViewMode((prev) => (prev === "standard" ? "zen" : "standard"));
	}, []);

	const toggleTypewriterMode = useCallback(() => {
		setIsTypewriterMode((prev) => !prev);
	}, []);

	const toggleDirectorMode = useCallback(() => {
		setIsDirectorMode((prev) => !prev);
	}, []);

	const actions = useMemo(
		() => ({
			toggleSidebar,
			toggleCanvas,
			toggleZenMode,
			toggleTypewriterMode,
			toggleDirectorMode,
			setSidebarOpen: setIsSidebarOpen,
			setCanvasOpen: setIsCanvasOpen,
		}),
		[
			toggleSidebar,
			toggleCanvas,
			toggleZenMode,
			toggleTypewriterMode,
			toggleDirectorMode,
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
