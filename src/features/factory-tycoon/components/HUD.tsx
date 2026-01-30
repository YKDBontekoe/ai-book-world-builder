"use client";

import { type ClassValue, clsx } from "clsx";
import {
	Activity,
	Beaker,
	Coins,
	Database,
	Minus,
	Pause,
	Play,
	Settings,
	TrendingDown,
	TrendingUp,
} from "lucide-react";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { RESOURCE_VALUES } from "../config";
import { useGame } from "../store";
import type { Resource } from "../types";
import { GameSettings } from "./GameSettings";
import { ResearchModal } from "./ResearchModal";

const RESOURCE_ICONS: Record<string, { icon: string; color: string }> = {
	ore: { icon: "/images/factory-tycoon/ore.png", color: "text-amber-600" },
	ingot: { icon: "/images/factory-tycoon/ingot.png", color: "text-orange-500" },
	gadget: { icon: "/images/factory-tycoon/gadget.png", color: "text-blue-600" },
	science: {
		icon: "/images/factory-tycoon/science.png",
		color: "text-purple-600",
	},
};

export function HUD() {
	const { state, isRunning, setIsRunning, sellResource } = useGame();
	const [isSettingsOpen, setIsSettingsOpen] = useState(false);
	const [isResearchOpen, setIsResearchOpen] = useState(false);

	const totalVolume = Object.values(state.inventory).reduce((a, b) => a + b, 0);
	const capacityPct = Math.min(100, (totalVolume / state.capacity) * 100);
	const cashDelta = state.lastTickDelta.cash ?? 0;

	return (
		<>
			<GameSettings
				isOpen={isSettingsOpen}
				onClose={() => setIsSettingsOpen(false)}
			/>
			<ResearchModal
				isOpen={isResearchOpen}
				onClose={() => setIsResearchOpen(false)}
			/>

			<div className="w-80 shrink-0 h-full factory-panel flex flex-col overflow-hidden">
				{/* Header with Controls */}
				<div className="factory-panel-header justify-between">
					<div className="flex items-center gap-2">
						<Activity className="w-5 h-5 text-[var(--factory-amber)]" />
						<span className="font-bold text-[var(--factory-text-primary)]">
							Control Panel
						</span>
					</div>
					<div className="flex gap-1">
						<button
							type="button"
							onClick={() => setIsResearchOpen(true)}
							className="p-1.5 rounded-md text-[var(--factory-text-muted)] hover:text-purple-400 hover:bg-purple-500/10 transition-colors"
							title="Research"
						>
							<Beaker className="w-4 h-4" />
						</button>
						<button
							type="button"
							onClick={() => setIsSettingsOpen(true)}
							className="p-1.5 rounded-md text-[var(--factory-text-muted)] hover:text-[var(--factory-text-primary)] hover:bg-white/5 transition-colors"
							title="Settings"
						>
							<Settings className="w-4 h-4" />
						</button>
					</div>
				</div>

				<div className="flex-1 overflow-y-auto p-4 space-y-5">
					{/* Simulation Status */}
					<div className="led-display flex items-center justify-between">
						<div>
							<div className="text-[10px] uppercase tracking-wider text-[var(--factory-text-muted)] font-bold">
								Tick
							</div>
							<div className="led-value amber text-2xl">{state.tickCount}</div>
						</div>
						<button
							type="button"
							onClick={() => setIsRunning(!isRunning)}
							className={cn(
								"factory-btn",
								isRunning
									? "bg-amber-500/20 border-amber-500/50 text-amber-400 hover:bg-amber-500/30"
									: "factory-btn-primary",
							)}
						>
							{isRunning ? (
								<>
									<Pause className="w-4 h-4" /> Pause
								</>
							) : (
								<>
									<Play className="w-4 h-4" /> Start
								</>
							)}
						</button>
					</div>

					{/* Finances */}
					<div className="space-y-3">
						<h3 className="text-xs uppercase font-bold tracking-wider text-[var(--factory-text-muted)] flex items-center gap-2">
							<Coins className="w-4 h-4 text-yellow-500" />
							Finances
						</h3>

						<div className="led-display">
							<div className="flex items-baseline justify-between">
								<span className="led-value positive text-3xl">
									${state.cash}
								</span>
								<div
									className={cn(
										"resource-badge",
										cashDelta > 0
											? "positive"
											: cashDelta < 0
												? "negative"
												: "",
									)}
								>
									{cashDelta > 0 ? (
										<TrendingUp className="w-3 h-3" />
									) : cashDelta < 0 ? (
										<TrendingDown className="w-3 h-3" />
									) : (
										<Minus className="w-3 h-3" />
									)}
									{cashDelta > 0 ? "+" : ""}
									{cashDelta}/tick
								</div>
							</div>
						</div>
					</div>

					{/* Research */}
					<div className="space-y-3">
						<h3 className="text-xs uppercase font-bold tracking-wider text-[var(--factory-text-muted)] flex items-center gap-2">
							<Beaker className="w-4 h-4 text-purple-400" />
							Research
						</h3>

						<div className="led-display">
							<div className="flex items-baseline justify-between">
								<span className="led-value text-purple-400 text-3xl">
									{state.science}
								</span>
								<div
									className={cn(
										"resource-badge",
										(state.lastTickDelta.science ?? 0) > 0 ? "positive" : "",
									)}
								>
									{(state.lastTickDelta.science ?? 0) > 0 ? (
										<TrendingUp className="w-3 h-3" />
									) : (
										<Minus className="w-3 h-3" />
									)}
									{(state.lastTickDelta.science ?? 0) > 0 ? "+" : ""}
									{state.lastTickDelta.science ?? 0}/tick
								</div>
							</div>
						</div>
					</div>

					{/* Storage Capacity */}
					<div className="space-y-3">
						<h3 className="text-xs uppercase font-bold tracking-wider text-[var(--factory-text-muted)] flex items-center gap-2">
							<Database className="w-4 h-4 text-blue-400" />
							Storage
						</h3>

						<div className="space-y-2">
							<div className="flex justify-between text-xs">
								<span className="text-[var(--factory-text-secondary)]">
									Capacity
								</span>
								<span className="font-mono text-[var(--factory-text-primary)]">
									{totalVolume} / {state.capacity}
								</span>
							</div>
							<div className="factory-progress">
								<div
									className={cn(
										"factory-progress-fill",
										capacityPct > 90
											? "danger"
											: capacityPct > 75
												? "warning"
												: "",
									)}
									style={{ width: `${capacityPct}%` }}
								/>
							</div>
						</div>
					</div>

					{/* Inventory */}
					<div className="space-y-3">
						<h3 className="text-xs uppercase font-bold tracking-wider text-[var(--factory-text-muted)]">
							Inventory
						</h3>

						<div className="space-y-2">
							{Object.entries(state.inventory).map(([res, count]) => {
								const delta =
									state.lastTickDelta[res as keyof typeof state.inventory] ?? 0;
								const config = RESOURCE_ICONS[res];
								const value =
									RESOURCE_VALUES[res as keyof typeof RESOURCE_VALUES] || 0;

								return (
									<div
										key={res}
										className="inventory-item flex-col items-stretch gap-2"
									>
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-3">
												<div className="inventory-icon bg-white p-1">
													{/* eslint-disable-next-line @next/next/no-img-element */}
													<img
														src={config?.icon}
														alt={res}
														className="w-full h-full object-contain"
													/>
												</div>
												<span
													className={cn(
														"capitalize font-medium text-sm",
														config?.color ||
															"text-[var(--factory-text-primary)]",
													)}
												>
													{res}
												</span>
											</div>

											<div className="flex items-center gap-3">
												<span
													className={cn(
														"text-xs font-mono w-10 text-right",
														delta > 0
															? "text-[var(--factory-success)]"
															: delta < 0
																? "text-[var(--factory-danger)]"
																: "text-[var(--factory-text-muted)]",
													)}
												>
													{delta > 0 ? "+" : ""}
													{delta !== 0 ? delta : "-"}
												</span>
												<span className="text-xl font-mono font-bold text-[var(--factory-text-primary)] w-10 text-right">
													{count}
												</span>
											</div>
										</div>

										{value > 0 && (
											<button
												type="button"
												onClick={() => {
													// Ensure safe cast by checking valid resources
													if (
														res === "ore" ||
														res === "ingot" ||
														res === "gadget" ||
														res === "science"
													) {
														sellResource(res as Resource);
													}
												}}
												disabled={count <= 0}
												className={cn(
													"text-[10px] w-full py-1 rounded border transition-colors flex items-center justify-center gap-1",
													count > 0
														? "border-[var(--factory-success)] text-[var(--factory-success)] hover:bg-[var(--factory-success)] hover:text-white"
														: "border-[var(--factory-border)] text-[var(--factory-text-muted)] opacity-50 cursor-not-allowed",
												)}
											>
												<Coins className="w-3 h-3" />
												Sell 1 for ${value}
											</button>
										)}
									</div>
								);
							})}
						</div>
					</div>
				</div>

				{/* Footer Stats */}
				<div className="stats-grid">
					<div className="stat-item">
						<span className="stat-value text-[var(--factory-success)]">
							{state.buildings.filter((b) => b.status === "RUNNING").length}
						</span>
						<span className="stat-label">Running</span>
					</div>
					<div className="stat-item">
						<span className="stat-value text-[var(--factory-warning)]">
							{state.buildings.filter((b) => b.status === "STARVED").length}
						</span>
						<span className="stat-label">Starved</span>
					</div>
					<div className="stat-item">
						<span className="stat-value text-[var(--factory-danger)]">
							{state.buildings.filter((b) => b.status === "BLOCKED").length}
						</span>
						<span className="stat-label">Blocked</span>
					</div>
				</div>
			</div>
		</>
	);
}
