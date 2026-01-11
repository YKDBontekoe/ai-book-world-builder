"use client";

import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useMemo,
	useState,
} from "react";
import type { GenerationStatus } from "@/lib/db/schema";

export type CanvasPane =
	| "outline"
	| "graph"
	| "timeline"
	| "scenes"
	| "draft"
	| "diagnostics"
	| "bible"
	| "changes"
	| "arc"
	| "context"
	| "map";

export type ChatAction = {
	type: "send_message";
	payload: string;
} | null;

type BookCanvasState = {
	isOpen: boolean;
	activePane: CanvasPane;
	overallStatus: GenerationStatus;
	projectId: string | null;
	generationId: string | null;
	chatAction: ChatAction;
	activeSceneId: string | null;
	isReadOnly: boolean;
};

// Split state into stable layout/config and volatile selection
type BookCanvasLayoutState = {
	isOpen: boolean;
	activePane: CanvasPane;
	overallStatus: GenerationStatus;
	projectId: string | null;
	generationId: string | null;
	isReadOnly: boolean;
};

type BookCanvasSelectionState = {
	chatAction: ChatAction;
	activeSceneId: string | null;
};

type BookCanvasActions = {
	setIsOpen: (open: boolean) => void;
	togglePanel: () => void;
	setActivePane: (pane: CanvasPane) => void;
	setOverallStatus: (status: GenerationStatus) => void;
	setProjectId: (id: string | null) => void;
	setGenerationId: (id: string | null) => void;
	triggerChatAction: (action: ChatAction) => void;
	setActiveSceneId: (id: string | null) => void;
	setIsReadOnly: (readOnly: boolean) => void;
};

// Kept for backward compatibility
export type BookCanvasContextType = BookCanvasState & BookCanvasActions;

export const BookCanvasLayoutContext =
	createContext<BookCanvasLayoutState | null>(null);
export const BookCanvasSelectionContext =
	createContext<BookCanvasSelectionState | null>(null);
export const BookCanvasActionsContext = createContext<BookCanvasActions | null>(
	null,
);

// Legacy hook that subscribes to EVERYTHING (heavy!)
export function useBookCanvas() {
	const layout = useContext(BookCanvasLayoutContext);
	const selection = useContext(BookCanvasSelectionContext);
	const actions = useContext(BookCanvasActionsContext);

	if (!layout || !selection || !actions) {
		throw new Error("useBookCanvas must be used within a BookCanvasProvider");
	}
	return { ...layout, ...selection, ...actions };
}

// Optimized hooks
export function useBookCanvasLayout() {
	const context = useContext(BookCanvasLayoutContext);
	if (!context) {
		throw new Error(
			"useBookCanvasLayout must be used within a BookCanvasProvider",
		);
	}
	return context;
}

export function useBookCanvasSelection() {
	const context = useContext(BookCanvasSelectionContext);
	if (!context) {
		throw new Error(
			"useBookCanvasSelection must be used within a BookCanvasProvider",
		);
	}
	return context;
}

// Legacy value hook
export function useBookCanvasValue() {
	const layout = useContext(BookCanvasLayoutContext);
	const selection = useContext(BookCanvasSelectionContext);
	if (!layout || !selection) {
		throw new Error(
			"useBookCanvasValue must be used within a BookCanvasProvider",
		);
	}
	return { ...layout, ...selection };
}

export function useBookCanvasActions() {
	const context = useContext(BookCanvasActionsContext);
	if (!context) {
		throw new Error(
			"useBookCanvasActions must be used within a BookCanvasProvider",
		);
	}
	return context;
}

export function BookCanvasProvider({ children }: { children: ReactNode }) {
	const [isOpen, setIsOpen] = useState(true);
	const [activePane, setActivePane] = useState<CanvasPane>("outline");
	const [overallStatus, setOverallStatus] = useState<GenerationStatus>("idle");
	const [projectId, setProjectId] = useState<string | null>(null);
	const [generationId, setGenerationId] = useState<string | null>(null);
	const [chatAction, triggerChatAction] = useState<ChatAction>(null);
	const [activeSceneId, setActiveSceneId] = useState<string | null>(null);
	const [isReadOnly, setIsReadOnly] = useState(false);

	const togglePanel = useCallback(() => {
		setIsOpen((prev) => !prev);
	}, []);

	const actions = useMemo(
		() => ({
			setIsOpen,
			togglePanel,
			setActivePane,
			setOverallStatus,
			setProjectId,
			setGenerationId,
			triggerChatAction,
			setActiveSceneId,
			setIsReadOnly,
		}),
		[togglePanel],
	);

	const layoutState = useMemo(
		() => ({
			isOpen,
			activePane,
			overallStatus,
			projectId,
			generationId,
			isReadOnly,
		}),
		[isOpen, activePane, overallStatus, projectId, generationId, isReadOnly],
	);

	const selectionState = useMemo(
		() => ({
			chatAction,
			activeSceneId,
		}),
		[chatAction, activeSceneId],
	);

	return (
		<BookCanvasLayoutContext.Provider value={layoutState}>
			<BookCanvasSelectionContext.Provider value={selectionState}>
				<BookCanvasActionsContext.Provider value={actions}>
					{children}
				</BookCanvasActionsContext.Provider>
			</BookCanvasSelectionContext.Provider>
		</BookCanvasLayoutContext.Provider>
	);
}
