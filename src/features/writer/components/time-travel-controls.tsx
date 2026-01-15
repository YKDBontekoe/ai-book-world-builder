"use client";

import { AnimatePresence, motion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Slider } from "@/components/atoms/slider";
import { GlassCard } from "@/components/molecules/glass-card";
import type { UseEditorHistoryReturn } from "@/hooks/use-editor-history";

interface TimeTravelControlsProps
	extends Pick<
		UseEditorHistoryReturn,
		| "historyStack"
		| "isTimeTraveling"
		| "sliderValue"
		| "toggleTimeTravel"
		| "handleTimeTravel"
		| "cancelTimeTravel"
		| "restoreVersion"
	> {
	activeSceneId: string | null;
}

export function TimeTravelControls({
	activeSceneId,
	historyStack,
	isTimeTraveling,
	sliderValue,
	toggleTimeTravel,
	handleTimeTravel,
	cancelTimeTravel,
	restoreVersion,
}: TimeTravelControlsProps) {
	if (!activeSceneId || historyStack.length <= 1) {
		return null;
	}

	return (
		<div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-md px-4">
			<AnimatePresence>
				{isTimeTraveling ? (
					<motion.div
						initial={{ y: 20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						exit={{ y: 20, opacity: 0 }}
					>
						<GlassCard variant="liquid" className="p-4 flex flex-col gap-4">
							<div className="flex items-center justify-between text-xs text-muted-foreground">
								<span>Original</span>
								<span className="font-bold text-primary">Now Previewing</span>
								<span>Current</span>
							</div>
							<Slider
								value={sliderValue}
								min={0}
								max={historyStack.length - 1}
								step={1}
								onValueChange={handleTimeTravel}
								className="py-2"
							/>
							<div className="flex justify-end gap-2">
								<Button size="sm" variant="ghost" onClick={cancelTimeTravel}>
									Cancel
								</Button>
								<Button size="sm" onClick={restoreVersion}>
									Restore Version
								</Button>
							</div>
						</GlassCard>
					</motion.div>
				) : (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						whileHover={{ scale: 1.05 }}
					>
						<Button
							variant="outline"
							size="sm"
							className="bg-background/50 backdrop-blur-sm shadow-lg rounded-full px-4 gap-2 border-primary/20 hover:border-primary/50"
							onClick={toggleTimeTravel}
						>
							<RotateCcw className="h-3.5 w-3.5" />
							<span className="text-xs">Time Travel</span>
						</Button>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
