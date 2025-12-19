"use client";

import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useMemo,
	useState,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { GenerationStatus } from "@/lib/db/schema";

export type CanvasPane =
	| "outline"
	| "graph"
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
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const [isOpen, setIsOpen] = useState(true);
	// activePane derived from URL
	const activePane = (searchParams.get("canvasPane") as CanvasPane) || "outline";
	const [overallStatus, setOverallStatus] = useState<GenerationStatus>("idle");
	const [projectId, setProjectId] = useState<string | null>(null);
	const [generationId, setGenerationId] = useState<string | null>(null);
	const [chatAction, triggerChatAction] = useState<ChatAction>(null);
	// activeSceneId derived from URL
	const activeSceneId = searchParams.get("sceneId");

	const togglePanel = useCallback(() => {
		setIsOpen((prev) => !prev);
	}, []);

	const setActivePane = useCallback(
		(pane: CanvasPane) => {
			const params = new URLSearchParams(searchParams.toString());
			params.set("canvasPane", pane);
			// Use replace to avoid filling history with pane switches
			router.replace(`${pathname}?${params.toString()}`);
		},
		[searchParams, pathname, router],
	);

	const setActiveSceneId = useCallback(
		(id: string | null) => {
			const params = new URLSearchParams(searchParams.toString());
			if (id) {
				params.set("sceneId", id);
			} else {
				params.delete("sceneId");
			}
			// Use push for navigation-like changes (selecting a scene)
			router.push(`${pathname}?${params.toString()}`);
		},
		[searchParams, pathname, router],
	);

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
		}),
		[
			togglePanel,
			setActivePane,
			setActiveSceneId,
		],
	);

	const state = useMemo(
		() => ({
			isOpen,
			activePane,
			overallStatus,
			projectId,
			generationId,
			chatAction,
			activeSceneId,
		}),
		[
			isOpen,
			activePane,
			overallStatus,
			projectId,
			generationId,
			chatAction,
			activeSceneId,
		],
	);

	return (
		<BookCanvasValueContext.Provider value={state}>
			<BookCanvasActionsContext.Provider value={actions}>
				{children}
			</BookCanvasActionsContext.Provider>
		</BookCanvasValueContext.Provider>
	);
}
