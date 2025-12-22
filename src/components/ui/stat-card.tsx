import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const statCardVariants = cva(
	"rounded-xl border p-4 text-center backdrop-blur-sm",
	{
		variants: {
			variant: {
				default: "border-border/50 bg-background/50",
				primary: "border-primary/20 bg-primary/5",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

const iconColors = {
	default: "text-muted-foreground",
	primary: "text-primary",
	blue: "text-blue-500",
	violet: "text-violet-500",
	amber: "text-amber-500",
	emerald: "text-emerald-500",
	pink: "text-pink-500",
} as const;

export interface StatCardProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof statCardVariants> {
	/** Icon component to display */
	icon: React.ReactNode;
	/** Main value to display */
	value: string | number;
	/** Label describing the value */
	label: string;
	/** Icon color variant */
	iconColor?: keyof typeof iconColors;
}

/**
 * A stat display card with icon, value, and label.
 * Used for displaying key metrics in dashboards.
 */
const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
	(
		{ className, variant, icon, value, label, iconColor = "default", ...props },
		ref,
	) => {
		return (
			<div
				ref={ref}
				className={cn(statCardVariants({ variant }), className)}
				{...props}
			>
				<span
					className={cn("mx-auto block h-5 w-5", iconColors[iconColor])}
					aria-hidden="true"
				>
					{icon}
				</span>
				<p className="mt-2 font-mono text-2xl font-bold">{value}</p>
				<p className="text-xs text-muted-foreground">{label}</p>
			</div>
		);
	},
);
StatCard.displayName = "StatCard";

export { StatCard, statCardVariants };
