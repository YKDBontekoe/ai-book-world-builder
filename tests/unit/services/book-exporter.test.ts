import { put } from "@vercel/blob";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { exportBook } from "@/lib/services/book-exporter";

// Mock @vercel/blob
vi.mock("@vercel/blob", () => ({
	put: vi.fn().mockResolvedValue({ url: "https://fake-url.com/file.pdf" }),
}));

// Mock pdfkit
vi.mock("pdfkit", () => {
	// Create a class to ensure it can be instantiated with 'new'
	class MockPDFDocument {
		handlers: Record<string, (...args: unknown[]) => void> = {};

		on = vi.fn((event: string, cb: (...args: unknown[]) => void) => {
			this.handlers[event] = cb;
			return this;
		});

		registerFont = vi.fn().mockReturnThis();
		fontSize = vi.fn().mockReturnThis();
		font = vi.fn().mockReturnThis();
		text = vi.fn().mockReturnThis();
		moveDown = vi.fn().mockReturnThis();
		addPage = vi.fn().mockReturnThis();

		end = vi.fn(() => {
			if (this.handlers["end"]) this.handlers["end"]();
			return this;
		});
	}

	return {
		default: MockPDFDocument,
	};
});

describe("book-exporter security", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("uses a secure filename with UUID (IDOR protection)", async () => {
		const projectData = {
			project: {
				name: "My Secret Book",
				id: "p1",
				userId: "u1",
				createdAt: new Date(),
				description: null,
				visibility: "private",
				folders: [],
				forkedFromId: null,
				lastViewedSceneId: null,
			},
			generation: null,
			volumes: [],
			entities: [],
			attributes: [],
			relationships: [],
			outlines: [],
		} satisfies Parameters<typeof exportBook>[0];

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
