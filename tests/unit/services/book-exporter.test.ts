import { put } from "@vercel/blob";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { FullProjectData } from "@/lib/book-generation";
import { exportBook } from "@/lib/services/book-exporter";

// Mock @vercel/blob
vi.mock("@vercel/blob", () => ({
	put: vi.fn().mockResolvedValue({ url: "https://fake-url.com/file.pdf" }),
}));

// Mock pdfkit
vi.mock("pdfkit", () => {
	return {
		// biome-ignore lint/complexity/useArrowFunction: Mocking constructor
		default: vi.fn().mockImplementation(function () {
			// biome-ignore lint/complexity/noBannedTypes: Mocking internal types
			const handlers: Record<string, Function> = {};
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
			project: {
				id: "1",
				name: "My Secret Book",
				createdAt: new Date(),
				userId: "user-1",
				lastViewedSceneId: null,
				description: null,
				visibility: "private",
				folders: [],
				forkedFromId: null,
			},
			generation: null,
			volumes: [],
			entities: [],
			attributes: [],
			relationships: [],
			outlines: [],
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
