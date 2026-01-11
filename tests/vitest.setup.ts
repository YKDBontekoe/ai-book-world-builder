import { cleanup } from "@testing-library/react";
import React from "react";
import { afterAll, afterEach, beforeAll, vi } from "vitest";

// Import MSW server - use relative path or alias if supported, but relative is safer for setup
import { server } from "../src/mocks/server";

process.env.NEXT_RUNTIME = process.env.NEXT_RUNTIME ?? "nodejs";
process.env.POSTGRES_URL = "postgres://localhost:5432/test";

// Mock next/server for next-auth compatibility BEFORE imports
vi.mock("next/server", () => ({
	NextResponse: {
		json: (body: any, init?: { status?: number }) => ({
			status: init?.status ?? 200,
			json: async () => body,
		}),
	},
	NextRequest: class NextRequest {},
}));

// MSW Setup
beforeAll(() => server.listen());
afterEach(() => {
	server.resetHandlers();
	if (typeof window !== "undefined") {
		window.localStorage?.clear();
	}
	cleanup();
});
afterAll(() => server.close());

if (typeof window !== "undefined" && typeof document !== "undefined") {
	await import("@testing-library/jest-dom/vitest");

	if (typeof Element !== "undefined") {
		Element.prototype.hasPointerCapture ||= () => false;
		Element.prototype.releasePointerCapture ||= () => {};
	}

	// Mock matchMedia for usehooks-ts useMediaQuery
	Object.defineProperty(window, "matchMedia", {
		writable: true,
		value: (query: string) => ({
			matches: false,
			media: query,
			onchange: null,
			addListener: () => {}, // deprecated
			removeListener: () => {}, // deprecated
			addEventListener: () => {},
			removeEventListener: () => {},
			dispatchEvent: () => {},
		}),
	});

	// Mock localStorage
	const localStorageMock = (function () {
		let store: Record<string, string> = {};
		return {
			getItem: (key: string) => store[key] || null,
			setItem: (key: string, value: string) => {
				store[key] = value.toString();
			},
			removeItem: (key: string) => {
				delete store[key];
			},
			clear: () => {
				store = {};
			},
		};
	})();
	Object.defineProperty(window, "localStorage", {
		value: localStorageMock,
	});
}

// Mock styles that might cause issues in jsdom
vi.mock("katex/dist/katex.min.css", () => ({}));
vi.mock("katex/dist/katex.css", () => ({}));

// Mock streamdown to avoid katex css import issues inside it
vi.mock("streamdown", () => ({
	Streamdown: ({ children }: { children: React.ReactNode }) =>
		React.createElement("div", null, children),
}));

// Mock server-only
vi.mock("server-only", () => {
	return {};
});

// Mock drizzle to prevent initialization errors in unit tests
vi.mock("@/lib/db", () => ({
	db: {
		select: vi.fn().mockReturnThis(),
		from: vi.fn().mockReturnThis(),
		where: vi.fn().mockReturnThis(),
		orderBy: vi.fn().mockReturnThis(),
		limit: vi.fn().mockReturnThis(),
		insert: vi.fn().mockReturnThis(),
		values: vi.fn().mockReturnThis(),
		update: vi.fn().mockReturnThis(),
		set: vi.fn().mockReturnThis(),
		delete: vi.fn().mockReturnThis(),
		transaction: vi.fn().mockImplementation((cb) =>
			cb({
				select: vi.fn().mockReturnThis(),
				insert: vi.fn().mockReturnThis(),
				update: vi.fn().mockReturnThis(),
				delete: vi.fn().mockReturnThis(),
			}),
		),
	},
}));

// Mock NextAuth to prevent initialization errors in unit tests
vi.mock("next-auth", () => ({
	default: () => ({
		auth: vi.fn(),
		handlers: { GET: vi.fn(), POST: vi.fn() },
		signIn: vi.fn(),
		signOut: vi.fn(),
		update: vi.fn(),
	}),
}));

vi.mock("@auth/drizzle-adapter", () => ({
	DrizzleAdapter: vi.fn(() => ({})),
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
	useRouter: () => ({
		push: vi.fn(),
		replace: vi.fn(),
		prefetch: vi.fn(),
		back: vi.fn(),
		forward: vi.fn(),
		refresh: vi.fn(),
	}),
	usePathname: () => "/",
	useSearchParams: () => new URLSearchParams(),
	useParams: () => ({}),
}));
