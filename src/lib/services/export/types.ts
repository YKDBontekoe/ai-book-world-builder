import type { FullProjectData } from "@/lib/book-generation";

export type ExportFormat = "pdf" | "epub";

export type ExportResult = {
	url: string;
	filename: string;
};

export type BookContent = {
	title: string;
	prologue?: string;
	chapters: Array<{ title: string; content: string }>;
	epilogue?: string;
};

export interface BookExporter {
	generate(projectData: FullProjectData, content: BookContent): Promise<Buffer>;
}
