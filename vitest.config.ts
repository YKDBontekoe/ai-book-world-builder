import path from "node:path";
import { fileURLToPath } from "node:url";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import tsconfigPaths from "vite-tsconfig-paths";

import { defineConfig } from "vitest/config";

const dirname =
	typeof __dirname !== "undefined"
		? __dirname
		: path.dirname(fileURLToPath(import.meta.url));

console.log("Vitest dirname:", dirname);

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
	test: {
		coverage: {
			provider: "v8",
			reporter: ["text", "lcov", "json"],
			include: ["src/**/*.{ts,tsx}"],
			exclude: [
				"src/**/*.stories.tsx",
				"src/app/layout.tsx",
				"src/lib/db/schema/**",
				"src/components/ui/**",
			],
		},
		projects: [
			{
				plugins: [tsconfigPaths()],
				test: {
					name: "unit",
					environment: "jsdom",
					include: ["tests/unit/**/*.{test,spec}.{ts,tsx}"],
					setupFiles: ["./tests/vitest.setup.ts"],
					server: {
						deps: {
							inline: ["next-auth"],
						},
					},
				},
			},
			{
				extends: true,
				plugins: [
					// The plugin will run tests for the stories defined in your Storybook config
					// See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
					storybookTest({
						configDir: path.join(dirname, ".storybook"),
					}),
				],
				test: {
					name: "storybook",
					browser: {
						enabled: true,
						headless: true,
						provider: playwright({}),
						instances: [
							{
								browser: "chromium",
							},
						],
					},
					setupFiles: [".storybook/vitest.setup.ts"],
				},
			},
		],
	},
	resolve: {
		alias: [
			{ find: "@", replacement: path.resolve(dirname, "./src") },
			{
				find: "katex/dist/katex.min.css",
				replacement: path.resolve(dirname, "tests/__mocks__/styleMock.js"),
			},
			{
				find: "next/server",
				replacement: path.resolve(dirname, "node_modules/next/server.js"),
			},
			{
				find: "next/headers",
				replacement: path.resolve(dirname, "node_modules/next/headers.js"),
			},
		],
	},
});
