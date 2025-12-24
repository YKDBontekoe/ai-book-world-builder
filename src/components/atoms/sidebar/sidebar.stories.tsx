import type { Meta, StoryObj } from "@storybook/react";
import { Calendar, Home, Inbox, Search, Settings, User } from "lucide-react";

import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
	SidebarRail,
	SidebarTrigger,
} from "@/components/atoms/sidebar"; // Imports from index.ts in current dir

const meta: Meta<typeof SidebarProvider> = {
	title: "UI/Sidebar",
	component: SidebarProvider,
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
	},
};

export default meta;
type Story = StoryObj<typeof SidebarProvider>;

// Basic sidebar structure
const BasicSidebar = () => {
	const items = [
		{ title: "Home", url: "#", icon: Home },
		{ title: "Inbox", url: "#", icon: Inbox },
		{ title: "Calendar", url: "#", icon: Calendar },
		{ title: "Search", url: "#", icon: Search },
		{ title: "Settings", url: "#", icon: Settings },
	];

	return (
		<SidebarProvider>
			<div className="flex h-screen w-full">
				<Sidebar>
					<SidebarHeader>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton size="lg">
									<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
										<User className="size-4" />
									</div>
									<div className="flex flex-col gap-0.5 leading-none">
										<span className="font-semibold">My App</span>
										<span className="">v1.0.0</span>
									</div>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarHeader>
					<SidebarContent>
						<SidebarGroup>
							<SidebarGroupLabel>Application</SidebarGroupLabel>
							<SidebarGroupContent>
								<SidebarMenu>
									{items.map((item) => (
										<SidebarMenuItem key={item.title}>
											<SidebarMenuButton asChild>
												<a href={item.url}>
													<item.icon />
													<span>{item.title}</span>
												</a>
											</SidebarMenuButton>
										</SidebarMenuItem>
									))}
								</SidebarMenu>
							</SidebarGroupContent>
						</SidebarGroup>
					</SidebarContent>
					<SidebarRail />
				</Sidebar>
				<main className="flex-1 p-6">
					<SidebarTrigger />
					<div className="mt-4 border border-dashed p-4 rounded h-[500px] flex items-center justify-center text-muted-foreground">
						Main Content Area
					</div>
				</main>
			</div>
		</SidebarProvider>
	);
};

export const Default: Story = {
	render: () => <BasicSidebar />,
};

export const CollapsibleIcon: Story = {
	render: () => (
		<SidebarProvider defaultOpen={false}>
			<div className="flex h-screen w-full">
				<Sidebar collapsible="icon">
					<SidebarContent>
						<SidebarGroup>
							<SidebarGroupLabel>Menu</SidebarGroupLabel>
							<SidebarGroupContent>
								<SidebarMenu>
									<SidebarMenuItem>
										<SidebarMenuButton tooltip="Home">
											<Home />
											<span>Home</span>
										</SidebarMenuButton>
									</SidebarMenuItem>
									<SidebarMenuItem>
										<SidebarMenuButton tooltip="Inbox">
											<Inbox />
											<span>Inbox</span>
										</SidebarMenuButton>
									</SidebarMenuItem>
								</SidebarMenu>
							</SidebarGroupContent>
						</SidebarGroup>
					</SidebarContent>
				</Sidebar>
				<main className="flex-1 p-6">
					<SidebarTrigger />
					<p className="mt-4">Collapsed by default (icon mode)</p>
				</main>
			</div>
		</SidebarProvider>
	),
};
