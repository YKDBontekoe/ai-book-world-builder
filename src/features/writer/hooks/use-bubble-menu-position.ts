import type { EditorView } from "prosemirror-view";
import { useEffect, useState } from "react";

interface Position {
	top: number;
	left: number;
}

export function useBubbleMenuPosition(editorView: EditorView | null) {
	const [position, setPosition] = useState<Position | null>(null);
	const [isOpen, setIsOpen] = useState(false);

	useEffect(() => {
		if (!editorView) return;

		const updateMenu = () => {
			const { state } = editorView;
			const { from, to, empty } = state.selection;

			if (empty) {
				setPosition(null);
				setIsOpen(false);
				return;
			}

			const start = editorView.coordsAtPos(from);
			const _end = editorView.coordsAtPos(to);
			const box = editorView.dom.getBoundingClientRect();

			setPosition({
				top: start.top - box.top - 40, // Position above selection
				left: start.left - box.left,
			});
			setIsOpen(true);
		};

		// Listen for multiple events that could change selection or position
		editorView.dom.addEventListener("mouseup", updateMenu);
		editorView.dom.addEventListener("keyup", updateMenu);
		editorView.dom.addEventListener("scroll", updateMenu);
		window.addEventListener("resize", updateMenu);

		// Initial check
		updateMenu();

		return () => {
			editorView.dom.removeEventListener("mouseup", updateMenu);
			editorView.dom.removeEventListener("keyup", updateMenu);
			editorView.dom.removeEventListener("scroll", updateMenu);
			window.removeEventListener("resize", updateMenu);
		};
	}, [editorView]);

	return { position, isOpen, setPosition, setIsOpen };
}
