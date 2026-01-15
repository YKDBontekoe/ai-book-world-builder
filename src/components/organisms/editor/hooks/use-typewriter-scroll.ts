import type { EditorView } from "prosemirror-view";
import type { RefObject } from "react";

interface UseTypewriterScrollProps {
	editorRef: RefObject<EditorView | null>;
	containerRef: RefObject<HTMLDivElement | null>;
	typewriterMode?: boolean;
}

export function useTypewriterScroll({
	editorRef,
	containerRef,
	typewriterMode = false,
}: UseTypewriterScrollProps) {
	const handleTypewriterScroll = (selectionSet: boolean) => {
		if (!typewriterMode || !selectionSet) return;

		setTimeout(() => {
			const view = editorRef.current;
			if (!view) return;
			const coords = view.coordsAtPos(view.state.selection.from);
			const scrollable = containerRef.current?.closest(".overflow-y-auto");
			if (scrollable) {
				const containerRect = scrollable.getBoundingClientRect();
				const relativeTop = coords.top - containerRect.top;
				const target = containerRect.height / 2;
				const diff = relativeTop - target;
				scrollable.scrollBy({ top: diff, behavior: "smooth" });
			}
		}, 0);
	};

	return handleTypewriterScroll;
}
