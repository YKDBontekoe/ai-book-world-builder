"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2, Sparkles, X } from "lucide-react";
import { Button } from "@/components/atoms/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/atoms/dialog";
import { cn } from "@/lib/utils";

export type GenerationPhase = "planning" | "generating" | "complete" | "error";

export interface SceneProgress {
	id: string;
	title: string;
	status: "pending" | "generating" | "complete" | "error";
}

interface GenerationProgressDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	phase: GenerationPhase;
	scenes: SceneProgress[];
	error?: string;
	onCancel?: () => void;
}

export function GenerationProgressDialog({
	open,
	onOpenChange,
	phase,
	scenes,
	error,
	onCancel,
}: GenerationProgressDialogProps) {
	const totalScenes = scenes.length;
	const completedScenes = scenes.filter((s) => s.status === "complete").length;
	const progressPercent =
		totalScenes > 0 ? (completedScenes / totalScenes) * 100 : 0;

	const getPhaseTitle = () => {
		switch (phase) {
			case "planning":
				return "Planning Scenes...";
			case "generating":
				return `Writing Scenes (${completedScenes}/${totalScenes})`;
			case "complete":
				return "Generation Complete!";
			case "error":
				return "Generation Failed";
		}
	};

	const getPhaseDescription = () => {
		switch (phase) {
			case "planning":
				return "AI is structuring the chapter into scenes...";
			case "generating":
				return "AI is writing content for each scene...";
			case "complete":
				return "All scenes have been generated successfully.";
			case "error":
				return error || "An error occurred during generation.";
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						{phase === "error" ? (
							<X className="h-5 w-5 text-destructive" />
						) : phase === "complete" ? (
							<Check className="h-5 w-5 text-green-500" />
						) : (
							<Sparkles className="h-5 w-5 text-purple-500" />
						)}
						{getPhaseTitle()}
					</DialogTitle>
				</DialogHeader>

				<div className="space-y-4">
					{/* Phase description */}
					<p
						className={cn(
							"text-sm",
							phase === "error" ? "text-destructive" : "text-muted-foreground",
						)}
					>
						{getPhaseDescription()}
					</p>

					{/* Progress bar */}
					{phase !== "planning" && phase !== "error" && (
						<div className="space-y-2">
							<div className="h-2 w-full bg-muted rounded-full overflow-hidden">
								<motion.div
									className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
									initial={{ width: 0 }}
									animate={{ width: `${progressPercent}%` }}
									transition={{ duration: 0.3, ease: "easeOut" }}
								/>
							</div>
						</div>
					)}

					{/* Scene list */}
					{scenes.length > 0 && (
						<div className="space-y-2 max-h-64 overflow-y-auto pr-2">
							<AnimatePresence mode="popLayout">
								{scenes.map((scene, index) => (
									<motion.div
										key={scene.id}
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -10 }}
										transition={{ duration: 0.2, delay: index * 0.05 }}
										className={cn(
											"flex items-center gap-3 p-2 rounded-lg transition-colors",
											scene.status === "generating" &&
												"bg-purple-50 dark:bg-purple-950/20",
											scene.status === "complete" &&
												"bg-green-50/50 dark:bg-green-950/10",
											scene.status === "error" &&
												"bg-red-50 dark:bg-red-950/20",
										)}
									>
										{/* Status icon */}
										<div className="shrink-0">
											{scene.status === "pending" && (
												<div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
											)}
											{scene.status === "generating" && (
												<Loader2 className="h-4 w-4 text-purple-500 animate-spin" />
											)}
											{scene.status === "complete" && (
												<motion.div
													initial={{ scale: 0 }}
													animate={{ scale: 1 }}
													className="h-4 w-4 rounded-full bg-green-500 flex items-center justify-center"
												>
													<Check className="h-2.5 w-2.5 text-white" />
												</motion.div>
											)}
											{scene.status === "error" && (
												<X className="h-4 w-4 text-destructive" />
											)}
										</div>

										{/* Scene title */}
										<span
											className={cn(
												"text-sm truncate flex-1",
												scene.status === "pending" &&
													"text-muted-foreground/60",
												scene.status === "generating" &&
													"text-purple-700 dark:text-purple-300 font-medium",
												scene.status === "complete" && "text-foreground",
												scene.status === "error" && "text-destructive",
											)}
										>
											{scene.title}
										</span>

										{/* Scene number */}
										<span className="text-xs text-muted-foreground/50 shrink-0">
											{index + 1}/{totalScenes}
										</span>
									</motion.div>
								))}
							</AnimatePresence>
						</div>
					)}

					{/* Planning spinner */}
					{phase === "planning" && scenes.length === 0 && (
						<div className="flex items-center justify-center py-8">
							<motion.div
								animate={{ rotate: 360 }}
								transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
							>
								<Loader2 className="h-8 w-8 text-purple-500" />
							</motion.div>
						</div>
					)}

					{/* Actions */}
					<div className="flex justify-end gap-2 pt-2">
						{phase === "error" && (
							<Button variant="outline" onClick={() => onOpenChange(false)}>
								Close
							</Button>
						)}
						{(phase === "planning" || phase === "generating") && onCancel && (
							<Button
								variant="ghost"
								onClick={onCancel}
								className="text-muted-foreground"
							>
								Cancel
							</Button>
						)}
						{phase === "complete" && (
							<Button
								onClick={() => onOpenChange(false)}
								className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
							>
								Done
							</Button>
						)}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
