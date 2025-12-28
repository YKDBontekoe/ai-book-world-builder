import type { Mock } from "vitest";

// Helper type to fix "Cannot find namespace 'vi'" if global types aren't loaded
// Usage: const m = func as unknown as Mock;
export type ViMock = Mock;
