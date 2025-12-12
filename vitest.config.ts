import path from "node:path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./tests/vitest.setup.ts"],
    environmentMatchGlobs: [["tests/unit/components/**/*.{test,spec}.tsx", "jsdom"]],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname),
    },
  },
});
