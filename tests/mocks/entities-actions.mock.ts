import { fn } from "@storybook/test";

export const getEntitiesForProject = fn().mockResolvedValue({
	success: true,
	data: [],
});
