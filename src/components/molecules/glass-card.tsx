"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import type React from "react";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const glassCardVariants = cva(
	"relative overflow-hidden rounded-2xl glass-panel transition-colors duration-300",
	{
		variants: {
			variant: {
				default: "hover:bg-white/60 dark:hover:bg-black/30",
				interactive: "cursor-pointer hover:shadow-lg hover:shadow-primary/5",
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
		},
		defaultVariants: {
			variant: "default",
			size: "default",
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
			gradient,
			interactive,
			children,
			onClick,
			onKeyDown,
			...props
		},
		ref,
	) => {
		const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
			if (interactive && (e.key === "Enter" || e.key === " ")) {
				e.preventDefault();
				e.currentTarget.click();
			}
			onKeyDown?.(e);
		};

		return (
			<motion.div
				ref={ref}
				role={interactive ? "button" : undefined}
				tabIndex={interactive ? 0 : undefined}
				onKeyDown={handleKeyDown}
				onClick={onClick}
				className={cn(
					glassCardVariants({ variant, size }),
					interactive &&
						"cursor-pointer hover:shadow-lg hover:shadow-primary/5",
					className,
				)}
				whileHover={interactive ? { y: -4 } : undefined}
				transition={{ type: "spring", stiffness: 400, damping: 25 }}
				{...props}
			>
				{gradient && (
					<div className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-100">
						<div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent mask-image-gradient" />
					</div>
				)}
				<div className="relative z-10">{children}</div>
			</motion.div>
		);
	},
);

GlassCard.displayName = "GlassCard";

export { GlassCard, glassCardVariants };
