import epub from "epub-gen-memory";
import type { FullProjectData } from "@/lib/book-generation";
import type { BookContent, BookExporter } from "./types";

export class EpubExporter implements BookExporter {
	async generate(
		_projectData: FullProjectData,
		content: BookContent,
	): Promise<Buffer> {
		const epubOptions = {
			title: content.title,
			author: "AI Book World Builder",
			css: `
        body { font-family: Georgia, serif; line-height: 1.6; }
        h1, h2, h3, h4, h5, h6 { font-family: Helvetica, Arial, sans-serif; margin-top: 1.5em; margin-bottom: 0.5em; }
        h1 { font-size: 2em; }
        h2 { font-size: 1.5em; }
        h3 { font-size: 1.25em; }
        p { margin: 1em 0; text-indent: 1.5em; }
        p:first-of-type { text-indent: 0; }
        blockquote { margin: 1em 2em; font-style: italic; }
        hr { border: none; border-top: 1px solid #ccc; margin: 2em 0; }
      `,
		};

		const epubSections: Array<{ title: string; content: string }> = [];

		// Add prologue
		if (content.prologue) {
			epubSections.push({
				title: "Prologue",
				content: this.markdownToHtml(content.prologue),
			});
		}

		// Add chapters
		for (const chapter of content.chapters) {
			epubSections.push({
				title: chapter.title,
				content: this.markdownToHtml(chapter.content),
			});
		}

		// Add epilogue
		if (content.epilogue) {
			epubSections.push({
				title: "Epilogue",
				content: this.markdownToHtml(content.epilogue),
			});
		}

		// @ts-expect-error - types for epub-gen-memory might be loose or missing
		const epubBuffer = await epub(epubOptions, epubSections);
		return epubBuffer;
	}

	/**
	 * Simple markdown to HTML converter for EPUB content.
	 * Handles headers, bold, italic, and paragraphs.
	 */
	private markdownToHtml(markdown: string): string {
		if (!markdown) return "";

		let html = markdown
			// Escape HTML entities first
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			// Convert headers (must be at start of line)
			.replace(/^#{6}\s+(.+)$/gm, "<h6>$1</h6>")
			.replace(/^#{5}\s+(.+)$/gm, "<h5>$1</h5>")
			.replace(/^#{4}\s+(.+)$/gm, "<h4>$1</h4>")
			.replace(/^#{3}\s+(.+)$/gm, "<h3>$1</h3>")
			.replace(/^#{2}\s+(.+)$/gm, "<h2>$1</h2>")
			.replace(/^#{1}\s+(.+)$/gm, "<h1>$1</h1>")
			// Convert bold and italic
			.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
			.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
			.replace(/\*(.+?)\*/g, "<em>$1</em>")
			.replace(/___(.+?)___/g, "<strong><em>$1</em></strong>")
			.replace(/__(.+?)__/g, "<strong>$1</strong>")
			.replace(/_(.+?)_/g, "<em>$1</em>")
			// Convert horizontal rules
			.replace(/^[-*_]{3,}$/gm, "<hr/>")
			// Convert block quotes
			.replace(/^>\s+(.+)$/gm, "<blockquote>$1</blockquote>");

		// Split into paragraphs (double newline = new paragraph)
		const paragraphs = html.split(/\n\n+/);
		html = paragraphs
			.map((p) => {
				p = p.trim();
				if (!p) return "";
				// Don't wrap if already a block element
				if (
					p.startsWith("<h") ||
					p.startsWith("<hr") ||
					p.startsWith("<blockquote")
				) {
					return p;
				}
				// Wrap in paragraph, preserving single newlines as line breaks
				return `<p>${p.replace(/\n/g, "<br/>")}</p>`;
			})
			.filter(Boolean)
			.join("\n");

		return html;
	}
}
