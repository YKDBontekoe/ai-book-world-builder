import { put } from "@vercel/blob";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { FullProjectData } from "@/lib/book-generation";
import { exportBook } from "@/lib/services/book-exporter";

// Mock @vercel/blob
vi.mock("@vercel/blob", () => ({
	put: vi.fn().mockResolvedValue({ url: "https://fake-url.com/file.pdf" }),
}));

// Mock pdfkit
type PDFEventHandler = (...args: unknown[]) => void;

vi.mock("pdfkit", () => {
	return {
		default: class MockPDFDocument {
			handlers: Record<string, PDFEventHandler> = {};

			on = vi.fn((event: string, cb: PDFEventHandler) => {
				this.handlers[event] = cb;
				return this;
			});
			registerFont = vi.fn();
			fontSize = vi.fn().mockReturnThis();
			font = vi.fn().mockReturnThis();
			text = vi.fn().mockReturnThis();
			moveDown = vi.fn().mockReturnThis();
			addPage = vi.fn().mockReturnThis();
			end = vi.fn(() => {
				if (this.handlers["end"]) this.handlers["end"]();
			});
		},
	};
});

describe("book-exporter security", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("uses a secure filename with UUID (IDOR protection)", async () => {
		const projectData = {
			project: { name: "My Secret Book" },
			generation: null,
			volumes: [],
		} as unknown as FullProjectData;

		await exportBook(projectData, "pdf");

		expect(put).toHaveBeenCalledTimes(1);
		const filename = vi.mocked(put).mock.calls[0][0];

		// Secure behavior: name + timestamp + UUID
		// UUID regex: [0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12} (36 chars)
		expect(filename).toMatch(
			/^exports\/my_secret_book_\d+_[0-9a-f-]{36}\.pdf$/,
		);
	});
});
