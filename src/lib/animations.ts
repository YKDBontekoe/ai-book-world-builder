import type { Variants } from "framer-motion";

/**
 * Liquid Glass 2025 Animation System
 *
 * Defines the core physics and motion variants for the application.
 * Focuses on fluid, organic movement using spring physics.
 */

// --- Physics ---

export const springs = {
	/** Standard liquid spring for most interactions */
	liquid: {
		type: "spring",
		stiffness: 400,
		damping: 25,
		mass: 1,
	},
	/** Gentler spring for large elements or page transitions */
	gentle: {
		type: "spring",
		stiffness: 250,
		damping: 25,
		mass: 1,
	},
	/** Bouncier spring for attention-grabbing elements */
	bouncy: {
		type: "spring",
		stiffness: 400,
		damping: 15,
		mass: 1,
	},
	/** Tight spring for small micro-interactions (toggles, icons) */
	snappy: {
		type: "spring",
		stiffness: 600,
		damping: 30,
		mass: 0.8,
	},
} as const;

export const durations = {
	fast: 0.2,
	normal: 0.4,
	slow: 0.6,
} as const;

export const delays = {
	stagger: 0.05,
	short: 0.1,
	medium: 0.2,
	long: 0.4,
} as const;

// --- Variants ---

export const fadeIn: Variants = {
	hidden: {
		opacity: 0,
		transition: { duration: durations.fast },
	},
	visible: {
		opacity: 1,
		transition: { duration: durations.normal },
	},
};

export const scaleIn: Variants = {
	hidden: {
		opacity: 0,
		scale: 0.95,
	},
	visible: {
		opacity: 1,
		scale: 1,
		transition: springs.liquid,
	},
};

export const slideUp: Variants = {
	hidden: {
		opacity: 0,
		y: 20,
	},
	visible: {
		opacity: 1,
		y: 0,
		transition: springs.liquid,
	},
};

export const slideDown: Variants = {
	hidden: {
		opacity: 0,
		y: -20,
	},
	visible: {
		opacity: 1,
		y: 0,
		transition: springs.liquid,
	},
};

export const slideLeft: Variants = {
	hidden: {
		opacity: 0,
		x: 20,
	},
	visible: {
		opacity: 1,
		x: 0,
		transition: springs.liquid,
	},
};

export const slideRight: Variants = {
	hidden: {
		opacity: 0,
		x: -20,
	},
	visible: {
		opacity: 1,
		x: 0,
		transition: springs.liquid,
	},
};

/**
 * Container variant that orchestrates staggered children animations.
 * Children must have variants defined (usually matching 'hidden' and 'visible' keys).
 */
export const staggerContainer: Variants = {
	hidden: { opacity: 1 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: delays.stagger,
			delayChildren: delays.short,
		},
	},
};

/**
 * Faster stagger for lists with many items
 */
export const fastStaggerContainer: Variants = {
	hidden: { opacity: 1 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.03,
			delayChildren: 0,
		},
	},
};
