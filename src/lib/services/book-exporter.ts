import "server-only";
import path from "node:path";
import { put } from "@vercel/blob";
import { asc, eq } from "drizzle-orm";
import epub from "epub-gen-memory";
import PDFDocument from "pdfkit";
import type { FullProjectData } from "@/lib/book-generation";
import { db } from "@/lib/db/queries";
import { bookGenerationAsset, bookGenerationStep } from "@/lib/db/schema";

export type ExportFormat = "pdf" | "epub";

type ExportResult = {
	url: string;
	filename: string;
};

/**
 * Collects all chapter draft content from the project data.
 * First tries to get content from generation steps (new system),
 * then falls back to chapter drafts (old system).
 */
async function collectBookContent(projectData: FullProjectData): Promise<{
	title: string;
	prologue?: string;
	chapters: Array<{ title: string; content: string }>;
	epilogue?: string;
}> {
	const chapters: Array<{ title: string; content: string }> = [];
	let prologue: string | undefined;
	let epilogue: string | undefined;

	// If we have an active generation, fetch content from generation steps
	if (projectData.generation) {
		const generationId = projectData.generation.id;

		// Fetch all completed generation steps
		const steps = await db
			.select()
			.from(bookGenerationStep)
			.where(eq(bookGenerationStep.generationId, generationId))
			.orderBy(asc(bookGenerationStep.sequence));

		// Fetch all generation assets (prologue, epilogue, etc.)
		const assets = await db
			.select()
			.from(bookGenerationAsset)
			.where(eq(bookGenerationAsset.generationId, generationId));

		// Get prologue from assets
		const prologueAsset = assets.find((a: any) => a.assetType === "prologue");
		if (prologueAsset?.content) {
			prologue = prologueAsset.content;
		}

		// Get epilogue from assets
		const epilogueAsset = assets.find((a: any) => a.assetType === "epilogue");
		if (epilogueAsset?.content) {
			epilogue = epilogueAsset.content;
		}

		// Get chapter content from steps
		let chapterIndex = 1;
		for (const step of steps) {
			if (step.stepType === "chapter_writing" && step.agentOutput) {
				// Try to find the chapter title from volumes
				let chapterTitle = `Chapter ${chapterIndex}`;

				if (step.chapterId) {
					for (const vol of projectData.volumes) {
						const foundChapter = vol.chapters.find(
							(c) => c.id === step.chapterId,
						);
						if (foundChapter) {
							chapterTitle = foundChapter.title;
							break;
						}
					}
				}

				chapters.push({
					title: chapterTitle,
					content: step.agentOutput,
				});
				chapterIndex++;
			}
		}
	}

	// If no generation content, fall back to chapter drafts
	if (chapters.length === 0) {
		for (const vol of projectData.volumes) {
			for (const chap of vol.chapters) {
				const latestDraft = chap.drafts[0];
				if (latestDraft) {
					chapters.push({
						title: chap.title,
						content: latestDraft.content,
					});
				}
			}
		}
	}

	return {
		title: projectData.project.name,
		prologue,
		chapters,
		epilogue,
	};
}

/**
 * Generates a PDF buffer from project data.
 */
export async function generatePdf(
	projectData: FullProjectData,
): Promise<Buffer> {
	const bookContent = await collectBookContent(projectData);

	return new Promise((resolve, reject) => {
		const doc = new PDFDocument({
			size: "A4",
			margins: { top: 72, bottom: 72, left: 72, right: 72 },
		});

		// Register fonts explicitly to avoid ENOENT issues in Vercel/Next.js
		const fontPath = path.join(process.cwd(), "lib", "fonts");
		doc.registerFont("Helvetica", path.join(fontPath, "Helvetica.afm"));
		doc.registerFont(
			"Helvetica-Bold",
			path.join(fontPath, "Helvetica-Bold.afm"),
		);

		const chunks: Buffer[] = [];

		doc.on("data", (chunk: Buffer) => chunks.push(chunk));
		doc.on("end", () => resolve(Buffer.concat(chunks)));
		doc.on("error", reject);

		// Title page
		doc
			.fontSize(32)
			.font("Helvetica-Bold")
			.text(bookContent.title, { align: "center" })
			.moveDown(4);

		// Prologue
		if (bookContent.prologue) {
			doc.addPage();
			doc.fontSize(24).font("Helvetica-Bold").text("Prologue").moveDown(1);
			doc.fontSize(12).font("Helvetica").text(bookContent.prologue, {
				align: "justify",
				lineGap: 4,
			});
		}

		// Chapters
		for (const chapter of bookContent.chapters) {
			doc.addPage();
			doc.fontSize(24).font("Helvetica-Bold").text(chapter.title).moveDown(1);

			doc.fontSize(12).font("Helvetica").text(chapter.content, {
				align: "justify",
				lineGap: 4,
			});
		}

		// Epilogue
		if (bookContent.epilogue) {
			doc.addPage();
			doc.fontSize(24).font("Helvetica-Bold").text("Epilogue").moveDown(1);
			doc.fontSize(12).font("Helvetica").text(bookContent.epilogue, {
				align: "justify",
				lineGap: 4,
			});
		}

		doc.end();
	});
}

/**
 * Simple markdown to HTML converter for EPUB content.
 * Handles headers, bold, italic, and paragraphs.
 */
function markdownToHtml(markdown: string): string {
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

/**
 * Generates an EPUB buffer from project data.
 */
export async function generateEpub(
	projectData: FullProjectData,
): Promise<Buffer> {
	const bookContent = await collectBookContent(projectData);

	const epubOptions = {
		title: bookContent.title,
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
	if (bookContent.prologue) {
		epubSections.push({
			title: "Prologue",
			content: markdownToHtml(bookContent.prologue),
		});
	}

	// Add chapters
	for (const chapter of bookContent.chapters) {
		epubSections.push({
			title: chapter.title,
			content: markdownToHtml(chapter.content),
		});
	}

	// Add epilogue
	if (bookContent.epilogue) {
		epubSections.push({
			title: "Epilogue",
			content: markdownToHtml(bookContent.epilogue),
		});
	}

	const epubBuffer = await epub(epubOptions, epubSections);
	return epubBuffer;
}

/**
 * Uploads a buffer to Vercel Blob storage.
 */
export async function uploadToBlob(
	buffer: Buffer,
	filename: string,
	contentType: string,
): Promise<string> {
	const blob = await put(filename, buffer, {
		access: "public",
		contentType,
	});

	return blob.url;
}

/**
 * Exports a book to the specified format and uploads to blob storage.
 */
export async function exportBook(
	projectData: FullProjectData,
	format: ExportFormat,
): Promise<ExportResult> {
	const sanitizedTitle = projectData.project.name
		.replace(/[^a-z0-9]/gi, "_")
		.toLowerCase();
	const timestamp = Date.now();

	let buffer: Buffer;
	let filename: string;
	let contentType: string;

	if (format === "pdf") {
		buffer = await generatePdf(projectData);
		filename = `exports/${sanitizedTitle}_${timestamp}.pdf`;
		contentType = "application/pdf";
	} else {
		buffer = await generateEpub(projectData);
		filename = `exports/${sanitizedTitle}_${timestamp}.epub`;
		contentType = "application/epub+zip";
	}

	const url = await uploadToBlob(buffer, filename, contentType);

	return { url, filename };
}
