"use server";

import { put } from "@vercel/blob";
import epub from "epub-gen-memory";
import PDFDocument from "pdfkit";
import type { FullProjectData } from "@/lib/book-generation";

export type ExportFormat = "pdf" | "epub";

type ExportResult = {
  url: string;
  filename: string;
};

/**
 * Collects all chapter draft content from the project data.
 */
function collectBookContent(projectData: FullProjectData): {
  title: string;
  chapters: Array<{ title: string; content: string }>;
} {
  const chapters: Array<{ title: string; content: string }> = [];

  for (const vol of projectData.volumes) {
    for (const chap of vol.chapters) {
      // Get the latest draft for the chapter
      const latestDraft = chap.drafts[0];
      if (latestDraft) {
        chapters.push({
          title: chap.title,
          content: latestDraft.content,
        });
      }
    }
  }

  return {
    title: projectData.project.name,
    chapters,
  };
}

/**
 * Generates a PDF buffer from project data.
 */
export function generatePdf(projectData: FullProjectData): Promise<Buffer> {
  const bookContent = collectBookContent(projectData);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 72, bottom: 72, left: 72, right: 72 },
    });

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

    // Chapters
    for (const chapter of bookContent.chapters) {
      doc.addPage();
      doc.fontSize(24).font("Helvetica-Bold").text(chapter.title).moveDown(1);

      doc.fontSize(12).font("Helvetica").text(chapter.content, {
        align: "justify",
        lineGap: 4,
      });
    }

    doc.end();
  });
}

/**
 * Generates an EPUB buffer from project data.
 */
export async function generateEpub(
  projectData: FullProjectData
): Promise<Buffer> {
  const bookContent = collectBookContent(projectData);

  const epubOptions = {
    title: bookContent.title,
    author: "AI Book World Builder",
  };

  const epubContent = bookContent.chapters.map((chapter) => ({
    title: chapter.title,
    content: `<p>${chapter.content.replace(/\n/g, "</p><p>")}</p>`,
  }));

  const epubBuffer = await epub(epubOptions, epubContent);
  return epubBuffer;
}

/**
 * Uploads a buffer to Vercel Blob storage.
 */
export async function uploadToBlob(
  buffer: Buffer,
  filename: string,
  contentType: string
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
  format: ExportFormat
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
