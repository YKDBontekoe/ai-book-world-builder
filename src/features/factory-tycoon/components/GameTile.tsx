"use client";

import { type ClassValue, clsx } from "clsx";
import type React from "react";
import { memo } from "react";
import { twMerge } from "tailwind-merge";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/atoms/tooltip";
import { BUILDINGS } from "../config";
import type { BuildingEntity, BuildingType, Direction } from "../types";
import { BUILDING_COLORS, getRotation, ICONS, STATUS_CONFIG } from "./visuals";

function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

interface GameTileProps {
	x: number;
	y: number;
	building?: BuildingEntity;
	selectedBuilding: BuildingType | null;
	currentDirection: Direction;
	hovered: boolean;
	onTileClick: (x: number, y: number) => void;
	onContextMenu: (e: React.MouseEvent, id?: string) => void;
	onMouseEnter: (x: number, y: number) => void;
}

const GameTile = memo(
	({
		x,
		y,
		building,
		selectedBuilding,
		currentDirection,
		hovered,
		onTileClick,
		onContextMenu,
		onMouseEnter,
	}: GameTileProps) => {
		const Icon = building ? ICONS[building.type as BuildingType] : null;
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
			<button
				type="button"
				onClick={() => onTileClick(x, y)}
				onContextMenu={(e) => onContextMenu(e, building?.id)}
				onMouseEnter={() => onMouseEnter(x, y)}
				className={cn(
					"factory-tile group relative w-full h-full p-0 border-none m-0 text-left align-top block",
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
						{building.type !== "Belt" && building.type !== "Splitter" && (
							<div
								className={cn("status-indicator", statusConfig?.className)}
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
				{!building && selectedBuilding && hovered && (
					<div className="absolute inset-0 flex items-center justify-center opacity-60 transition-opacity">
						{(() => {
							const PreviewIcon = ICONS[selectedBuilding];
							const previewRot = getRotation(
								selectedBuilding,
								currentDirection,
							);
							return (
								<div style={{ transform: `rotate(${previewRot}deg)` }}>
									<PreviewIcon className="w-6 h-6 text-amber-400" />
								</div>
							);
						})()}
					</div>
				)}
			</button>
		);

		if (!building) return content;
		if (building.type === "Belt") return content; // No tooltip for belts

		const config = BUILDINGS[building.type as BuildingType];

		return (
			<Tooltip delayDuration={200}>
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
							{Object.entries(building.localInventory).map(([k, v]) => (
								<div key={k}>
									{k}: {v}
								</div>
							))}
						</div>
					)}
					<div className="text-[10px] text-[var(--factory-amber)] italic">
						Right-click to demolish. R to rotate.
					</div>
				</TooltipContent>
			</Tooltip>
		);
	},
	(prev, next) => {
		// Return true if equal (do NOT re-render)
		if (prev.x !== next.x) return false;
		if (prev.y !== next.y) return false;
		if (prev.hovered !== next.hovered) return false;

		// If preview needs update (selectedBuilding changed, or direction changed)
		if (prev.selectedBuilding !== next.selectedBuilding) return false;
		if (prev.currentDirection !== next.currentDirection) {
			if (next.hovered && next.selectedBuilding && !next.building) return false;
		}

		const pb = prev.building;
		const nb = next.building;

		if (pb === nb) return true; // Reference equality
		if (!pb && !nb) return true; // Both empty
		if (!pb || !nb) return false; // One exists, one doesn't

		// Deep check for building properties that affect rendering
		if (pb.type !== nb.type) return false;
		if (pb.status !== nb.status) return false;
		if (pb.direction !== nb.direction) return false;

		// Inventory check
		const pInv = pb.localInventory;
		const nInv = nb.localInventory;

		if (pInv === nInv) return true;
		if (!pInv && !nInv) return true;
		if (!pInv || !nInv) return false;

		const pKeys = Object.keys(pInv);
		const nKeys = Object.keys(nInv);

		if (pKeys.length !== nKeys.length) return false;

		for (const k of pKeys) {
			// @ts-expect-error
			if (pInv[k] !== nInv[k]) return false;
		}

		return true;
	},
);

export { GameTile };
