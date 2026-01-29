import { put } from "@vercel/blob";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { exportBook } from "@/lib/services/book-exporter";

// Mock @vercel/blob
vi.mock("@vercel/blob", () => ({
	put: vi.fn().mockResolvedValue({ url: "https://fake-url.com/file.pdf" }),
}));

// Mock pdfkit
vi.mock("pdfkit", () => {
	return {
		default: class PDFDocument {
			private handlers: Record<string, Function> = {};

			constructor() {}

			on(event: string, cb: Function) {
				this.handlers[event] = cb;
			}
			registerFont() {
				return this;
			}
			fontSize() {
				return this;
			}
			font() {
				return this;
			}
			text() {
				return this;
			}
			moveDown() {
				return this;
			}
			addPage() {
				return this;
			}
			end() {
				if (this.handlers["end"]) this.handlers["end"]();
			}
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
		} as any;

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
