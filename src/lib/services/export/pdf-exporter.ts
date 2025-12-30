import path from "node:path";
import PDFDocument from "pdfkit";
import type { FullProjectData } from "@/lib/book-generation";
import type { BookContent, BookExporter } from "./types";

export class PdfExporter implements BookExporter {
	async generate(
		_projectData: FullProjectData,
		content: BookContent,
	): Promise<Buffer> {
		return new Promise((resolve, reject) => {
			const doc = new PDFDocument({
				size: "A4",
				margins: { top: 72, bottom: 72, left: 72, right: 72 },
			});

			// Register fonts explicitly to avoid ENOENT issues in Vercel/Next.js
			// Note: We use process.cwd() to locate fonts relative to the project root
			const fontPath = path.join(process.cwd(), "lib", "fonts");
			try {
				doc.registerFont("Helvetica", path.join(fontPath, "Helvetica.afm"));
				doc.registerFont(
					"Helvetica-Bold",
					path.join(fontPath, "Helvetica-Bold.afm"),
				);
			} catch (e) {
				console.warn("Could not register fonts, falling back to default.", e);
			}

			const chunks: Buffer[] = [];

			doc.on("data", (chunk: Buffer) => chunks.push(chunk));
			doc.on("end", () => resolve(Buffer.concat(chunks)));
			doc.on("error", reject);

			// Title page
			doc
				.fontSize(32)
				.font("Helvetica-Bold")
				.text(content.title, { align: "center" })
				.moveDown(4);

			// Prologue
			if (content.prologue) {
				doc.addPage();
				doc.fontSize(24).font("Helvetica-Bold").text("Prologue").moveDown(1);
				doc.fontSize(12).font("Helvetica").text(content.prologue, {
					align: "justify",
					lineGap: 4,
				});
			}

			// Chapters
			for (const chapter of content.chapters) {
				doc.addPage();
				doc.fontSize(24).font("Helvetica-Bold").text(chapter.title).moveDown(1);

				doc.fontSize(12).font("Helvetica").text(chapter.content, {
					align: "justify",
					lineGap: 4,
				});
			}

			// Epilogue
			if (content.epilogue) {
				doc.addPage();
				doc.fontSize(24).font("Helvetica-Bold").text("Epilogue").moveDown(1);
				doc.fontSize(12).font("Helvetica").text(content.epilogue, {
					align: "justify",
					lineGap: 4,
				});
			}

			doc.end();
		});
	}
}
