import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@/components/atoms/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/atoms/popover";

const meta = {
	title: "Atoms/Popover",
	component: Popover,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: (args) => (
		<Popover {...args}>
			<PopoverTrigger asChild>
				<Button variant="outline">Open Popover</Button>
			</PopoverTrigger>
			<PopoverContent className="w-80">
				<div className="grid gap-4">
					<div className="space-y-2">
						<h4 className="font-medium leading-none">Dimensions</h4>
						<p className="text-sm text-muted-foreground">
							Set the dimensions for the layer.
						</p>
					</div>
					<div className="grid gap-2">
						<div className="grid grid-cols-3 items-center gap-4">
							<label htmlFor="width">Width</label>
							<input
								id="width"
								defaultValue="100%"
								className="col-span-2 h-8 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
							/>
						</div>
						<div className="grid grid-cols-3 items-center gap-4">
							<label htmlFor="maxWidth">Max. width</label>
							<input
								id="maxWidth"
								defaultValue="300px"
								className="col-span-2 h-8 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
							/>
						</div>
						<div className="grid grid-cols-3 items-center gap-4">
							<label htmlFor="height">Height</label>
							<input
								id="height"
								defaultValue="25px"
								className="col-span-2 h-8 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
							/>
						</div>
						<div className="grid grid-cols-3 items-center gap-4">
							<label htmlFor="maxHeight">Max. height</label>
							<input
								id="maxHeight"
								defaultValue="none"
								className="col-span-2 h-8 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
							/>
						</div>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	),
};
