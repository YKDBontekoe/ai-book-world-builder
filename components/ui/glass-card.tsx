import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const glassCardVariants = cva("border backdrop-blur-sm transition-all", {
	variants: {
		variant: {
			default: "border-border/50 bg-[var(--glass-bg)]",
			primary: "border-primary/20 bg-primary/5",
			success:
				"border-[var(--status-success)]/20 bg-[var(--status-success-bg)]",
			warning:
				"border-[var(--status-warning)]/20 bg-[var(--status-warning-bg)]",
			error: "border-[var(--status-error)]/20 bg-[var(--status-error-bg)]",
			info: "border-[var(--status-info)]/20 bg-[var(--status-info-bg)]",
		},
		padding: {
			none: "p-0",
			sm: "p-3",
			md: "p-4",
			lg: "p-6",
		},
		rounded: {
			md: "rounded-md",
			lg: "rounded-lg",
			xl: "rounded-xl",
			"2xl": "rounded-2xl",
		},
		interactive: {
			true: "cursor-pointer hover:bg-accent/50 hover:shadow-md",
			false: "",
		},
	},
	defaultVariants: {
		variant: "default",
		padding: "md",
		rounded: "xl",
		interactive: false,
	},
});

export interface GlassCardProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof glassCardVariants> {}

/**
 * A glassmorphism-styled card component with blur and transparency effects.
 * Used primarily in generation pages for a modern, layered UI appearance.
 */
const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
	({ className, variant, padding, rounded, interactive, ...props }, ref) => {
		return (
			<div
				ref={ref}
				className={cn(
					glassCardVariants({ variant, padding, rounded, interactive }),
					className,
				)}
				{...props}
			/>
		);
	},
);
GlassCard.displayName = "GlassCard";

export { GlassCard, glassCardVariants };
