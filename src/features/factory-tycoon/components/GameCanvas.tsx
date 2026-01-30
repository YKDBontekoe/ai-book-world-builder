"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/atoms/tooltip";
import { useSound } from "../audio/SoundContext";
import { BUILDINGS, GRID_SIZE, TICK_RATE_MS } from "../config";
import { useGame } from "../store";
import type { BeltItem, BuildingType, Direction } from "../types";
import {
	BUILDING_COLORS,
	getRotation,
	ICONS,
	RESOURCE_COLORS,
	STATUS_CONFIG,
} from "./visuals";

export function GameCanvas({
	selectedBuilding,
}: {
	selectedBuilding: BuildingType | null;
}): JSX.Element {
	const { state, addBuilding, removeBuilding, rotateBuilding, manualInteract } =
		useGame();
	const { playSound } = useSound();
	const [currentDirection, setCurrentDirection] = useState<Direction>("N");
	const [hoveredTile, setHoveredTile] = useState<{
		x: number;
		y: number;
	} | null>(null);

	const cycleDirection = useCallback(() => {
		const dirs: Direction[] = ["N", "E", "S", "W"];
		setCurrentDirection((prev) => {
			const idx = dirs.indexOf(prev);
			return dirs[(idx + 1) % 4];
		});
	}, []);

	// Keyboard listener for Rotation
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key.toLowerCase() === "r") {
				if (hoveredTile) {
					const building = state.buildings.find(
						(b) => b.x === hoveredTile.x && b.y === hoveredTile.y,
					);
					if (building) {
						rotateBuilding(building.id);
						playSound("rotate"); // assume sound exists or fail gracefully
					} else {
						// Rotate placement
						cycleDirection();
					}
				} else {
					cycleDirection();
				}
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [hoveredTile, state.buildings, rotateBuilding, playSound, cycleDirection]);

	const handleTileClick = (x: number, y: number) => {
		if (selectedBuilding) {
			addBuilding(selectedBuilding, x, y, currentDirection);
			playSound("place");
		} else {
			// Manual Interaction (Pickup items, collect output)
			manualInteract(x, y);
			playSound("pickup");
		}
	};

	const handleContextMenu = (e: React.MouseEvent, id?: string) => {
		e.preventDefault();
		if (id) {
			removeBuilding(id);
			playSound("delete");
		}
	};

	// Create a map for O(1) lookup
	const buildingMap = useMemo(() => {
		const map = new Map();
		state.buildings.forEach((b) => {
			map.set(`${b.x},${b.y}`, b);
		});
		return map;
	}, [state.buildings]);

	// Collect all items for global rendering
	const allItems = useMemo(() => {
		const items: Array<{
			item: BeltItem;
			x: number;
			y: number;
			color: string;
		}> = [];

		state.buildings.forEach((b) => {
			if (b.beltItems) {
				b.beltItems.forEach((item) => {
					let itemX = b.x;
					let itemY = b.y;
					const p = item.position;
					if (b.direction === "E") {
						itemX += p;
						itemY += 0.5;
					} else if (b.direction === "W") {
						itemX += 1 - p;
						itemY += 0.5;
					} else if (b.direction === "S") {
						itemX += 0.5;
						itemY += p;
					} else if (b.direction === "N") {
						itemX += 0.5;
						itemY += 1 - p;
					}

					items.push({
						item,
						x: itemX,
						y: itemY,
						color: RESOURCE_COLORS[item.resource],
					});
				});
			}
			if (b.holdingItem) {
				const item = b.holdingItem;
				let itemX = b.x;
				let itemY = b.y;
				const p = item.position; // 0 to 1

				const dx = b.direction === "E" ? 1 : b.direction === "W" ? -1 : 0;
				const dy = b.direction === "S" ? 1 : b.direction === "N" ? -1 : 0;

				itemX = b.x + 0.5 + (p - 0.5) * dx;
				itemY = b.y + 0.5 + (p - 0.5) * dy;

				items.push({
					item,
					x: itemX,
					y: itemY,
					color: RESOURCE_COLORS[item.resource],
				});
			}
		});
		return items;
	}, [state.buildings]);

	return (
		<TooltipProvider>
			<div className="flex-1 overflow-auto factory-grid-bg flex justify-center items-center p-8">
				<div
					className="relative rounded-lg overflow-hidden"
					style={{
						boxShadow:
							"0 0 60px rgba(245, 158, 11, 0.1), 0 25px 50px rgba(0, 0, 0, 0.5)",
						border: "1px solid var(--factory-border)",
					}}
				>
					<div
						className="grid"
						style={{
							gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
						}}
						onMouseLeave={() => setHoveredTile(null)}
					>
						{Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
							const x = i % GRID_SIZE;
							const y = Math.floor(i / GRID_SIZE);
							const building = buildingMap.get(`${x},${y}`);
							const Icon = building
								? ICONS[building.type as BuildingType]
								: null;
							const statusConfig = building
								? STATUS_CONFIG[building.status as keyof typeof STATUS_CONFIG]
								: null;
							const StatusIcon = statusConfig?.Icon;
							const buildingColor = building
								? BUILDING_COLORS[building.type as BuildingType]
								: "";

							const rotation = building
								? getRotation(building.type, building.direction)
								: 0;

							const content = (
								<div
									key={`${x}-${y}`}
									role="button"
									tabIndex={0}
									aria-label={`Tile ${x},${y} ${building ? building.type : "Empty"}`}
									onClick={() => handleTileClick(x, y)}
									onContextMenu={(e) => handleContextMenu(e, building?.id)}
									onKeyDown={(e) => {
										if (e.key === "Enter" || e.key === " ") {
											e.preventDefault();
											handleTileClick(x, y);
										}
										if (e.key === "ContextMenu" || (e.shiftKey && e.key === "F10")) {
											e.preventDefault();
											handleContextMenu(e as unknown as React.MouseEvent, building?.id);
										}
									}}
									onMouseEnter={() => setHoveredTile({ x, y })}
									onFocus={() => setHoveredTile({ x, y })}
									className={cn(
										"factory-tile group relative focus:outline-none focus:ring-2 focus:ring-amber-400",
										building && "has-building",
										!building && selectedBuilding && "cursor-crosshair",
									)}
									style={{
										background: building
											? "var(--factory-bg-elevated)"
											: (x + y) % 2 === 0
												? "var(--factory-bg-card)"
												: "var(--factory-bg-panel)",
									}}
								>
									{building && Icon && (
										<>
											<div
												className={cn(
													"relative z-10 transition-all duration-300",
													building.status === "RUNNING" &&
														building.type !== "Belt" &&
														"scale-110",
												)}
												style={{ transform: `rotate(${rotation}deg)` }}
											>
												<Icon
													className={cn(
														"w-7 h-7 transition-all duration-300",
														buildingColor || "text-slate-400",
														building.status === "RUNNING" &&
															building.type !== "Belt" &&
															"drop-shadow-[0_0_8px_currentColor]",
														building.status === "RUNNING" &&
															building.type === "Mine" &&
															"animate-shake-vertical",
														building.status === "RUNNING" &&
															(building.type === "Smelter" ||
																building.type === "Factory") &&
															"animate-working-pulse",
														building.status === "RUNNING" &&
															building.type === "Lab" &&
															"animate-pulse",
														building.status === "RUNNING" &&
															building.type === "Inserter" &&
															"animate-swing",
													)}
												/>
											</div>

											{/* Status Indicator (Not for Belt/Splitter to avoid clutter) */}
											{building.type !== "Belt" &&
												building.type !== "Splitter" && (
													<div
														className={cn(
															"status-indicator",
															statusConfig?.className,
														)}
													/>
												)}

											{/* Problem Overlay */}
											{building.status !== "RUNNING" &&
												building.status !== "IDLE" &&
												StatusIcon &&
												building.type !== "Belt" && (
													<div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex items-center justify-center animate-in fade-in zoom-in duration-200 z-20">
														<StatusIcon
															className={cn(
																"w-6 h-6 drop-shadow-lg",
																building.status === "BLOCKED"
																	? "text-red-400"
																	: "text-amber-400",
															)}
														/>
													</div>
												)}
										</>
									)}

									{/* Hover Preview for Empty Tiles */}
									{!building &&
										selectedBuilding &&
										hoveredTile?.x === x &&
										hoveredTile?.y === y && (
											<div className="absolute inset-0 flex items-center justify-center opacity-60 transition-opacity">
												{(() => {
													const PreviewIcon = ICONS[selectedBuilding];
													const previewRot = getRotation(
														selectedBuilding,
														currentDirection,
													);
													return (
														<div
															style={{ transform: `rotate(${previewRot}deg)` }}
														>
															<PreviewIcon className="w-6 h-6 text-amber-400" />
														</div>
													);
												})()}
											</div>
										)}
								</div>
							);

							if (!building) return content;
							if (building.type === "Belt") return content; // No tooltip for belts

							const config = BUILDINGS[building.type as BuildingType];

							return (
								<Tooltip key={`${x}-${y}`} delayDuration={200}>
									<TooltipTrigger asChild>{content}</TooltipTrigger>
									<TooltipContent
										side="right"
										className="factory-panel flex flex-col gap-2 p-3 min-w-[180px]"
									>
										<div className="flex items-center justify-between gap-3">
											<span className="font-bold text-[var(--factory-text-primary)]">
												{building.type}
											</span>
											<span
												className="text-[10px] uppercase px-2 py-0.5 rounded-full font-bold"
												style={{
													background: statusConfig?.color,
													color: "#0a0e14",
												}}
											>
												{building.status}
											</span>
										</div>
										<p className="text-xs text-[var(--factory-text-secondary)]">
											{config.description}
										</p>
										<div className="text-xs border-t border-[var(--factory-border)] pt-2 text-[var(--factory-text-muted)]">
											{statusConfig?.label}
										</div>
										{building.localInventory && (
											<div className="text-xs border-t border-[var(--factory-border)] pt-2">
												<div>Inventory:</div>
												{Object.entries(building.localInventory).map(
													([k, v]) => (
														<div key={k}>
															{k}: {v}
														</div>
													),
												)}
											</div>
										)}
										<div className="text-[10px] text-[var(--factory-amber)] italic">
											Right-click to demolish. R to rotate.
										</div>
									</TooltipContent>
								</Tooltip>
							);
						})}
					</div>

					{/* Global Item Layer */}
					<div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
						<AnimatePresence mode="popLayout">
							{allItems.map(({ item, x, y, color }) => (
								<motion.div
									key={item.id}
									initial={false}
									animate={{
										left: `${(x / GRID_SIZE) * 100}%`,
										top: `${(y / GRID_SIZE) * 100}%`,
									}}
									transition={{
										type: "spring",
										stiffness: 400,
										damping: 25,
									}}
									className="absolute w-2 h-2 rounded-full shadow-sm border border-black/20"
									style={{
										backgroundColor: color,
										transform: "translate(-50%, -50%)",
									}}
								/>
							))}
						</AnimatePresence>
					</div>
				</div>

				{/* Current Direction Indicator (Bottom Right of Canvas) */}
				<div className="absolute bottom-8 right-8 bg-[var(--factory-bg-panel)] p-4 rounded border border-[var(--factory-border)]">
					<div className="text-xs text-[var(--factory-text-muted)] mb-1">
						Rotation (R)
					</div>
					<ArrowRight
						className="w-8 h-8 text-[var(--factory-text-primary)] transition-transform duration-200"
						style={{
							transform: `rotate(${getRotation("Belt", currentDirection)}deg)`,
						}}
					/>
				</div>
			</div>
		</TooltipProvider>
	);
}
