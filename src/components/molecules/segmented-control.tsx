"use client";

import { motion } from "framer-motion";
import { type JSX, useId } from "react";
import { cn } from "@/lib/utils";

export interface SegmentedControlOption<T = string> {
	id: T;
	label: string;
}

export interface SegmentedControlProps<T = string> {
	options: readonly SegmentedControlOption<T>[];
	value: T;
	onChange: (value: T) => void;
	className?: string;
	size?: "sm" | "md";
	layoutId?: string;
	isLoading?: boolean;
	variant?: "default" | "success" | "error";
	ariaLabel?: string;
}

export function SegmentedControl<T extends string = string>({
	options,
	value,
	onChange,
	className,
	size = "sm",
	layoutId,
	isLoading = false,
	variant = "default",
	ariaLabel,
}: SegmentedControlProps<T>): JSX.Element {
	const generatedId = useId();
	const activeLayoutId = layoutId ?? `segmented-control-${generatedId}`;

	return (
		// biome-ignore lint/a11y/useSemanticElements: "Design system uses div for layout flexibility"
		<div
			role="group"
			aria-label={ariaLabel}
			className={cn(
				"flex p-1 rounded-lg relative isolate w-fit transition-colors duration-200",
				// Glass effect
				"glass",
				// Variant styles (border color)
				variant === "success" && "border border-green-500/50",
				variant === "error" && "border border-red-500/50",
				isLoading && "opacity-70 pointer-events-none cursor-wait",
				className,
			)}
		>
			{options.map((option) => {
				const isActive = option.id === value;
				return (
					<button
						key={option.id}
						onClick={() => onChange(option.id)}
						disabled={isLoading}
						className={cn(
							"relative z-10 px-3 py-1.5 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg",
							isActive
								? cn(
										"text-foreground",
										variant === "success" &&
											"text-green-700 dark:text-green-400",
										variant === "error" && "text-red-700 dark:text-red-400",
									)
								: "text-muted-foreground hover:text-foreground/80",
							size === "md" && "py-2 px-4 text-base",
						)}
						type="button"
						aria-pressed={isActive}
					>
						{isActive && (
							<motion.div
								layoutId={activeLayoutId}
								className={cn(
									"absolute inset-0 bg-background shadow-sm rounded-lg -z-10",
									variant === "success" && "bg-green-500/10",
									variant === "error" && "bg-red-500/10",
								)}
								transition={{
									type: "spring",
									stiffness: 400,
									damping: 25,
								}}
							/>
						)}
						{option.label}
					</button>
				);
			})}
		</div>
	);
}
