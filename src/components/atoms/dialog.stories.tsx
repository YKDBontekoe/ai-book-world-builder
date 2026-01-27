import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { Button } from "./button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "./dialog";

const meta = {
	title: "Atoms/Dialog",
	component: Dialog,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: (args) => (
		<Dialog {...args}>
			<DialogTrigger asChild>
				<Button variant="outline">Open Dialog</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit profile</DialogTitle>
					<DialogDescription>
						Make changes to your profile here. Click save when you're done.
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="grid grid-cols-4 items-center gap-4">
						<label htmlFor="name" className="text-right text-sm font-medium">
							Name
						</label>
						<input
							id="name"
							defaultValue="Pedro Duarte"
							className="col-span-3 flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
						/>
					</div>
					<div className="grid grid-cols-4 items-center gap-4">
						<label
							htmlFor="username"
							className="text-right text-sm font-medium"
						>
							Username
						</label>
						<input
							id="username"
							defaultValue="@peduarte"
							className="col-span-3 flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
						/>
					</div>
				</div>
				<DialogFooter>
					<DialogClose asChild>
						<Button type="button" variant="secondary">
							Close
						</Button>
					</DialogClose>
					<Button type="button" onClick={() => console.log("Saved!")}>
						Save changes
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	),
	play: async ({ canvasElement, step }) => {
		const canvas = within(canvasElement);

		await step("Open dialog", async () => {
			await userEvent.click(
				canvas.getByRole("button", { name: "Open Dialog" }),
			);
		});

		// Dialog content is rendered in a portal, so we need to query document.body
		const body = within(document.body);

		await step("Interact with form", async () => {
			const dialog = await body.findByRole("dialog");
			await expect(dialog).toBeVisible();

			const nameInput = body.getByLabelText("Name");
			const usernameInput = body.getByLabelText("Username");

			await userEvent.clear(nameInput);
			await userEvent.type(nameInput, "John Doe");

			await userEvent.clear(usernameInput);
			await userEvent.type(usernameInput, "@johndoe");

			await expect(nameInput).toHaveValue("John Doe");
			await expect(usernameInput).toHaveValue("@johndoe");
		});

		await step("Save changes", async () => {
			const saveButton = body.getByRole("button", { name: "Save changes" });
			await userEvent.click(saveButton);
			await expect(saveButton).toBeVisible();
		});
	},
};
