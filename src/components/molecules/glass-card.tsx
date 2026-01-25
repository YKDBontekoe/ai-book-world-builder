import { cva, type VariantProps } from "class-variance-authority";
import type React from "react";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const glassCardVariants = cva(
	"relative overflow-hidden glass-panel transition-all duration-300",
	{
		variants: {
			variant: {
				default: "hover:bg-white/60 dark:hover:bg-black/30",
				interactive:
					"cursor-pointer hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5",
				subtle: "bg-glass/20 border-glass-border/50 backdrop-blur-md",
				liquid:
					"bg-glass/50 backdrop-blur-[30px] border-white/20 shadow-glass hover:bg-glass/70 transition-all duration-500",
			},
			size: {
				default: "p-6",
				sm: "p-4",
				lg: "p-8",
				none: "p-0",
			},
			rounded: {
				lg: "rounded-lg",
				xl: "rounded-xl",
				"2xl": "rounded-2xl",
				md: "rounded-md",
				none: "rounded-none",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
			rounded: "lg",
		},
	},
);

export interface GlassCardProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof glassCardVariants> {
	gradient?: boolean;
	interactive?: boolean;
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
	(
		{
			className,
			variant,
			size,
			rounded,
			gradient,
			interactive,
			children,
			...props
		},
		ref,
	) => {
		return (
			<div
				ref={ref}
				className={cn(
					glassCardVariants({ variant, size, rounded }),
					interactive &&
						"cursor-pointer hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5",
					className,
				)}
				{...props}
			>
				{gradient && (
					<div className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-100">
						<div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent mask-image-gradient" />
					</div>
				)}
				<div className="relative z-10">{children}</div>
			</div>
		);
	},
);

GlassCard.displayName = "GlassCard";

export { GlassCard, glassCardVariants };
