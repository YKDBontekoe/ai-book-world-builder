import {
	AlertTriangle,
	BookOpenCheck,
	Edit,
	Expand,
	Feather,
	Globe,
	Search,
} from "lucide-react";

export const TOOLS = [
	{
		id: "write",
		icon: Feather,
		label: "Batch Write",
		color: "text-purple-400",
	},
	{ id: "rewrite", icon: Edit, label: "Rewrite", color: "text-blue-400" },
	{ id: "expand", icon: Expand, label: "Expand", color: "text-green-400" },
	{
		id: "critique",
		icon: BookOpenCheck,
		label: "Critique",
		color: "text-yellow-400",
	},
	{
		id: "consistency",
		icon: AlertTriangle,
		label: "Fix",
		color: "text-orange-400",
	},
	{ id: "lore", icon: Globe, label: "Lore", color: "text-pink-400" },
	{ id: "search", icon: Search, label: "Search", color: "text-blue-400" },
] as const;

export type ToolId = (typeof TOOLS)[number]["id"];
