import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { cn } from "../../lib/utils";

const loadingSpinnerVariants = cva("animate-spin", {
	variants: {
		size: {
			xs: "h-3 w-3",
			sm: "h-4 w-4",
			md: "h-6 w-6",
			lg: "h-8 w-8",
		},
		variant: {
			default: "text-foreground",
			primary: "text-primary",
			muted: "text-muted-foreground",
			success: "text-[var(--status-success)]",
			warning: "text-[var(--status-warning)]",
			error: "text-[var(--status-error)]",
			info: "text-[var(--status-info)]",
		},
	},
	defaultVariants: {
		size: "sm",
		variant: "muted",
	},
});

export interface LoadingSpinnerProps
	extends React.HTMLAttributes<SVGSVGElement>,
		VariantProps<typeof loadingSpinnerVariants> {}

/**
 * A unified loading spinner component with consistent sizing and color variants.
 * Replaces scattered Loader2 instances throughout the codebase.
 */
const LoadingSpinner = React.forwardRef<SVGSVGElement, LoadingSpinnerProps>(
	({ className, size, variant, ...props }, ref) => {
		return (
			<Loader2
				ref={ref}
				className={cn(loadingSpinnerVariants({ size, variant }), className)}
				{...props}
			/>
		);
	},
);
LoadingSpinner.displayName = "LoadingSpinner";

export { LoadingSpinner, loadingSpinnerVariants };
