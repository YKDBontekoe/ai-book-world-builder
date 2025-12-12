"use client";

import { motion } from "framer-motion";
import {
	BotIcon,
	ChevronDownIcon,
	ChevronUpIcon,
	SparklesIcon,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function AgentCapabilities({ className }: { className?: string }) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div className={cn("flex flex-col gap-2", className)}>
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors w-fit"
			>
				<SparklesIcon className="size-3" />
				<span>What can I do?</span>
				{isOpen ? (
					<ChevronUpIcon className="size-3" />
				) : (
					<ChevronDownIcon className="size-3" />
				)}
			</button>

			{isOpen && (
				<motion.div
					initial={{ opacity: 0, height: 0 }}
					animate={{ opacity: 1, height: "auto" }}
					exit={{ opacity: 0, height: 0 }}
					className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-muted/30 rounded-lg border text-xs"
				>
					<div className="space-y-1">
						<div className="font-semibold text-primary flex items-center gap-1">
							<BotIcon className="size-3" /> World Building
						</div>
						<p className="text-muted-foreground">
							"Create 5 sci-fi characters", "Add a magic system", "Update the
							protagonist's backstory"
						</p>
					</div>

					<div className="space-y-1">
						<div className="font-semibold text-primary flex items-center gap-1">
							<BotIcon className="size-3" /> Storytelling
						</div>
						<p className="text-muted-foreground">
							"Outline a mystery novel", "Draft chapter 1", "Create 3 scenes for
							chapter 2"
						</p>
					</div>

					<div className="space-y-1">
						<div className="font-semibold text-primary flex items-center gap-1">
							<BotIcon className="size-3" /> Analysis
						</div>
						<p className="text-muted-foreground">
							"Analyze character relationships", "Assess story readiness", "Run
							diagnostics on plot holes"
						</p>
					</div>

					<div className="space-y-1">
						<div className="font-semibold text-primary flex items-center gap-1">
							<BotIcon className="size-3" /> Context Aware
						</div>
						<p className="text-muted-foreground">
							I know your project state! Ask me to "Make this chapter scarier"
							or "Fix the pacing".
						</p>
					</div>
				</motion.div>
			)}
		</div>
	);
}
