"use client";

import { ChevronUp, Loader2Icon, Settings } from "lucide-react";
import Image from "next/image";
import type { User } from "next-auth";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { toast } from "sonner";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/atoms/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/atoms/sidebar";
import { SettingsDialog } from "@/components/organisms/settings-dialog";

export function SidebarUserNav({ user }: { user: User }) {
	const { status } = useSession();
	const { setTheme, resolvedTheme } = useTheme();
	const [showSettings, setShowSettings] = useState(false);

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						{status === "loading" ? (
							<SidebarMenuButton className="h-10 justify-between bg-background data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
								<div className="flex flex-row gap-2">
									<div className="size-6 animate-pulse rounded-full bg-zinc-500/30" />
									<span className="animate-pulse rounded-md bg-zinc-500/30 text-transparent">
										Loading auth status
									</span>
								</div>
								<div className="animate-spin text-zinc-500">
									<Loader2Icon size={16} />
								</div>
							</SidebarMenuButton>
						) : (
							<SidebarMenuButton
								className="h-10 bg-background data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
								data-testid="user-nav-button"
							>
								<Image
									alt={user.email ?? "User Avatar"}
									className="rounded-full"
									height={24}
									src={`https://avatar.vercel.sh/${user.email}`}
									width={24}
								/>
								<span className="truncate" data-testid="user-email">
									{user?.email}
								</span>
								<ChevronUp className="ml-auto" />
							</SidebarMenuButton>
						)}
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-(--radix-popper-anchor-width)"
						data-testid="user-nav-menu"
						side="top"
					>
						<DropdownMenuItem
							className="cursor-pointer gap-2"
							onSelect={() => setShowSettings(true)}
						>
							<Settings className="h-4 w-4" />
							Settings
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							className="cursor-pointer"
							data-testid="user-nav-item-theme"
							onSelect={() =>
								setTheme(resolvedTheme === "dark" ? "light" : "dark")
							}
						>
							{`Toggle ${resolvedTheme === "light" ? "dark" : "light"} mode`}
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem asChild data-testid="user-nav-item-auth">
							<button
								className="w-full cursor-pointer"
								onClick={() => {
									if (status === "loading") {
										toast.error(
											"Checking authentication status, please try again!",
										);

										return;
									}

									signOut({
										redirectTo: "/",
									});
								}}
								type="button"
							>
								Sign out
							</button>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>

			<SettingsDialog open={showSettings} onOpenChange={setShowSettings} />
		</SidebarMenu>
	);
}
