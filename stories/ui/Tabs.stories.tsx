import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const meta = {
	title: "UI/Tabs",
	component: Tabs,
	tags: ["autodocs"],
	args: {
		defaultValue: "account",
		className: "w-[400px]",
	},
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: (args: any) => {
		const nameId = React.useId();
		const usernameId = React.useId();
		const currentId = React.useId();
		const newId = React.useId();
		return (
			<Tabs {...args}>
				<TabsList className="grid w-full grid-cols-2">
					<TabsTrigger value="account">Account</TabsTrigger>
					<TabsTrigger value="password">Password</TabsTrigger>
				</TabsList>
				<TabsContent value="account">
					<Card>
						<CardHeader>
							<CardTitle>Account</CardTitle>
							<CardDescription>
								Make changes to your account here. Click save when you're done.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-2">
							<div className="space-y-1">
								<Label htmlFor={nameId}>Name</Label>
								<Input id={nameId} defaultValue="Pedro Duarte" />
							</div>
							<div className="space-y-1">
								<Label htmlFor={usernameId}>Username</Label>
								<Input id={usernameId} defaultValue="@peduarte" />
							</div>
						</CardContent>
						<CardFooter>
							<Button>Save changes</Button>
						</CardFooter>
					</Card>
				</TabsContent>
				<TabsContent value="password">
					<Card>
						<CardHeader>
							<CardTitle>Password</CardTitle>
							<CardDescription>
								Change your password here. After saving, you'll be logged out.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-2">
							<div className="space-y-1">
								<Label htmlFor={currentId}>Current password</Label>
								<Input id={currentId} type="password" />
							</div>
							<div className="space-y-1">
								<Label htmlFor={newId}>New password</Label>
								<Input id={newId} type="password" />
							</div>
						</CardContent>
						<CardFooter>
							<Button>Save password</Button>
						</CardFooter>
					</Card>
				</TabsContent>
			</Tabs>
		);
	},
};
