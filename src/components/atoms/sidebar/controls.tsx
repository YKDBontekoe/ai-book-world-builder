"use client";

import { useSidebar } from "@/components/atoms/sidebar/provider";
import { cn } from "@/lib/utils";
import { PanelLeft } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/atoms/button";
import { Sheet, SheetContent } from "@/components/atoms/sheet";

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

// Additional components required by AdminSidebar
export function Sidebar({
	side = "left",
	variant = "sidebar",
	collapsible = "offcanvas",
	className,
	children,
	...props
}: React.ComponentProps<"div"> & {
	side?: "left" | "right";
	variant?: "sidebar" | "floating" | "inset";
	collapsible?: "offcanvas" | "icon" | "none";
}) {
	const { isMobile, state, openMobile, setOpenMobile } = useSidebar();

	if (collapsible === "none") {
		return (
			<div
				className={cn(
					"flex h-full w-[--sidebar-width] flex-col bg-sidebar text-sidebar-foreground",
					className,
				)}
				{...props}
			>
				{children}
			</div>
		);
	}

	if (isMobile) {
		return (
			<Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
				<SheetContent
					data-sidebar="sidebar"
					data-mobile="true"
					className="w-[--sidebar-width] bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden"
					style={
						{
							"--sidebar-width": "18rem", // 288px
						} as React.CSSProperties
					}
					side={side}
				>
					<div className="flex h-full w-full flex-col">{children}</div>
				</SheetContent>
			</Sheet>
		);
	}

	return (
		<div
			className="group peer hidden md:block text-sidebar-foreground"
			data-state={state}
			data-collapsible={state === "collapsed" ? collapsible : ""}
			data-variant={variant}
			data-side={side}
		>
			<div
				className={cn(
					"duration-200 relative h-svh w-[--sidebar-width] bg-transparent transition-[width] ease-linear",
					"group-data-[collapsible=offcanvas]:w-0",
					"group-data-[side=right]:rotate-180",
					variant === "floating" || variant === "inset"
						? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4))]"
						: "group-data-[collapsible=icon]:w-[--sidebar-width-icon]",
				)}
			/>
			<div
				className={cn(
					"duration-200 fixed inset-y-0 z-10 hidden h-svh w-[--sidebar-width] transition-[left,right,width] ease-linear md:flex",
					side === "left"
						? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
						: "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
					// Adjustments for floating/inset
					variant === "floating" || variant === "inset"
						? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4)_+_2px)]"
						: "group-data-[collapsible=icon]:w-[--sidebar-width-icon] group-data-[side=left]:border-r group-data-[side=right]:border-l",
					className,
				)}
				{...props}
			>
				<div
					data-sidebar="sidebar"
					className="flex h-full w-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow"
				>
					{children}
				</div>
			</div>
		</div>
	);
}

export function SidebarHeader({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			data-sidebar="header"
			className={cn("flex flex-col gap-2 p-2", className)}
			{...props}
		/>
	);
}

export function SidebarContent({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			data-sidebar="content"
			className={cn(
				"flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
				className,
			)}
			{...props}
		/>
	);
}

export function SidebarGroup({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			data-sidebar="group"
			className={cn("relative flex w-full min-w-0 flex-col p-2", className)}
			{...props}
		/>
	);
}

export function SidebarGroupLabel({
	className,
	asChild = false,
	...props
}: React.ComponentProps<"div"> & { asChild?: boolean }) {
    // biome-ignore lint/suspicious/noExplicitAny: generic
	const Comp = asChild ? (React.Fragment as any) : "div";

	return (
		<Comp
			data-sidebar="group-label"
			className={cn(
				"duration-200 flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 outline-none ring-sidebar-ring transition-[margin,opa] ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
				"group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
				className,
			)}
			{...props}
		/>
	);
}

export function SidebarGroupContent({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			data-sidebar="group-content"
			className={cn("w-full text-sm", className)}
			{...props}
		/>
	);
}

export function SidebarMenu({
	className,
	...props
}: React.ComponentProps<"ul">) {
	return (
		<ul
			data-sidebar="menu"
			className={cn("flex w-full min-w-0 flex-col gap-1", className)}
			{...props}
		/>
	);
}

export function SidebarMenuItem({
	className,
	...props
}: React.ComponentProps<"li">) {
	return (
		<li
			data-sidebar="menu-item"
			className={cn("group/menu-item relative", className)}
			{...props}
		/>
	);
}

export const SidebarMenuButton = React.forwardRef<
	HTMLButtonElement,
	React.ComponentProps<"button"> & {
		asChild?: boolean;
		isActive?: boolean;
		tooltip?: string | React.ComponentProps<typeof Button>;
	}
>(({ asChild = false, isActive = false, variant = "default", size = "default", tooltip, className, ...props }, ref) => {
	// biome-ignore lint/suspicious/noExplicitAny: generic
    const Comp = asChild ? (React.Fragment as any) : "button";

    // Simplified for now, complex tooltip handling skipped
	const button = (
		<Comp
			ref={ref}
			data-sidebar="menu-button"
			data-size={size}
			data-active={isActive}
			className={cn(
				"peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
				className,
			)}
			{...props}
		/>
	);

    return button;
});
SidebarMenuButton.displayName = "SidebarMenuButton";
