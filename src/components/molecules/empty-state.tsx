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
	/** Handler for when a suggestion chip is clicked */
	onSuggestionClick?: (suggestion: string) => void;
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
			onSuggestionClick,
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
				className="relative z-10 flex flex-col items-center text-center w-full max-w-md mx-auto"
			>
				{Icon && (
					<div className="relative mb-8">
						{variant === "glass" && (
							<motion.div
								animate={{
									scale: [1, 1.1, 1],
									opacity: [0.3, 0.6, 0.3],
								}}
								transition={{
									duration: 4,
									repeat: Number.POSITIVE_INFINITY,
									ease: "easeInOut",
								}}
								className="absolute inset-0 rounded-3xl bg-primary/20 blur-xl"
							/>
						)}
						<motion.div
							initial={{ opacity: 0, scale: 0.8 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{
								type: "spring",
								stiffness: 400,
								damping: 25,
								delay: 0.2,
							}}
							className={cn(
								"relative flex items-center justify-center transition-all duration-300",
								variant === "glass"
									? "rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 p-6 ring-1 ring-primary/20 shadow-[0_0_20px_-12px_rgba(var(--primary),0.3)]"
									: "rounded-full bg-muted/20 p-4",
							)}
						>
							<Icon
								className={cn(
									variant === "glass"
										? "h-10 w-10 text-primary drop-shadow-sm"
										: "h-6 w-6 text-muted-foreground/50",
									iconClassName,
								)}
								aria-hidden="true"
							/>
						</motion.div>
					</div>
				)}
				<h4 className="font-semibold text-xl tracking-tight text-foreground/90">
					{title}
				</h4>
				{description && (
					<p className="mt-3 text-base text-muted-foreground/80 leading-relaxed font-medium">
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
						{suggestions.map((suggestion) => {
							const Component = onSuggestionClick ? "button" : "span";
							const interactionProps = onSuggestionClick
								? {
										onClick: () => onSuggestionClick(suggestion),
										type: "button" as const,
									}
								: {};

							return (
								<Component
									key={suggestion}
									className={cn(
										"rounded-full border px-3 py-1.5 transition-colors",
										onSuggestionClick
											? "cursor-pointer hover:border-primary/30 hover:bg-primary/5"
											: "cursor-default",
										variant === "glass"
											? "bg-background/50 backdrop-blur-sm shadow-sm"
											: "",
									)}
									{...interactionProps}
								>
									{suggestion}
								</Component>
							);
						})}
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
						"group relative overflow-hidden flex flex-col items-center justify-center p-12 min-h-[400px]",
						className,
					)}
					{...props}
				>
					{/* Ambient Background Glow */}
					<div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-1/2 bg-gradient-to-b from-primary/5 to-transparent blur-3xl opacity-50" />

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
