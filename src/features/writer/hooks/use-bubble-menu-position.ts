import type { EditorView } from "prosemirror-view";
import { useEffect, useState } from "react";

interface Position {
	top: number;
	left: number;
}

const BUBBLE_MENU_OFFSET_TOP = 40;

interface UseBubbleMenuPositionReturn {
	position: Position | null;
	isOpen: boolean;
	setPosition: React.Dispatch<React.SetStateAction<Position | null>>;
	setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function useBubbleMenuPosition(
	editorView: EditorView | null,
): UseBubbleMenuPositionReturn {
	const [position, setPosition] = useState<Position | null>(null);
	const [isOpen, setIsOpen] = useState(false);

	useEffect(() => {
		if (!editorView) return;

		const updateMenu = () => {
			const { state } = editorView;
			const { from, empty } = state.selection;

			if (empty) {
				setPosition(null);
				setIsOpen(false);
				return;
			}

			const start = editorView.coordsAtPos(from);
			const box = editorView.dom.getBoundingClientRect();

			setPosition({
				top: start.top - box.top - BUBBLE_MENU_OFFSET_TOP, // Position above selection
				left: start.left - box.left,
			});
			setIsOpen(true);
		};

		const getScrollParent = (node: Node | null): HTMLElement | Window => {
			if (!node || !(node instanceof Element)) {
				return window;
			}
			const overflowY = window.getComputedStyle(node).overflowY;
			const isScrollable = overflowY !== "visible" && overflowY !== "hidden";

			if (isScrollable && node.scrollHeight > node.clientHeight) {
				return node as HTMLElement;
			}

			return getScrollParent(node.parentNode);
		};

		const scrollContainer = getScrollParent(editorView.dom);
		const listenerOptions: AddEventListenerOptions = { passive: true };

		// Listen for multiple events that could change selection or position
		editorView.dom.addEventListener("mouseup", updateMenu);
		editorView.dom.addEventListener("keyup", updateMenu);
		scrollContainer.addEventListener("scroll", updateMenu, listenerOptions);
		window.addEventListener("resize", updateMenu, listenerOptions);

		// Initial check
		updateMenu();

		return () => {
			editorView.dom.removeEventListener("mouseup", updateMenu);
			editorView.dom.removeEventListener("keyup", updateMenu);
			scrollContainer.removeEventListener("scroll", updateMenu, listenerOptions);
			window.removeEventListener("resize", updateMenu, listenerOptions);
		};
	}, [editorView]);

	return { position, isOpen, setPosition, setIsOpen };
}
