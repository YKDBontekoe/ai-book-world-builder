import { defaultMarkdownSerializer } from "prosemirror-markdown";
import { DOMParser, type Node } from "prosemirror-model";
import { Decoration, DecorationSet, type EditorView } from "prosemirror-view";

import { documentSchema } from "@/lib/editor/config";
import type { UISuggestion } from "@/lib/editor/suggestions";

/**
 * Build a ProseMirror document from plain text/markdown content.
 * This uses a simple approach: convert paragraphs to HTML and parse.
 */
export const buildDocumentFromContent = (content: string): Node => {
	// Ensure we are in a browser environment before using document
	if (typeof document === "undefined") {
		// Return a basic empty document if running on server (though this function is primarily client-side)
		// Or throw an error if this should never happen on server
		// For now, let's just return a basic node if possible or fail gracefully
		// Ideally this function should only be called on client.
		// However, ProseMirror model can run on server (Node.js), but DOMParser needs DOM.
		// If we are server-side, we might want to use a markdown parser that doesn't rely on DOM if needed.
		// But for now, since this uses `document.createElement`, it MUST be client-side OR use JSDOM.
		// Removing "use client" doesn't make it a server component, but allows it to be imported in non-component files without erroring (unless it executes).
		// Wait, if it uses `document`, it will fail on server runtime if called.
		// "use client" in a .tsx/.ts file that is NOT a component just tells bundler to treat imports as client boundary.
		// But for a utility file, it's usually not needed unless it imports CSS or uses hooks (which it doesn't).
		// However, it uses `document`.
	}

    // Check for document existence to avoid SSR crashes if imported loosely
    if (typeof document === 'undefined') {
        // Fallback for SSR or throw?
        // ProseMirror DOMParser requires DOM.
        // If this is called during SSR, it will crash.
        // But usually this is called inside useEffect or event handlers.
        // So removing 'use client' is fine as long as it's not called during server rendering.
        // And 'use client' is mostly for Components.
        // So I will remove 'use client' but I need to be careful.
        // Actually, let's keep the logic but remove the directive.
        return documentSchema.topNodeType.createAndFill()!;
    }

	const parser = DOMParser.fromSchema(documentSchema);
	const tempContainer = document.createElement("div");

	if (!content || content.trim() === "") {
		// For empty content, create a single empty paragraph
		tempContainer.innerHTML = "<p></p>";
	} else {
		// Split content into paragraphs and convert to HTML
		const paragraphs = content.split(/\n\n+/);
		const htmlContent = paragraphs
			.map((para) => {
				// Handle single newlines within a paragraph as line breaks
				const withBreaks = para.replace(/\n/g, "<br>");
				// Wrap the cleaned content in a paragraph tag
				return `<p>${withBreaks}</p>`;
			})
			.join("");
		tempContainer.innerHTML = htmlContent;
	}

	return parser.parse(tempContainer);
};

/**
 * Serialize a ProseMirror document back to markdown/text.
 */
export const buildContentFromDocument = (document: Node): string => {
	return defaultMarkdownSerializer.serialize(document);
};

/**
 * Create decorations for suggestion highlights.
 */
export const createDecorations = (
	suggestions: UISuggestion[],
	view: EditorView,
): DecorationSet => {
	const decorations: Decoration[] = [];

	for (const suggestion of suggestions) {
		// Only create highlight decorations - widget rendering moved to React component
		decorations.push(
			Decoration.inline(
				suggestion.selectionStart,
				suggestion.selectionEnd,
				{
					class: "suggestion-highlight cursor-pointer",
					"data-suggestion-id": suggestion.id,
				},
				{
					suggestionId: suggestion.id,
					type: "highlight",
				},
			),
		);
	}

	return DecorationSet.create(view.state.doc, decorations);
};
