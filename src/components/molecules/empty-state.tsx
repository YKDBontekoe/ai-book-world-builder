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
		if (variant === "glass") {
			return (
				<GlassCard
					ref={ref}
					variant="liquid"
					className={cn(
						"flex flex-col items-center justify-center p-12 text-center",
						className,
					)}
					{...props}
				>
					{Icon && (
						<div className="mb-6 rounded-2xl bg-primary/10 p-5 ring-1 ring-primary/20">
							<Icon
								className={cn("h-8 w-8 text-primary", iconClassName)}
								aria-hidden="true"
							/>
						</div>
					)}
					<h4 className="font-bold text-lg tracking-tight">{title}</h4>
					{description && (
						<p className="mt-2 max-w-sm text-sm text-muted-foreground leading-relaxed">
							{description}
						</p>
					)}
					{action && <div className="mt-8">{action}</div>}
					{suggestions && suggestions.length > 0 && (
						<div className="mt-6 flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
							{suggestions.map((suggestion) => (
								<span
									key={suggestion}
									className="rounded-full bg-background/50 border px-3 py-1.5 backdrop-blur-sm"
								>
									{suggestion}
								</span>
							))}
						</div>
					)}
				</GlassCard>
			);
		}

		return (
			<div
				ref={ref}
				className={cn(
					"flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/10 p-8 text-center",
					className,
				)}
				{...props}
			>
				{Icon && (
					<div className="mb-4 rounded-full bg-muted/20 p-4">
						<Icon
							className={cn("h-6 w-6 text-muted-foreground/50", iconClassName)}
							aria-hidden="true"
						/>
					</div>
				)}
				<h4 className="font-medium text-sm">{title}</h4>
				{description && (
					<p className="mt-1 max-w-xs text-xs text-muted-foreground">
						{description}
					</p>
				)}
				{action && <div className="mt-4">{action}</div>}
				{suggestions && suggestions.length > 0 && (
					<div className="mt-4 flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
						{suggestions.map((suggestion) => (
							<span key={suggestion} className="rounded-full border px-2 py-1">
								{suggestion}
							</span>
						))}
					</div>
				)}
			</div>
		);
	},
);
EmptyState.displayName = "EmptyState";

export { EmptyState };
