"use client";

import { type ClassValue, clsx } from "clsx";
import { Beaker, Check, Lock, Sparkles, Unlock, X } from "lucide-react";
import React from "react";
import { twMerge } from "tailwind-merge";
import { TECHS } from "../config";
import { useGame } from "../store";

function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function ResearchModal({
	isOpen,
	onClose,
}: {
	isOpen: boolean;
	onClose: () => void;
}): JSX.Element | null {
	const { state, researchTech } = useGame();

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 factory-modal-overlay z-50 flex items-center justify-center animate-in fade-in duration-200">
			<div className="factory-modal w-[32rem] max-h-[80vh] overflow-hidden flex flex-col">
				{/* Header */}
				<div className="flex items-center justify-between p-5 border-b border-[var(--factory-border)]">
					<h2 className="text-xl font-bold text-[var(--factory-text-primary)] flex items-center gap-3">
						<div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
							<Beaker className="w-5 h-5 text-white" />
						</div>
						Research Lab
					</h2>
					<button
						type="button"
						onClick={onClose}
						className="p-2 rounded-lg text-[var(--factory-text-muted)] hover:text-[var(--factory-text-primary)] hover:bg-white/5 transition-colors"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				{/* Science Balance */}
				<div className="mx-5 mt-5 led-display flex items-center justify-between">
					<div className="flex items-center gap-3">
						<Sparkles className="w-5 h-5 text-purple-400" />
						<span className="font-semibold text-[var(--factory-text-secondary)]">
							Available Science
						</span>
					</div>
					<span className="led-value text-purple-400 text-2xl">
						{state.science}
					</span>
				</div>

				{/* Tech List */}
				<div className="flex-1 overflow-y-auto p-5 space-y-4">
					{Object.values(TECHS).map((tech) => {
						const isResearched = state.researchedTechs.includes(tech.id);
						const canAfford = state.science >= tech.cost;

						return (
							<div
								key={tech.id}
								className={cn(
									"rounded-lg border p-4 transition-all",
									isResearched
										? "bg-[var(--factory-success)]/5 border-[var(--factory-success)]/20"
										: canAfford
											? "bg-[var(--factory-bg-card)] border-[var(--factory-border)] hover:border-purple-500/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.1)]"
											: "bg-[var(--factory-bg-deep)] border-[var(--factory-border)] opacity-60",
								)}
							>
								<div className="flex items-start justify-between gap-4">
									<div className="flex-1">
										<h3 className="font-bold text-[var(--factory-text-primary)] flex items-center gap-2">
											{tech.name}
											{isResearched && (
												<span className="inline-flex items-center gap-1 text-[10px] uppercase px-2 py-0.5 rounded-full bg-[var(--factory-success)]/20 text-[var(--factory-success)] font-bold">
													<Check className="w-3 h-3" /> Researched
												</span>
											)}
										</h3>
										<p className="text-sm text-[var(--factory-text-secondary)] mt-1">
											{tech.description}
										</p>

										{tech.unlocks && tech.unlocks.length > 0 && (
											<div className="mt-3 flex items-center gap-2">
												<span className="text-[10px] uppercase text-[var(--factory-text-muted)] font-bold">
													Unlocks:
												</span>
												<div className="flex gap-1">
													{tech.unlocks.map((building) => (
														<span
															key={building}
															className="text-xs px-2 py-0.5 rounded bg-[var(--factory-bg-elevated)] border border-[var(--factory-border)] text-[var(--factory-text-primary)]"
														>
															{building}
														</span>
													))}
												</div>
											</div>
										)}
									</div>

									{!isResearched && (
										<div className="text-right shrink-0">
											<div
												className={cn(
													"font-mono font-bold text-lg",
													canAfford
														? "text-purple-400"
														: "text-[var(--factory-danger)]",
												)}
											>
												{tech.cost}
											</div>
											<div className="text-[10px] text-[var(--factory-text-muted)] uppercase">
												Science
											</div>
										</div>
									)}
								</div>

								{!isResearched && (
									<button
										type="button"
										disabled={!canAfford}
										onClick={() => researchTech(tech.id)}
										className={cn(
											"mt-4 w-full py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2",
											canAfford
												? "bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-500 hover:to-purple-600 shadow-lg shadow-purple-500/20"
												: "bg-[var(--factory-bg-deep)] text-[var(--factory-text-muted)] border border-[var(--factory-border)] cursor-not-allowed",
										)}
									>
										{canAfford ? (
											<>
												<Unlock className="w-4 h-4" /> Research Now
											</>
										) : (
											<>
												<Lock className="w-4 h-4" /> Insufficient Science
											</>
										)}
									</button>
								)}
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}
