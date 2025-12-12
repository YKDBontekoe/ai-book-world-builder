import { cva, type VariantProps } from "class-variance-authority";
import {
	AlertCircle,
	AlertTriangle,
	CheckCircle2,
	Clock,
	Info,
	Loader2,
} from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

const statusBadgeVariants = cva(
	"inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
	{
		variants: {
			status: {
				success:
					"bg-[var(--status-success-bg)] text-[var(--status-success-foreground)]",
				warning:
					"bg-[var(--status-warning-bg)] text-[var(--status-warning-foreground)]",
				error:
					"bg-[var(--status-error-bg)] text-[var(--status-error-foreground)]",
				info: "bg-[var(--status-info-bg)] text-[var(--status-info-foreground)]",
				pending: "bg-muted text-muted-foreground",
				running:
					"bg-[var(--status-info-bg)] text-[var(--status-info-foreground)]",
			},
		},
		defaultVariants: {
			status: "info",
		},
	},
);

const statusIcons = {
	success: CheckCircle2,
	warning: AlertTriangle,
	error: AlertCircle,
	info: Info,
	pending: Clock,
	running: Loader2,
} as const;

export interface StatusBadgeProps
	extends React.HTMLAttributes<HTMLSpanElement>,
		VariantProps<typeof statusBadgeVariants> {
	showIcon?: boolean;
}

/**
 * A semantic status badge component with consistent colors and optional icons.
 * Displays status information (success, warning, error, info, pending, running).
 */
const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
	(
		{ className, status = "info", showIcon = true, children, ...props },
		ref,
	) => {
		const Icon = status ? statusIcons[status] : null;
		const isRunning = status === "running";

		return (
			<span
				ref={ref}
				className={cn(statusBadgeVariants({ status }), className)}
				{...props}
			>
				{showIcon && Icon && (
					<Icon
						className={cn("h-3 w-3", isRunning && "animate-spin")}
						aria-hidden="true"
					/>
				)}
				{children}
			</span>
		);
	},
);
StatusBadge.displayName = "StatusBadge";

export { StatusBadge, statusBadgeVariants };
