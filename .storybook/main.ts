import type { StorybookConfig } from '@storybook/nextjs-vite';

const config: StorybookConfig = {
  stories: [
    "../stories/**/*.mdx",
    "../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../components/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  addons: [
    "@storybook/addon-onboarding",
    // "@storybook/addon-a11y" // Commented out to ensure build success first
  ],
  framework: "@storybook/nextjs-vite",
  staticDirs: [
    "../public"
  ]
};
export default config;
