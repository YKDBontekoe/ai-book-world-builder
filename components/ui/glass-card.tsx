import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "../../lib/utils";

const glassCardVariants = cva("border backdrop-blur-[40px] shadow-sm transition-all duration-300 ease-[var(--ease-liquid)]", {
	variants: {
		variant: {
			default: "border-glass-border bg-glass",
			primary: "border-primary/20 bg-primary/10",
			success:
				"border-[var(--status-success)]/20 bg-[var(--status-success-bg)]",
			warning:
				"border-[var(--status-warning)]/20 bg-[var(--status-warning-bg)]",
			error: "border-[var(--status-error)]/20 bg-[var(--status-error-bg)]",
			info: "border-[var(--status-info)]/20 bg-[var(--status-info-bg)]",
            ghost: "border-transparent bg-transparent hover:bg-glass/50",
            liquid: "border-glass-border/40 bg-glass/50 hover:bg-glass/80 hover:shadow-xl hover:scale-[1.01] shadow-sm backdrop-blur-[30px]"
		},
		padding: {
			none: "p-0",
			sm: "p-3",
			md: "p-5",
			lg: "p-8",
		},
		rounded: {
			md: "rounded-md",
			lg: "rounded-lg",
			xl: "rounded-xl",
			"2xl": "rounded-2xl",
            "3xl": "rounded-3xl",
		},
		interactive: {
			true: "cursor-pointer hover:bg-glass-input/80 hover:shadow-md",
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
 * Uses the "Liquid Glass 2025" design tokens.
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
