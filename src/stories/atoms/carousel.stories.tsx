import type { Meta, StoryObj } from "@storybook/react";
import { Card, CardContent } from "@/components/atoms/card";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/atoms/carousel";

const meta: Meta<typeof Carousel> = {
	title: "Design System/Atoms/Carousel",
	component: Carousel,
	tags: ["autodocs"],
	parameters: {
		layout: "centered",
	},
	decorators: [
		(Story) => (
			<div className="w-[400px]">
				<Story />
			</div>
		),
	],
};

export default meta;
type Story = StoryObj<typeof Carousel>;

export const Default: Story = {
	render: (args) => (
		<Carousel className="w-full max-w-xs" {...args}>
			<CarouselContent>
				{Array.from({ length: 5 }).map((_, index) => (
					<CarouselItem key={index}>
						<div className="p-1">
							<Card>
								<CardContent className="flex aspect-square items-center justify-center p-6">
									<span className="text-4xl font-semibold">{index + 1}</span>
								</CardContent>
							</Card>
						</div>
					</CarouselItem>
				))}
			</CarouselContent>
			<CarouselPrevious />
			<CarouselNext />
		</Carousel>
	),
};

export const OrientationVertical: Story = {
	args: {
		orientation: "vertical",
		opts: {
			align: "start",
		},
	},
	render: (args) => (
		<Carousel className="w-full max-w-xs" {...args}>
			<CarouselContent className="-mt-1 h-[200px]">
				{Array.from({ length: 5 }).map((_, index) => (
					<CarouselItem key={index} className="pt-1 md:basis-1/2">
						<div className="p-1">
							<Card>
								<CardContent className="flex items-center justify-center p-6">
									<span className="text-3xl font-semibold">{index + 1}</span>
								</CardContent>
							</Card>
						</div>
					</CarouselItem>
				))}
			</CarouselContent>
			<CarouselPrevious />
			<CarouselNext />
		</Carousel>
	),
};
