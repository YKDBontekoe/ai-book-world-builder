import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const iconButtonVariants = cva(
	"inline-flex items-center justify-center transition-colors",
	{
		variants: {
			size: {
				xs: "h-6 w-6 [&_svg]:h-3 [&_svg]:w-3",
				sm: "h-8 w-8 [&_svg]:h-4 [&_svg]:w-4",
				md: "h-10 w-10 [&_svg]:h-5 [&_svg]:w-5",
			},
		},
		defaultVariants: {
			size: "sm",
		},
	},
);

export interface IconButtonProps
	extends Omit<ButtonProps, "size">,
		VariantProps<typeof iconButtonVariants> {
	/** Icon component to render */
	icon: React.ElementType;
	/** Optional tooltip text */
	tooltip?: string;
	/** Tooltip position */
	tooltipSide?: "top" | "bottom" | "left" | "right";
	/** Screen reader label */
	srLabel?: string;
}

/**
 * An icon-only button component with optional tooltip.
 * Provides consistent sizing and accessibility for icon buttons.
 */
const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
	(
		{
			className,
			icon: Icon,
			tooltip,
			tooltipSide = "top",
			srLabel,
			size,
			variant = "ghost",
			...props
		},
		ref,
	) => {
		const button = (
			<Button
				ref={ref}
				variant={variant}
				className={cn(iconButtonVariants({ size }), className)}
				{...props}
			>
				<Icon aria-hidden="true" />
				{srLabel && <span className="sr-only">{srLabel}</span>}
			</Button>
		);

		if (tooltip) {
			return (
				<Tooltip>
					<TooltipTrigger asChild>{button}</TooltipTrigger>
					<TooltipContent side={tooltipSide}>{tooltip}</TooltipContent>
				</Tooltip>
			);
		}

		return button;
	},
);
IconButton.displayName = "IconButton";

export { IconButton, iconButtonVariants };
