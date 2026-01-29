import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { Button } from "@/components/atoms/button";
import { StructureEditorDialog } from "@/features/writer/components/structure-editor-dialog";

const meta: Meta<typeof StructureEditorDialog> = {
	title: "Features/Writer/StructureEditorDialog",
	component: StructureEditorDialog,
	parameters: {
		layout: "centered",
	},
	decorators: [
		(Story) => (
			<div className="p-4">
				<Story />
			</div>
		),
	],
};

export default meta;
type Story = StoryObj<typeof StructureEditorDialog>;

export const Default: Story = {
	args: {
		projectId: "project-1",
		currentStructure: "Chapter 1: The Start\n  Scene 1: Beginning",
		onSave: () => console.log("Save clicked"),
		children: <Button>Edit Structure</Button>,
	},
};

export const Open: Story = {
	args: {
		...Default.args,
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const button = canvas.getByRole("button", { name: "Edit Structure" });
		await userEvent.click(button);

		// Wait for dialog to appear (it renders in a portal usually)
		// Since we are in storybook, we look at document body for portal
		const body = within(document.body);
		await expect(
			body.findByRole("dialog", { name: "Structure Editor" }),
		).resolves.toBeInTheDocument();
	},
};

export const WithPreview: Story = {
	args: {
		...Default.args,
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const button = canvas.getByRole("button", { name: "Edit Structure" });
		await userEvent.click(button);

		const body = within(document.body);
		// Wait for dialog
		await body.findByRole("dialog", { name: "Structure Editor" });

		// Toggle preview
		const previewBtn = await body.findByRole("button", { name: "Toggle Preview" });
		await userEvent.click(previewBtn);

		await expect(
			body.findByText("Structure Preview"),
		).resolves.toBeInTheDocument();
	},
};
