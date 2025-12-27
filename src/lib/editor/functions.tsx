"use client";

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
