"use server";

import { put } from "@vercel/blob";
import type { FullProjectData } from "@/lib/book-generation";
import { BookContentCollector } from "@/lib/services/export/content-collector";
import { EpubExporter } from "@/lib/services/export/epub-exporter";
import { PdfExporter } from "@/lib/services/export/pdf-exporter";
import type { ExportFormat } from "@/lib/services/export/types";

type ExportResult = {
	url: string;
	filename: string;
};

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

	const collector = new BookContentCollector();
	const content = await collector.collect(projectData);

	if (format === "pdf") {
		const exporter = new PdfExporter();
		buffer = await exporter.generate(projectData, content);
		filename = `exports/${sanitizedTitle}_${timestamp}.pdf`;
		contentType = "application/pdf";
	} else {
		const exporter = new EpubExporter();
		buffer = await exporter.generate(projectData, content);
		filename = `exports/${sanitizedTitle}_${timestamp}.epub`;
		contentType = "application/epub+zip";
	}

	const url = await uploadToBlob(buffer, filename, contentType);

	return { url, filename };
}
