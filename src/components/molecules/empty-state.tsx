"use client";

import { motion } from "framer-motion";
import * as React from "react";
import { GlassCard } from "@/components/molecules/glass-card";
import { cn } from "@/lib/utils";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
	/** Icon component to display */
	icon?: React.ElementType;
	/** Main title text */
	title: string;
	/** Optional description text */
	description?: string;
	/** Optional icon color class */
	iconClassName?: string;
	/** Optional action element (button, link, etc.) */
	action?: React.ReactNode;
	/** Optional suggestion chips to display */
	suggestions?: string[];
	/** Visual style variant */
	variant?: "dashed" | "glass";
}

/**
 * A reusable empty state component for when there's no content to display.
 * Provides consistent layout with icon, title, description, and optional actions.
 */
const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
	(
		{
			className,
			icon: Icon,
			title,
			description,
			iconClassName,
			action,
			suggestions,
			variant = "dashed",
			...props
		},
		ref,
	) => {
		const Content = (
			<motion.div
				initial={{ opacity: 0, scale: 0.95, y: 10 }}
				animate={{ opacity: 1, scale: 1, y: 0 }}
				transition={{
					type: "spring",
					stiffness: 400,
					damping: 25,
					delay: 0.1,
				}}
				className="flex flex-col items-center text-center w-full"
			>
				{Icon && (
					<motion.div
						initial={{ opacity: 0, scale: 0.8 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{
							type: "spring",
							stiffness: 300,
							damping: 20,
							delay: 0.2,
						}}
						className={cn(
							"mb-6 flex items-center justify-center",
							variant === "glass"
								? "rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 p-5 ring-1 ring-primary/20 shadow-sm"
								: "rounded-full bg-muted/20 p-4",
						)}
					>
						<Icon
							className={cn(
								variant === "glass"
									? "h-8 w-8 text-primary"
									: "h-6 w-6 text-muted-foreground/50",
								iconClassName,
							)}
							aria-hidden="true"
						/>
					</motion.div>
				)}
				<h4 className="font-bold text-lg tracking-tight text-foreground">
					{title}
				</h4>
				{description && (
					<p className="mt-2 max-w-sm text-sm text-muted-foreground leading-relaxed">
						{description}
					</p>
				)}
				{action && (
					<motion.div
						initial={{ opacity: 0, y: 5 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3 }}
						className={cn("mt-8", variant === "glass" ? "" : "mt-4")}
					>
						{action}
					</motion.div>
				)}
				{suggestions && suggestions.length > 0 && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.4 }}
						className={cn(
							"mt-6 flex flex-wrap justify-center gap-2 text-xs text-muted-foreground",
							variant === "glass" ? "" : "mt-4",
						)}
					>
						{suggestions.map((suggestion) => (
							<span
								key={suggestion}
								className={cn(
									"rounded-full border px-3 py-1.5 transition-colors hover:border-primary/30 hover:bg-primary/5 cursor-default",
									variant === "glass"
										? "bg-background/50 backdrop-blur-sm shadow-sm"
										: "",
								)}
							>
								{suggestion}
							</span>
						))}
					</motion.div>
				)}
			</motion.div>
		);

		if (variant === "glass") {
			return (
				<GlassCard
					ref={ref}
					variant="liquid"
					data-testid="empty-state-container"
					className={cn(
						"flex flex-col items-center justify-center p-12 min-h-[300px]",
						className,
					)}
					{...props}
				>
					{Content}
				</GlassCard>
			);
		}

		return (
			<div
				ref={ref}
				data-testid="empty-state-container"
				className={cn(
					"flex flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/5 p-12 text-center",
					className,
				)}
				{...props}
			>
				{Content}
			</div>
		);
	},
);
EmptyState.displayName = "EmptyState";

export { EmptyState };
