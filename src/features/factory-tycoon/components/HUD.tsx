"use client";

import { type ClassValue, clsx } from "clsx";
import { motion } from "framer-motion";
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
import type React from "react";
import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import { Card, CardContent } from "@/components/atoms/card";
import { Progress } from "@/components/atoms/progress";
import { ScrollArea } from "@/components/atoms/scroll-area";
import { RESOURCE_VALUES } from "../config";
import { useGame } from "../store";
import { GameSettings } from "./GameSettings";
import { ResearchModal } from "./ResearchModal";

function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

const RESOURCE_ICONS: Record<string, { icon: string; color: string }> = {
	ore: { icon: "/images/factory-tycoon/ore.png", color: "text-amber-600" },
	ingot: { icon: "/images/factory-tycoon/ingot.png", color: "text-orange-500" },
	gadget: { icon: "/images/factory-tycoon/gadget.png", color: "text-blue-600" },
	science: {
		icon: "/images/factory-tycoon/science.png",
		color: "text-purple-600",
	},
};

// --- Sub-components ---

function ControlHeader({
	onResearch,
	onSettings,
}: {
	onResearch: () => void;
	onSettings: () => void;
}) {
	return (
		<div className="flex items-center justify-between mb-4">
			<div className="flex items-center gap-2">
				<div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
					<Activity className="w-5 h-5 text-amber-500" />
				</div>
				<span className="font-bold text-foreground">Control Panel</span>
			</div>
			<div className="flex gap-1">
				<Button
					variant="ghost"
					size="icon"
					onClick={onResearch}
					className="hover:text-purple-400 hover:bg-purple-500/10 h-8 w-8"
				>
					<Beaker className="w-4 h-4" />
				</Button>
				<Button
					variant="ghost"
					size="icon"
					onClick={onSettings}
					className="h-8 w-8"
				>
					<Settings className="w-4 h-4" />
				</Button>
			</div>
		</div>
	);
}

function StatusSection({
	tick,
	isRunning,
	onToggle,
}: {
	tick: number;
	isRunning: boolean;
	onToggle: () => void;
}) {
	return (
		<Card variant="glass" className="mb-4 bg-background/40">
			<CardContent className="p-4 flex items-center justify-between">
				<div>
					<div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">
						Tick
					</div>
					<div className="text-2xl font-mono font-bold text-amber-500 leading-none">
						<motion.span
							key={tick}
							initial={{ opacity: 0.5 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.1 }}
						>
							{tick}
						</motion.span>
					</div>
				</div>
				<Button
					variant={isRunning ? "outline" : "default"}
					size="sm"
					onClick={onToggle}
					className={cn(
						"min-w-[80px]",
						isRunning &&
							"text-amber-500 border-amber-500/50 hover:bg-amber-500/10 hover:text-amber-600",
					)}
				>
					{isRunning ? (
						<>
							<Pause className="w-3.5 h-3.5 mr-1.5" /> Pause
						</>
					) : (
						<>
							<Play className="w-3.5 h-3.5 mr-1.5" /> Start
						</>
					)}
				</Button>
			</CardContent>
		</Card>
	);
}

function ResourceSection({
	title,
	icon: Icon,
	value,
	delta,
	colorClass,
	prefix = "",
}: {
	title: string;
	icon: React.ElementType;
	value: number;
	delta: number;
	colorClass: string;
	prefix?: string;
}) {
	return (
		<div className="space-y-2 mb-4">
			<h3 className="text-xs uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-2 px-1">
				<Icon className={cn("w-3.5 h-3.5", colorClass)} />
				{title}
			</h3>
			<Card variant="glass" className="bg-background/40">
				<CardContent className="p-3">
					<div className="flex items-baseline justify-between">
						<span
							className={cn(
								"text-2xl font-mono font-bold tracking-tight",
								colorClass,
							)}
						>
							{prefix}
							{value}
						</span>
						<Badge
							variant={
								delta > 0 ? "success" : delta < 0 ? "destructive" : "secondary"
							}
							className="font-mono h-5 text-[10px] px-1.5"
						>
							{delta > 0 ? (
								<TrendingUp className="w-3 h-3 mr-1" />
							) : delta < 0 ? (
								<TrendingDown className="w-3 h-3 mr-1" />
							) : (
								<Minus className="w-3 h-3 mr-1" />
							)}
							{delta > 0 ? "+" : ""}
							{delta}/t
						</Badge>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

function StorageSection({ current, max }: { current: number; max: number }) {
	const pct = Math.min(100, (current / max) * 100);
	return (
		<div className="space-y-2 mb-4">
			<h3 className="text-xs uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-2 px-1">
				<Database className="w-3.5 h-3.5 text-blue-400" />
				Storage
			</h3>
			<Card variant="glass" className="bg-background/40">
				<CardContent className="p-3 space-y-3">
					<div className="flex justify-between text-xs items-center">
						<span className="text-muted-foreground font-medium">Capacity</span>
						<span className="font-mono font-medium">
							{current} / {max}
						</span>
					</div>
					<Progress
						value={pct}
						className={cn(
							"h-1.5",
							pct > 90 ? "text-red-500" : pct > 75 ? "text-amber-500" : "",
						)}
					/>
				</CardContent>
			</Card>
		</div>
	);
}

function InventorySection({
	inventory,
	lastTickDelta,
	onSell,
}: {
	inventory: Record<string, number>;
	lastTickDelta: Record<string, number>;
	onSell: (res: any) => void;
}) {
	return (
		<div className="space-y-2">
			<h3 className="text-xs uppercase font-bold tracking-wider text-muted-foreground px-1">
				Inventory
			</h3>
			<div className="space-y-2 pb-2">
				{Object.entries(inventory).map(([res, count]) => {
					const delta = lastTickDelta[res as keyof typeof inventory] ?? 0;
					const config = RESOURCE_ICONS[res];
					const value =
						RESOURCE_VALUES[res as keyof typeof RESOURCE_VALUES] || 0;

					return (
						<Card
							key={res}
							className="bg-background/60 border-border/60 shadow-none"
						>
							<CardContent className="p-2.5 space-y-2.5">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2.5">
										<div className="w-9 h-9 bg-background rounded-md p-1.5 border flex items-center justify-center shrink-0">
											{/* eslint-disable-next-line @next/next/no-img-element */}
											<img
												src={config?.icon}
												alt={res}
												className="w-full h-full object-contain"
											/>
										</div>
										<span
											className={cn(
												"text-sm font-semibold capitalize",
												config?.color,
											)}
										>
											{res}
										</span>
									</div>
									<div className="flex items-center gap-2">
										<span
											className={cn(
												"text-[10px] font-mono w-6 text-right",
												delta > 0
													? "text-green-500"
													: delta < 0
														? "text-red-500"
														: "text-muted-foreground/50",
											)}
										>
											{delta > 0 ? "+" : ""}
											{delta !== 0 ? delta : "-"}
										</span>
										<span className="text-lg font-mono font-bold min-w-[3ch] text-right">
											{count}
										</span>
									</div>
								</div>
								{value > 0 && (
									<Button
										variant="outline"
										size="sm"
										className="w-full h-7 text-[10px] border-dashed hover:border-solid hover:bg-accent/50 hover:text-accent-foreground"
										disabled={count <= 0}
										onClick={() => onSell(res)}
									>
										<Coins className="w-3 h-3 mr-1.5 text-yellow-500" />
										Sell 1 for ${value}
									</Button>
								)}
							</CardContent>
						</Card>
					);
				})}
			</div>
		</div>
	);
}

function StatsFooter({ buildings }: { buildings: any[] }) {
	const running = buildings.filter((b) => b.status === "RUNNING").length;
	const starved = buildings.filter((b) => b.status === "STARVED").length;
	const blocked = buildings.filter((b) => b.status === "BLOCKED").length;

	return (
		<div className="grid grid-cols-3 gap-2 mt-auto pt-4 border-t border-border/50">
			<div className="flex flex-col items-center bg-green-500/5 p-2 rounded-lg border border-green-500/20">
				<span className="text-lg font-mono font-bold text-green-600">
					{running}
				</span>
				<span className="text-[9px] uppercase font-bold text-green-600/70 tracking-wide mt-0.5">
					Running
				</span>
			</div>
			<div className="flex flex-col items-center bg-amber-500/5 p-2 rounded-lg border border-amber-500/20">
				<span className="text-lg font-mono font-bold text-amber-600">
					{starved}
				</span>
				<span className="text-[9px] uppercase font-bold text-amber-600/70 tracking-wide mt-0.5">
					Starved
				</span>
			</div>
			<div className="flex flex-col items-center bg-red-500/5 p-2 rounded-lg border border-red-500/20">
				<span className="text-lg font-mono font-bold text-red-600">
					{blocked}
				</span>
				<span className="text-[9px] uppercase font-bold text-red-600/70 tracking-wide mt-0.5">
					Blocked
				</span>
			</div>
		</div>
	);
}

export function HUD() {
	const { state, isRunning, setIsRunning, sellResource } = useGame();
	const [isSettingsOpen, setIsSettingsOpen] = useState(false);
	const [isResearchOpen, setIsResearchOpen] = useState(false);

	const totalVolume = Object.values(state.inventory).reduce((a, b) => a + b, 0);
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

			<div className="w-80 shrink-0 h-full bg-sidebar/95 backdrop-blur-xl border-l border-sidebar-border flex flex-col p-4 shadow-2xl z-20 pointer-events-auto">
				<ControlHeader
					onResearch={() => setIsResearchOpen(true)}
					onSettings={() => setIsSettingsOpen(true)}
				/>

				<div className="flex-1 min-h-0 relative -mx-4 px-4">
					<ScrollArea className="h-full pr-3">
						<div className="space-y-1 pb-4">
							<StatusSection
								tick={state.tickCount}
								isRunning={isRunning}
								onToggle={() => setIsRunning(!isRunning)}
							/>

							<ResourceSection
								title="Finances"
								icon={Coins}
								value={state.cash}
								delta={cashDelta}
								colorClass="text-yellow-600 dark:text-yellow-500"
								prefix="$"
							/>

							<ResourceSection
								title="Research"
								icon={Beaker}
								value={state.science}
								delta={state.lastTickDelta.science ?? 0}
								colorClass="text-purple-600 dark:text-purple-400"
							/>

							<StorageSection current={totalVolume} max={state.capacity} />

							<InventorySection
								inventory={state.inventory}
								lastTickDelta={state.lastTickDelta}
								onSell={sellResource}
							/>
						</div>
					</ScrollArea>
				</div>

				<StatsFooter buildings={state.buildings} />
			</div>
		</>
	);
}
