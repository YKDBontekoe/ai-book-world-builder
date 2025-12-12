"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface InteractiveWidgetProps {
	children: ReactNode;
	className?: string;
	isEditing?: boolean;
	headerIcon?: ReactNode;
	headerTitle?: string;
	headerSubtitle?: string;
	headerColor?: string;
	headerEnd?: ReactNode;
	isError?: boolean;
}

export function InteractiveWidget({
	children,
	className,
	isEditing = false,
	isError = false,
	headerIcon,
	headerTitle,
	headerSubtitle,
	headerColor = "bg-primary/10 text-primary",
	headerEnd,
}: InteractiveWidgetProps) {
	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.95 }}
			animate={{ opacity: 1, scale: 1 }}
			className={cn(
				"group relative flex w-full max-w-sm flex-col overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm transition-all",
				isError ? "border-red-500/50 bg-red-50/50 dark:bg-red-950/10" : "",
				isEditing
					? "ring-2 ring-primary ring-offset-2 dark:ring-offset-background"
					: "hover:shadow-md",
				className,
			)}
		>
			{(headerTitle || headerIcon) && (
				<div className="flex flex-row items-center gap-3 border-b bg-muted/20 px-4 py-3">
					{headerIcon && (
						<div
							className={cn(
								"flex size-10 items-center justify-center rounded-xl ring-1 ring-inset ring-black/5 dark:ring-white/10",
								headerColor,
							)}
						>
							{headerIcon}
						</div>
					)}
					<div className="flex flex-1 flex-col overflow-hidden">
						{headerTitle && (
							<div className="truncate font-medium text-sm">{headerTitle}</div>
						)}
						{headerSubtitle && (
							<div className="truncate font-medium text-muted-foreground text-xs opacity-70">
								{headerSubtitle}
							</div>
						)}
					</div>
					{headerEnd && (
						<div className="flex shrink-0 items-center">{headerEnd}</div>
					)}
				</div>
			)}

			<div className="flex flex-col">{children}</div>
		</motion.div>
	);
}
