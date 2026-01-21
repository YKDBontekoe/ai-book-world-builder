"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export function WizardGeneratingStep() {
	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.95 }}
			animate={{ opacity: 1, scale: 1 }}
			exit={{ opacity: 0, scale: 1.05 }}
			className="flex flex-col items-center justify-center space-y-4"
			key="generating"
		>
			<Loader2 className="w-12 h-12 animate-spin text-primary" />
			<p className="text-lg font-medium animate-pulse">
				Designing your story structure...
			</p>
		</motion.div>
	);
}
