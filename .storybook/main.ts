import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/nextjs-vite";
import { mergeConfig } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config: StorybookConfig = {
	stories: [
		"../src/stories/**/*.mdx",
		"../src/stories/**/*.stories.@(js|jsx|mjs|ts|tsx)",
	],
	addons: [
		"@storybook/addon-onboarding",
		"@storybook/addon-a11y",
		"@storybook/addon-vitest",
		"@storybook/addon-interactions",
		"@storybook/addon-docs",
	],
	framework: {
		name: "@storybook/nextjs-vite",
		options: {},
	},
	features: {
		experimentalRSC: true,
	},
	typescript: {
		reactDocgen: "react-docgen-typescript",
	},
	viteFinal: async (config) => {
		return mergeConfig(config, {
			resolve: {
				alias: {
					// Mock database drivers to prevent bundling them
					postgres: resolve(__dirname, "../src/mocks/postgres.mock.ts"),
					// Mock Node.js built-ins that might slip through
					perf_hooks: resolve(__dirname, "../src/mocks/empty.mock.ts"),
					"node:crypto": resolve(__dirname, "../src/mocks/empty.mock.ts"),
					"@/app/actions/story-generation": resolve(
						__dirname,
						"../src/mocks/story-generation.mock.ts",
					),
					"@/app/actions/user": resolve(
						__dirname,
						"../src/mocks/user-actions.mock.ts",
					),
					"@/app/actions/appearance": resolve(
						__dirname,
						"../src/mocks/appearance.mock.ts",
					),
					redis: resolve(__dirname, "../src/mocks/empty.mock.ts"),
					"server-only": resolve(__dirname, "../src/mocks/empty.mock.ts"),
					"@/lib/db": resolve(__dirname, "../src/mocks/db.mock.ts"),
					"@/lib/db/drizzle": resolve(__dirname, "../src/mocks/db.mock.ts"),
				},
			},
			define: {
				__dirname: JSON.stringify(""),
			},
		});
	},
};
export default config;
