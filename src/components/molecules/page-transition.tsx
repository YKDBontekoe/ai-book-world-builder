"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PageTransitionProps {
	children: React.ReactNode;
	className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 10, scale: 0.99 }}
			animate={{ opacity: 1, y: 0, scale: 1 }}
			exit={{ opacity: 0, y: -10, scale: 0.99 }}
			transition={{
				type: "spring",
				stiffness: 150, // Softer than the "Liquid" standard (400)
				damping: 20,
				mass: 1,
			}}
			className={cn("w-full h-full", className)}
		>
			{children}
		</motion.div>
	);
}
