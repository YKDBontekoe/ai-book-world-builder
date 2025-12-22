import { cva, type VariantProps } from "class-variance-authority";
import { Lightbulb } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

const tipCardVariants = cva(
	"flex items-start gap-3 rounded-xl border p-3 backdrop-blur-sm",
	{
		variants: {
			variant: {
				info: "border-blue-500/20 bg-blue-500/5",
				warning: "border-amber-500/20 bg-amber-500/5",
				success: "border-emerald-500/20 bg-emerald-500/5",
				error: "border-red-500/20 bg-red-500/5",
			},
		},
		defaultVariants: {
			variant: "info",
		},
	},
);

const tipCardIconColors = {
	info: "text-blue-500",
	warning: "text-amber-500",
	success: "text-emerald-500",
	error: "text-red-500",
} as const;

const tipCardTextColors = {
	info: "text-blue-700 dark:text-blue-300",
	warning: "text-amber-700 dark:text-amber-300",
	success: "text-emerald-700 dark:text-emerald-300",
	error: "text-red-700 dark:text-red-300",
} as const;

export interface TipCardProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof tipCardVariants> {
	/** Custom icon component (defaults to Lightbulb) */
	icon?: React.ElementType;
}

/**
 * A tip/info card component for displaying helpful hints and callouts.
 * Used primarily in configuration panels for user guidance.
 */
const TipCard = React.forwardRef<HTMLDivElement, TipCardProps>(
	(
		{ className, variant = "info", icon: Icon = Lightbulb, children, ...props },
		ref,
	) => {
		return (
			<div
				ref={ref}
				className={cn(tipCardVariants({ variant }), className)}
				{...props}
			>
				<Icon
					className={cn(
						"mt-0.5 h-4 w-4 shrink-0",
						tipCardIconColors[variant || "info"],
					)}
					aria-hidden="true"
				/>
				<div className={cn("text-sm", tipCardTextColors[variant || "info"])}>
					{children}
				</div>
			</div>
		);
	},
);
TipCard.displayName = "TipCard";

export { TipCard, tipCardVariants };
