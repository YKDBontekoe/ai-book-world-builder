import * as a11yAddonAnnotations from "@storybook/addon-a11y/preview";
import { setProjectAnnotations } from "@storybook/nextjs-vite";
import { vi } from "vitest";
import * as projectAnnotations from "./preview";

// This is an important step to apply the right configuration when testing your stories.
// More info at: https://storybook.js.org/docs/api/portable-stories/portable-stories-vitest#setprojectannotations
setProjectAnnotations([a11yAddonAnnotations, projectAnnotations]);

// Mock server actions to avoid Node.js specific imports (like next-auth) in browser environment
vi.mock("@/features/writer/actions", () => ({
	saveProjectStructure: vi.fn().mockResolvedValue({ success: true }),
}));
