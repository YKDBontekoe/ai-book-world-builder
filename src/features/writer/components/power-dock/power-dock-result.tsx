import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, X } from "lucide-react";
import * as ReactNamespace from "react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/atoms/button";
import { GlassCard } from "@/components/molecules/glass-card";
import { cn } from "@/lib/utils";

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
}: PowerDockResultProps): ReactNamespace.JSX.Element {
	const [copied, setCopied] = useState(false);
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, []);

	const handleCopy = () => {
		onCopy();
		setCopied(true);

		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}

		timeoutRef.current = setTimeout(() => {
			setCopied(false);
			timeoutRef.current = null;
		}, 2000);
	};

	return (
		<AnimatePresence>
			{result && (
				<motion.div
					initial={{ opacity: 0, y: 20, scale: 0.95 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					exit={{ opacity: 0, y: 10, scale: 0.95 }}
					transition={{ type: "spring", stiffness: 400, damping: 25 }}
					className="mb-2 w-[500px] max-w-full z-50 origin-bottom"
				>
					<GlassCard
						variant="liquid"
						className="p-3 rounded-xl border-white/20 relative shadow-2xl backdrop-blur-2xl"
					>
						<div className="flex justify-between items-center mb-2 px-1">
							<span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
								Generation Result
							</span>
							<Button
								variant="ghost"
								size="icon"
								className="h-5 w-5 hover:bg-white/10"
								onClick={onClear}
								aria-label="Clear result"
							>
								<X className="w-3 h-3" />
							</Button>
						</div>

						<div className="max-h-60 overflow-y-auto custom-scrollbar rounded-lg bg-black/20 border border-white/5 p-3">
							<div className="text-sm font-mono leading-relaxed text-foreground/90 whitespace-pre-wrap">
								{result}
							</div>
						</div>

						<div className="mt-2 flex items-center gap-2">
							<Button
								size="sm"
								onClick={onInsert}
								className="flex-1 h-7 text-xs font-medium shadow-none"
							>
								Insert into Editor
							</Button>
							<Button
								variant="secondary"
								size="sm"
								onClick={handleCopy}
								className={cn(
									"h-7 text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/10 shadow-none transition-all",
									copied &&
										"text-green-400 border-green-400/20 bg-green-400/10",
								)}
							>
								{copied ? (
									<Check className="mr-1.5 h-3 w-3" />
								) : (
									<Copy className="mr-1.5 h-3 w-3" />
								)}
								{copied ? "Copied" : "Copy"}
							</Button>
						</div>
					</GlassCard>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
