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
	| "timeline"
	| "scenes"
	| "draft"
	| "diagnostics"
	| "bible"
	| "changes";

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
};

type BookCanvasActions = {
	setIsOpen: (open: boolean) => void;
	togglePanel: () => void;
	setActivePane: (pane: CanvasPane) => void;
	setOverallStatus: (status: GenerationStatus) => void;
	setProjectId: (id: string | null) => void;
	setGenerationId: (id: string | null) => void;
	triggerChatAction: (action: ChatAction) => void;
};

// Kept for backward compatibility
export type BookCanvasContextType = BookCanvasState & BookCanvasActions;

const BookCanvasValueContext = createContext<BookCanvasState | null>(null);
const BookCanvasActionsContext = createContext<BookCanvasActions | null>(null);

export function useBookCanvas() {
	const state = useContext(BookCanvasValueContext);
	const actions = useContext(BookCanvasActionsContext);

	if (!state || !actions) {
		throw new Error("useBookCanvas must be used within a BookCanvasProvider");
	}
	return { ...state, ...actions };
}

export function useBookCanvasValue() {
	const context = useContext(BookCanvasValueContext);
	if (!context) {
		throw new Error(
			"useBookCanvasValue must be used within a BookCanvasProvider",
		);
	}
	return context;
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
		}),
		[togglePanel],
	);

	const state = useMemo(
		() => ({
			isOpen,
			activePane,
			overallStatus,
			projectId,
			generationId,
			chatAction,
		}),
		[isOpen, activePane, overallStatus, projectId, generationId, chatAction],
	);

	return (
		<BookCanvasValueContext.Provider value={state}>
			<BookCanvasActionsContext.Provider value={actions}>
				{children}
			</BookCanvasActionsContext.Provider>
		</BookCanvasValueContext.Provider>
	);
}
