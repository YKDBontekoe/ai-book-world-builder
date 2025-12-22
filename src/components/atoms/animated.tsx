"use client";

import { motion, type HTMLMotionProps, type Variants } from "framer-motion";
import * as React from "react";
import {
	fadeIn,
	fastStaggerContainer,
	scaleIn,
	slideDown,
	slideLeft,
	slideRight,
	slideUp,
	staggerContainer,
} from "@/lib/animations";
import { cn } from "@/lib/utils";

// --- FadeIn ---

interface FadeInProps extends HTMLMotionProps<"div"> {
	duration?: number;
	delay?: number;
}

export const FadeIn = React.forwardRef<HTMLDivElement, FadeInProps>(
	({ className, duration, delay, variants, ...props }, ref) => {
		const customVariants = variants || fadeIn;

		return (
			<motion.div
				ref={ref}
				initial="hidden"
				animate="visible"
				exit="hidden"
				variants={customVariants}
				transition={{ duration, delay }}
				className={cn(className)}
				{...props}
			/>
		);
	},
);
FadeIn.displayName = "FadeIn";

// --- SlideIn ---

interface SlideInProps extends HTMLMotionProps<"div"> {
	direction?: "up" | "down" | "left" | "right";
	delay?: number;
}

export const SlideIn = React.forwardRef<HTMLDivElement, SlideInProps>(
	({ className, direction = "up", delay, variants, ...props }, ref) => {
		const getVariant = () => {
			switch (direction) {
				case "up":
					return slideUp;
				case "down":
					return slideDown;
				case "left":
					return slideLeft;
				case "right":
					return slideRight;
				default:
					return slideUp;
			}
		};

		return (
			<motion.div
				ref={ref}
				initial="hidden"
				animate="visible"
				exit="hidden"
				variants={variants || getVariant()}
				transition={{ delay }}
				className={cn(className)}
				{...props}
			/>
		);
	},
);
SlideIn.displayName = "SlideIn";

// --- ScaleIn ---

export const ScaleIn = React.forwardRef<HTMLDivElement, HTMLMotionProps<"div">>(
	({ className, variants, ...props }, ref) => {
		return (
			<motion.div
				ref={ref}
				initial="hidden"
				animate="visible"
				exit="hidden"
				variants={variants || scaleIn}
				className={cn(className)}
				{...props}
			/>
		);
	},
);
ScaleIn.displayName = "ScaleIn";

// --- Stagger Lists ---

interface StaggerListProps extends HTMLMotionProps<"div"> {
	/** If true, uses a tighter stagger delay for long lists */
	fast?: boolean;
}

/**
 * A container that orchestrates the animation of its children.
 * Wrap direct children in `<StaggerItem>` or ensure they have `variants` matching hidden/visible keys.
 */
export const StaggerList = React.forwardRef<HTMLDivElement, StaggerListProps>(
	({ className, fast = false, variants, ...props }, ref) => {
		return (
			<motion.div
				ref={ref}
				initial="hidden"
				animate="visible"
				exit="hidden"
				variants={variants || (fast ? fastStaggerContainer : staggerContainer)}
				className={cn(className)}
				{...props}
			/>
		);
	},
);
StaggerList.displayName = "StaggerList";

interface StaggerItemProps extends HTMLMotionProps<"div"> {
	/**
	 * Optional override variant. Defaults to `slideUp` if not specified,
	 * but contextually inherits from parent StaggerList if left generic.
	 * Actually, to work with StaggerList, this item MUST have variants.
	 * We default to `slideUp` as a safe generic entry.
	 */
	variant?: Variants;
}

export const StaggerItem = React.forwardRef<HTMLDivElement, StaggerItemProps>(
	({ className, variant, ...props }, ref) => {
		return (
			<motion.div
				ref={ref}
				variants={variant || slideUp}
				className={cn(className)}
				{...props}
			/>
		);
	},
);
StaggerItem.displayName = "StaggerItem";
