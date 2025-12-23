import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import React from 'react';

process.env.NEXT_RUNTIME = process.env.NEXT_RUNTIME ?? "nodejs";
process.env.POSTGRES_URL = "postgres://localhost:5432/test";

if (typeof window !== "undefined" && typeof document !== "undefined") {
  await import("@testing-library/jest-dom/vitest");

  if (typeof Element !== "undefined") {
    Element.prototype.hasPointerCapture ||= () => false;
    Element.prototype.releasePointerCapture ||= () => {};
  }

  // Mock matchMedia for usehooks-ts useMediaQuery
  Object.defineProperty(window, 'matchMedia', {
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
}

import { vi } from 'vitest';

// Mock styles that might cause issues in jsdom
vi.mock('katex/dist/katex.min.css', () => ({}));
vi.mock('katex/dist/katex.css', () => ({}));

// Mock streamdown to avoid katex css import issues inside it
vi.mock("streamdown", () => ({
  Streamdown: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
}));

// Mock server-only
vi.mock("server-only", () => {
    return {};
});

// Mock drizzle to prevent initialization errors in unit tests
vi.mock("@/lib/db/drizzle", () => ({
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
        transaction: vi.fn().mockImplementation((cb) => cb({
            select: vi.fn().mockReturnThis(),
            insert: vi.fn().mockReturnThis(),
            update: vi.fn().mockReturnThis(),
            delete: vi.fn().mockReturnThis(),
        })),
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

// Mock next/server for next-auth compatibility
vi.mock("next/server", () => ({
    NextResponse: {
        json: (body: any, init?: any) => Response.json(body, init),
    },
}));

afterEach(() => {
  cleanup();
});

export {};
