import type { Preview } from "@storybook/nextjs-vite";
import { initialize, mswLoader } from 'msw-storybook-addon';
import { handlers } from "../src/mocks/handlers";
import "../src/app/globals.css";

// Initialize MSW
initialize();

const preview: Preview = {
	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},
		msw: {
			handlers: handlers,
		},
	},
	loaders: [mswLoader],
};

export default preview;
