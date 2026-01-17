import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { GlassCard } from "@/components/molecules/glass-card";

interface PowerDockResultProps {
	result: string | null;
	onClear: () => void;
	onInsert: () => void;
	onCopy: () => void;
}

export function PowerDockResult({
	result,
	onClear,
	onInsert,
	onCopy,
}: PowerDockResultProps): React.ReactNode {
	return (
		<AnimatePresence>
			{result && (
				<motion.div
					initial={{ opacity: 0, y: 20, scale: 0.9 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					exit={{ opacity: 0, y: 20, scale: 0.9 }}
					transition={{ type: "spring", stiffness: 400, damping: 25 }}
					className="mb-2 w-[500px] max-w-full"
				>
					<GlassCard
						variant="liquid"
						className="p-4 rounded-xl border-white/20 relative"
					>
						<div className="flex justify-between items-center mb-2">
							<span className="text-xs font-bold uppercase text-muted-foreground">
								Result
							</span>
							<button
								type="button"
								onClick={onClear}
								aria-label="Clear result"
								className="hover:bg-white/10 p-1 rounded"
							>
								<X className="w-3 h-3" />
							</button>
						</div>
						<div className="max-h-60 overflow-y-auto text-sm font-mono bg-muted/50 border border-border/50 p-3 rounded-lg custom-scrollbar">
							{result}
						</div>
						<div className="mt-2 flex items-center justify-between gap-2">
							<button
								type="button"
								onClick={onInsert}
								className="flex-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
							>
								Insert into Editor
							</button>
							<button
								type="button"
								onClick={onCopy}
								className="px-3 py-1.5 text-xs font-medium rounded-lg bg-muted hover:bg-muted/80 transition-colors"
							>
								Copy
							</button>
						</div>
					</GlassCard>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
