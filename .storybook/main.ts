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
					postgres: resolve(__dirname, "../tests/mocks/postgres.mock.ts"),
					// Mock Node.js built-ins that might slip through
					perf_hooks: resolve(__dirname, "../tests/mocks/empty.mock.ts"),
					"node:crypto": resolve(__dirname, "../tests/mocks/empty.mock.ts"),
				},
			},
		});
	},
};
export default config;
