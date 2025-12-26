"use client";

import { useSidebar } from "@/components/atoms/sidebar/provider";
import { cn } from "@/lib/utils";
import { PanelLeft } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/atoms/button";
import { Slot as SlotPrimitive } from "radix-ui";

export function SidebarTrigger({
	className,
	onClick,
	...props
}: React.ComponentProps<typeof Button>) {
	const { toggleSidebar } = useSidebar();

	return (
		<Button
			data-sidebar="trigger"
			variant="ghost"
			size="icon"
			className={cn("h-7 w-7", className)}
			onClick={(event) => {
				onClick?.(event);
				toggleSidebar();
			}}
			{...props}
		>
			<PanelLeft />
			<span className="sr-only">Toggle Sidebar</span>
		</Button>
	);
}

export function SidebarRail({
	className,
	...props
}: React.ComponentProps<"button">) {
	const { toggleSidebar } = useSidebar();

	return (
		<button
			data-sidebar="rail"
			aria-label="Toggle Sidebar"
			tabIndex={-1}
			onClick={toggleSidebar}
			title="Toggle Sidebar"
			className={cn(
				"absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] hover:after:bg-sidebar-border group-data-[side=left]:-right-4 group-data-[side=right]:left-0 sm:flex",
				"[[data-side=left]_&]:cursor-w-resize [[data-side=right]_&]:cursor-e-resize",
				"[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
				"group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full group-data-[collapsible=offcanvas]:hover:bg-sidebar",
				"[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
				"[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
				className,
			)}
			{...props}
		/>
	);
}

export const SidebarMenu = React.forwardRef<
	HTMLUListElement,
	React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
	<ul
		className={cn("flex w-full min-w-0 flex-col gap-1", className)}
		data-sidebar="menu"
		ref={ref}
		{...props}
	/>
));
SidebarMenu.displayName = "SidebarMenu";

export const SidebarMenuItem = React.forwardRef<
	HTMLLIElement,
	React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
	<li
		className={cn("group/menu-item relative", className)}
		data-sidebar="menu-item"
		ref={ref}
		{...props}
	/>
));
SidebarMenuItem.displayName = "SidebarMenuItem";

export interface SidebarMenuButtonProps
	extends React.ComponentProps<"button"> {
	asChild?: boolean;
	isActive?: boolean;
	tooltip?: string | React.ComponentProps<any>;
	variant?: "default" | "outline";
	size?: "default" | "sm" | "lg";
}

export const SidebarMenuButton = React.forwardRef<
	HTMLButtonElement,
	SidebarMenuButtonProps
>(({ asChild = false, isActive = false, variant = "default", size = "default", tooltip, className, ...props }, ref) => {
	const Comp = asChild ? SlotPrimitive.Slot : "button";

	return (
		<Comp
			ref={ref}
			data-sidebar="menu-button"
			data-size={size}
			data-active={isActive}
			className={cn(
				"peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
				variant === "outline" && "border border-sidebar-border shadow-sm",
				className,
			)}
			{...props}
		/>
	);
});
SidebarMenuButton.displayName = "SidebarMenuButton";
