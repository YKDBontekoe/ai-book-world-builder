import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/atoms/sheet";

const meta = {
	title: "Design System/Atoms/Sheet",
	component: Sheet,
	tags: ["autodocs"],
	argTypes: {
		side: {
			control: "select",
			options: ["top", "bottom", "left", "right"],
		},
	},
} satisfies Meta<any>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: ({ side = "right", ...args }: any) => {
		const nameId = React.useId();
		const usernameId = React.useId();
		return (
			<Sheet {...args}>
				<SheetTrigger asChild>
					<Button variant="outline">Open Sheet</Button>
				</SheetTrigger>
				<SheetContent side={side}>
					<SheetHeader>
						<SheetTitle>Edit profile</SheetTitle>
						<SheetDescription>
							Make changes to your profile here. Click save when you're done.
						</SheetDescription>
					</SheetHeader>
					<div className="grid gap-4 py-4">
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor={nameId} className="text-right">
								Name
							</Label>
							<Input
								id={nameId}
								defaultValue="Pedro Duarte"
								className="col-span-3"
							/>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor={usernameId} className="text-right">
								Username
							</Label>
							<Input
								id={usernameId}
								defaultValue="@peduarte"
								className="col-span-3"
							/>
						</div>
					</div>
					<SheetFooter>
						<SheetClose asChild>
							<Button type="submit">Save changes</Button>
						</SheetClose>
					</SheetFooter>
				</SheetContent>
			</Sheet>
		);
	},
};
