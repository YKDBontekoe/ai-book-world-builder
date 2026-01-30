import { put } from "@vercel/blob";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { FullProjectData } from "@/lib/book-generation";
import type { Project } from "@/lib/db/schema";
import { exportBook } from "@/lib/services/book-exporter";

// Mock @vercel/blob
vi.mock("@vercel/blob", () => ({
	put: vi.fn().mockResolvedValue({ url: "https://fake-url.com/file.pdf" }),
}));

// Mock pdfkit
vi.mock("pdfkit", () => {
	return {
		default: vi.fn().mockImplementation(function () {
			const handlers: Record<string, (...args: unknown[]) => unknown> = {};
			return {
				on: vi.fn((event, cb) => {
					handlers[event] = cb;
				}),
				registerFont: vi.fn(),
				fontSize: vi.fn().mockReturnThis(),
				font: vi.fn().mockReturnThis(),
				text: vi.fn().mockReturnThis(),
				moveDown: vi.fn().mockReturnThis(),
				addPage: vi.fn().mockReturnThis(),
				end: vi.fn(() => {
					if (handlers["end"]) handlers["end"]();
				}),
			};
		}),
	};
});

describe("book-exporter security", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("uses a secure filename with UUID (IDOR protection)", async () => {
		const projectData: FullProjectData = {
			project: { name: "My Secret Book" } as Project,
			entities: [],
			attributes: [],
			relationships: [],
			outlines: [],
			generation: null,
			volumes: [],
		};

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
