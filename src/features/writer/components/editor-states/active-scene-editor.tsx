"use client";

import { useCallback, useRef } from "react";
import {
	Editor,
	type EditorHandle,
} from "@/components/organisms/editor/text-editor";
import { useAppearance } from "@/components/providers/appearance-provider";
import { useWriterContent } from "@/features/writer/components/writer-content-context";
import { useWriterControl } from "@/features/writer/components/writer-control-context";
import { useWriterLayoutContext } from "@/features/writer/components/writer-layout-context";
import { useEditorHistory } from "@/hooks/use-editor-history";
import { useProjectEntities } from "@/hooks/use-project-entities";

interface ActiveSceneEditorProps {
	projectId: string;
	activeSceneId: string;
	isReadOnly: boolean;
	sceneContent: string;
	onContentChange: (content: string) => void;
	historyProps: {
		historyStack: any;
		isTimeTraveling: boolean;
		previewContent: string | null;
		sliderValue: number[];
		pushHistory: (content: string) => void;
		toggleTimeTravel: () => void;
		handleTimeTravel: (val: number[]) => void;
		cancelTimeTravel: () => void;
		restoreVersion: () => void;
	};
}

export function ActiveSceneEditor({
	projectId,
	activeSceneId,
	isReadOnly,
	sceneContent,
	onContentChange,
	historyProps,
}: ActiveSceneEditorProps) {
	const { registerEditorActions } = useWriterControl();
	const { isTypewriterMode } = useWriterLayoutContext();
	const { editorFont, editorFontSize, editorLineHeight } = useAppearance();
	const { data: entities } = useProjectEntities(projectId);
	const { previewContent, isTimeTraveling } = historyProps;

	// Use a standard ref to access the editor instance for non-effect usage
	const editorRef = useRef<EditorHandle | null>(null);

	// Use a callback ref to handle editor registration/unregistration reliably.
	const setEditorRef = useCallback(
		(node: EditorHandle | null) => {
			if (editorRef.current === node) return;

			// Update the mutable ref for other consumers
			editorRef.current = node;

			if (node) {
				registerEditorActions({
					undo: () => node.undo(),
					redo: () => node.redo(),
					insertText: (text: string) => node.insertText(text),
					getSelection: () => node.getSelection() ?? null,
				});
			}
		},
		[registerEditorActions],
	);

	const onEditorContentChange = useCallback(
		(content: string, _debounce: boolean) => {
			onContentChange(content);
			historyProps.pushHistory(content);
		},
		[onContentChange, historyProps.pushHistory],
	);

	return (
		<div
			className="writer-instance w-full min-h-full py-8 px-4 pb-32 transition-all duration-300"
			style={{
				fontFamily:
					editorFont === "mono"
						? "var(--font-mono)"
						: editorFont === "serif"
							? "serif"
							: "var(--font-sans)",
				fontSize: `${editorFontSize}px`,
				lineHeight: editorLineHeight,
			}}
		>
			<Editor
				ref={setEditorRef}
				key={activeSceneId} // Reset editor when scene changes
				content={previewContent ?? sceneContent}
				onSaveContent={onEditorContentChange}
				status="idle"
				isCurrentVersion={true}
				currentVersionIndex={0}
				suggestions={[]}
				readOnly={isReadOnly || isTimeTraveling}
				typewriterMode={isTypewriterMode && !isTimeTraveling}
				mentionables={entities || []}
			/>
		</div>
	);
}
