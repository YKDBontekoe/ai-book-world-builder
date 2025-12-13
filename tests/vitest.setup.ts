process.env.NEXT_RUNTIME = process.env.NEXT_RUNTIME ?? "nodejs";

if (typeof window !== "undefined" && typeof document !== "undefined") {
  await import("@testing-library/jest-dom/vitest");

  if (typeof Element !== "undefined") {
    Element.prototype.hasPointerCapture ||= () => false;
    Element.prototype.releasePointerCapture ||= () => {};
  }
}

import { vi } from 'vitest';

// Mock styles that might cause issues in jsdom
vi.mock('katex/dist/katex.min.css', () => ({}));

export {};
