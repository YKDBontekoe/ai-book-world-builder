import {
	ArrowRight,
	ArrowUpFromLine,
	Ban,
	Beaker,
	Box,
	Factory,
	GitFork,
	HandCoins,
	Hourglass,
	Pickaxe,
	Store,
	Zap,
} from "lucide-react";
import type React from "react";
import type { BuildingType, Direction, Resource } from "../types";

export const ICONS: Record<
	BuildingType,
	React.ComponentType<React.SVGProps<SVGSVGElement>>
> = {
	Mine: Pickaxe,
	Smelter: Factory,
	Factory: Factory,
	Warehouse: Box,
	Market: Store,
	TradingPost: HandCoins,
	Lab: Beaker,
	Belt: ArrowRight,
	Splitter: GitFork,
	Inserter: ArrowUpFromLine,
};

export const STATUS_CONFIG = {
	RUNNING: {
		color: "var(--factory-success)",
		className: "status-running",
		label: "Running: Producing resources",
		Icon: Zap,
	},
	STARVED: {
		color: "var(--factory-warning)",
		className: "status-starved",
		label: "Starved: Missing input resources",
		Icon: Hourglass,
	},
	BLOCKED: {
		color: "var(--factory-danger)",
		className: "status-blocked",
		label: "Blocked: Output full or no capacity",
		Icon: Ban,
	},
	IDLE: {
		color: "var(--factory-text-muted)",
		className: "status-idle",
		label: "Idle: Passive building",
		Icon: null,
	},
};

export const BUILDING_COLORS: Partial<Record<BuildingType, string>> = {
	Mine: "text-amber-600",
	Smelter: "text-orange-600",
	Factory: "text-blue-600",
	Warehouse: "text-slate-500",
	Market: "text-emerald-600",
	TradingPost: "text-yellow-600",
	Lab: "text-purple-600",
	Belt: "text-gray-500",
	Splitter: "text-cyan-600",
	Inserter: "text-yellow-500",
};

// Colors for resources on belts
export const RESOURCE_COLORS: Record<Resource, string> = {
	ore: "#78350f", // amber-900
	ingot: "#f59e0b", // amber-500
	gadget: "#3b82f6", // blue-500
	science: "#d8b4fe", // purple-300
	cash: "#10b981", // emerald-500
};

export function getRotation(type: BuildingType, dir: Direction): number {
	const baseRotation = { N: -90, E: 0, S: 90, W: 180 }; // For ArrowRight (Belt)
	const standardRotation = { N: 0, E: 90, S: 180, W: 270 }; // For Upright Icons

	if (type === "Belt") return baseRotation[dir];
	if (type === "Splitter") return baseRotation[dir]; // Assuming Splitter icon is also directional like arrow?
	if (type === "Inserter") return baseRotation[dir]; // ArrowUpFromLine points Up (North) by default

	// For others, if we want them to face "Out", we use standard
	// But currently Miner/Smelter don't have "Direction" in their Icon visual really.
	// Except Pickaxe handle? Factory chimney?
	// Let's rotate them too so user knows which way is "Front".
	return standardRotation[dir];
}
