"use client";

import { CheckCircle2 } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

interface SelectionCardProps
	extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "title"> {
	selected?: boolean;
	recommended?: boolean;
	title: React.ReactNode;
	description?: React.ReactNode;
	icon?: React.ReactNode;
	pricing?: React.ReactNode;
	footer?: React.ReactNode;
	action?: React.ReactNode;
}

export const SelectionCard = React.forwardRef<
	HTMLButtonElement,
	SelectionCardProps
>(
	(
		{
			className,
			selected,
			recommended,
			title,
			description,
			icon,
			pricing,
			footer,
			action,
			children,
			...props
		},
		ref,
	) => {
		return (
			<button
				ref={ref}
				type="button"
				className={cn(
					"group relative flex w-full flex-col gap-3 rounded-lg border p-3 text-left transition-all",
					selected
						? "border-primary bg-primary/5 ring-1 ring-primary"
						: "border-border/50 bg-background/50 hover:bg-muted/50 hover:border-border",
					recommended && !selected && "border-amber-500/40",
					className,
				)}
				{...props}
			>
				<div className="flex w-full items-start gap-3">
					{/* Leading Icon/Avtar */}
					{icon && <div className="shrink-0">{icon}</div>}

					{/* Main Content */}
					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-2">
							<span className="font-medium truncate">{title}</span>
							{recommended && (
								<span className="inline-flex items-center rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
									Recommended
								</span>
							)}
						</div>
						{description && (
							<p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
								{description}
							</p>
						)}
						{pricing && (
							<div className="mt-1 text-xs text-primary">{pricing}</div>
						)}
						{footer && (
							<div className="mt-2 text-xs text-muted-foreground">{footer}</div>
						)}
					</div>

					{/* Action (e.g. Delete button) */}
					{action && <div className="z-10 relative">{action}</div>}
				</div>

				{/* Selection Indicator */}
				{selected && (
					<div className="absolute right-2 top-2">
						<CheckCircle2 className="h-4 w-4 text-primary" aria-hidden="true" />
					</div>
				)}

				{children}
			</button>
		);
	},
);
SelectionCard.displayName = "SelectionCard";
