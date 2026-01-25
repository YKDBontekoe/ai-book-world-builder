"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Copy, Download, X } from "lucide-react";
import type { JSX } from "react";
import { Button } from "@/components/atoms/button";
import { GlassCard } from "@/components/molecules/glass-card";

interface BulkActionsToolbarProps {
	selectedCount: number;
	onCopy: () => void;
	onExport: () => void;
	onClear: () => void;
}

export function BulkActionsToolbar({
	selectedCount,
	onCopy,
	onExport,
	onClear,
}: BulkActionsToolbarProps): JSX.Element {
	return (
		<AnimatePresence>
			{selectedCount > 0 && (
				<motion.div
					initial={{ y: 100, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					exit={{ y: 100, opacity: 0 }}
					transition={{ type: "spring", stiffness: 400, damping: 25 }}
					className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
				>
					<GlassCard className="flex items-center gap-2 p-2 pr-4 rounded-full shadow-2xl border-primary/20 bg-background/80 backdrop-blur-xl">
						<div className="flex items-center gap-2 pl-4 pr-2 border-r border-border/50">
							<span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
								{selectedCount}
							</span>
							<span className="text-sm font-medium text-foreground/80">
								Selected
							</span>
						</div>

						<Button
							variant="ghost"
							size="sm"
							onClick={onCopy}
							className="h-8 gap-2 hover:bg-primary/10 hover:text-primary rounded-full"
						>
							<Copy className="w-4 h-4" />
							Copy
						</Button>

						<Button
							variant="ghost"
							size="sm"
							onClick={onExport}
							className="h-8 gap-2 hover:bg-primary/10 hover:text-primary rounded-full"
						>
							<Download className="w-4 h-4" />
							Export
						</Button>

						<div className="w-px h-4 bg-border/50 mx-1" />

						<Button
							variant="ghost"
							size="icon"
							onClick={onClear}
							className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive rounded-full"
						>
							<X className="w-4 h-4" />
						</Button>
					</GlassCard>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
