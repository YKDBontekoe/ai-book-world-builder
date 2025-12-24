"use client";

import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useMemo,
	useState,
} from "react";

interface EditorActions {
	undo: () => void;
	redo: () => void;
}

interface WriterControlContextType {
	editorActions: EditorActions | null;
	registerEditorActions: (actions: EditorActions) => void;

	isChatOpen: boolean;
	setChatOpen: (open: boolean) => void;
	toggleChat: () => void;

	isSpotlightOpen: boolean;
	setSpotlightOpen: (open: boolean) => void;
	toggleSpotlight: () => void;
}

const WriterControlContext = createContext<
	WriterControlContextType | undefined
>(undefined);

export function useWriterControl() {
	const context = useContext(WriterControlContext);
	if (!context) {
		throw new Error(
			"useWriterControl must be used within a WriterControlProvider",
		);
	}
	return context;
}

interface WriterControlProviderProps {
	children: ReactNode;
}

export function WriterControlProvider({
	children,
}: WriterControlProviderProps) {
	const [editorActions, setEditorActions] = useState<EditorActions | null>(
		null,
	);
	const [isChatOpen, setChatOpen] = useState(false);
	const [isSpotlightOpen, setSpotlightOpen] = useState(false);

	const registerEditorActions = useCallback((actions: EditorActions) => {
		setEditorActions(actions);
	}, []);

	const toggleChat = useCallback(() => setChatOpen((prev) => !prev), []);
	const toggleSpotlight = useCallback(
		() => setSpotlightOpen((prev) => !prev),
		[],
	);

	const value = useMemo(
		() => ({
			editorActions,
			registerEditorActions,
			isChatOpen,
			setChatOpen,
			toggleChat,
			isSpotlightOpen,
			setSpotlightOpen,
			toggleSpotlight,
		}),
		[
			editorActions,
			registerEditorActions,
			isChatOpen,
			isSpotlightOpen,
			toggleChat,
			toggleSpotlight,
		],
	);

	return (
		<WriterControlContext.Provider value={value}>
			{children}
		</WriterControlContext.Provider>
	);
}
