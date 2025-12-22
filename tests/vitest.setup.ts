import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import React from 'react';

process.env.NEXT_RUNTIME = process.env.NEXT_RUNTIME ?? "nodejs";

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

// Mock next/server for next-auth compatibility
vi.mock("next/server", () => ({
    NextResponse: {
        json: (body: any, init?: { status?: number }) => ({
            status: init?.status ?? 200,
            json: async () => body,
        }),
    },
}));

afterEach(() => {
  cleanup();
});

export {};
