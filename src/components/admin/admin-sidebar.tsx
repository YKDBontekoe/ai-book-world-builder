"use client";

import { Github, Home, LayoutDashboard, Settings2, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "@/components/atoms/sidebar";

const items = [
	{
		title: "Dashboard",
		url: "/admin",
		icon: LayoutDashboard,
	},
	{
		title: "Users",
		url: "/admin/users",
		icon: Users,
	},
	{
		title: "Features",
		url: "/admin/features",
		icon: Settings2,
	},
];

export function AdminSidebar() {
	const pathname = usePathname();

	return (
		<Sidebar>
			<SidebarHeader className="p-4">
				<h2 className="text-xl font-bold tracking-tight px-2">Admin Panel</h2>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Menu</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{items.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton asChild isActive={pathname === item.url}>
										<Link href={item.url}>
											<item.icon />
											<span>{item.title}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				<SidebarGroup className="mt-auto">
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton asChild>
									<Link href="/platform">
										<Home />
										<span>Back to Platform</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	);
}
