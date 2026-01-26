"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Copy, Download, X } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { GlassCard } from "@/components/molecules/glass-card";

interface BulkActionsToolbarProps {
	selectedCount: number;
	onClear: () => void;
	onCopy: () => void;
	onExport: () => void;
}

export function BulkActionsToolbar({
	selectedCount,
	onClear,
	onCopy,
	onExport,
}: BulkActionsToolbarProps) {
	return (
		<AnimatePresence>
			{selectedCount > 0 && (
				<motion.div
					initial={{ y: 100, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					exit={{ y: 100, opacity: 0 }}
					transition={{ type: "spring", stiffness: 300, damping: 30 }}
					className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
				>
					<GlassCard className="flex items-center gap-2 p-2 pl-4 rounded-full shadow-2xl border-primary/20 bg-background/80 backdrop-blur-xl">
						<span className="text-sm font-medium mr-2 text-foreground">
							{selectedCount} selected
						</span>

						<div className="h-4 w-px bg-border/50 mx-1" />

						<Button
							variant="ghost"
							size="sm"
							onClick={onCopy}
							className="h-8 rounded-full gap-2 hover:bg-primary/10 hover:text-primary transition-colors"
						>
							<Copy className="w-4 h-4" />
							Copy
						</Button>

						<Button
							variant="ghost"
							size="sm"
							onClick={onExport}
							className="h-8 rounded-full gap-2 hover:bg-primary/10 hover:text-primary transition-colors"
						>
							<Download className="w-4 h-4" />
							Export
						</Button>

						<div className="h-4 w-px bg-border/50 mx-1" />

						<Button
							variant="ghost"
							size="icon"
							onClick={onClear}
							className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
						>
							<X className="w-4 h-4" />
						</Button>
					</GlassCard>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
