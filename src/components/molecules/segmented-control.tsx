"use client";

import { motion } from "framer-motion";
import { type JSX, useId } from "react";
import { cn } from "@/lib/utils";

export interface SegmentedControlOption {
	id: string;
	label: string;
}

interface SegmentedControlProps {
	options: SegmentedControlOption[];
	value: string;
	onChange: (value: string) => void;
	className?: string;
	size?: "sm" | "md";
	layoutId?: string;
}

export function SegmentedControl({
	options,
	value,
	onChange,
	className,
	size = "sm",
	layoutId,
}: SegmentedControlProps): JSX.Element {
	const generatedId = useId();
	const activeLayoutId = layoutId ?? `segmented-control-${generatedId}`;

	return (
		<div
			className={cn(
				"flex p-1 bg-muted/80 backdrop-blur-sm rounded-lg relative isolate w-fit",
				className,
			)}
		>
			{options.map((option) => {
				const isActive = option.id === value;
				return (
					<button
						key={option.id}
						onClick={() => onChange(option.id)}
						className={cn(
							"relative z-10 px-3 py-1.5 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md",
							isActive
								? "text-foreground"
								: "text-muted-foreground hover:text-foreground/80",
							size === "md" && "py-2 px-4 text-base",
						)}
						type="button"
						aria-pressed={isActive}
					>
						{isActive && (
							<motion.div
								layoutId={activeLayoutId}
								className="absolute inset-0 bg-background shadow-sm rounded-md -z-10"
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
