import { useRef, useState } from "react";
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

export function useWriterLayout(): WriterLayoutState {
	const isMobile = useMediaQuery("(max-width: 768px)");
	const [isSidebarOpen, setIsSidebarOpen] = useState(true);
	const [isCanvasOpen, setIsCanvasOpen] = useState(false); // Default closed for Studio feel
	const [viewMode, setViewMode] = useState<ViewMode>("standard");
	const [isTypewriterMode, setIsTypewriterMode] = useState(false);
	const [isDirectorMode, setIsDirectorMode] = useState(false);

	const sidebarRef = useRef<PanelImperativeHandle>(null);
	const canvasRef = useRef<PanelImperativeHandle>(null);

	const toggleSidebar = () => {
		const panel = sidebarRef.current;
		if (panel) {
			if (isSidebarOpen) {
				panel.collapse();
			} else {
				panel.expand();
			}
		}
	};

	const toggleCanvas = () => {
		const panel = canvasRef.current;
		if (panel) {
			if (isCanvasOpen) {
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
		isCanvasOpen,
		viewMode,
		isTypewriterMode,
		isDirectorMode,
		isMobile,
		sidebarRef,
		canvasRef,
		actions: {
			toggleSidebar,
			toggleCanvas,
			toggleZenMode,
			toggleTypewriterMode,
			toggleDirectorMode,
			setSidebarOpen: setIsSidebarOpen,
			setCanvasOpen: setIsCanvasOpen,
		},
	};
}
