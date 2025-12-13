import path from "node:path";
import { fileURLToPath } from "node:url";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

const dirname =
	typeof __dirname !== "undefined"
		? __dirname
		: path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
	test: {
		// Shared defaults
		environment: "jsdom",
		setupFiles: ["./tests/vitest.setup.ts"],

		projects: [
			{
				name: "unit",
				extends: true,
				test: {
					include: ["tests/unit/**/*.{test,spec}.tsx"],
					environment: "jsdom",
				},
			},
			{
				name: "storybook",
				extends: true,
				plugins: [
					storybookTest({
						configDir: path.join(dirname, ".storybook"),
					}),
				],
				test: {
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
		alias: {
			"@": path.resolve(dirname),
		},
	},
});
