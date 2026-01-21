"use client";

import { differenceInDays, endOfDay, startOfDay, subDays } from "date-fns";
import { Download, LayoutList } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/atoms/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/atoms/dropdown-menu";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/atoms/select";
import type { TokenStats, UsageHistory } from "@/lib/dashboard-queries";

interface DashboardControlsProps {
	projectId: string;
	stats: {
		tokenStats: TokenStats;
		usageHistory: UsageHistory;
	};
}

const PRESETS = [
	{ label: "All Time", value: "all" },
	{ label: "Last 7 Days", value: "7d" },
	{ label: "Last 30 Days", value: "30d" },
];

export function DashboardControls({
	projectId,
	stats,
}: DashboardControlsProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [isPending, startTransition] = useTransition();

	// Determine current preset based on URL params
	const currentFrom = searchParams.get("from");
	const currentTo = searchParams.get("to");

	let currentPreset = "all";
	if (currentFrom && currentTo) {
		const fromDate = new Date(currentFrom);
		const toDate = new Date(currentTo);
		const diff = differenceInDays(toDate, fromDate);
		// Simple heuristic for now
		if (diff >= 6 && diff <= 7) currentPreset = "7d";
		else if (diff >= 29 && diff <= 30) currentPreset = "30d";
		else currentPreset = "custom";
	}

	const handlePresetChange = (value: string) => {
		const params = new URLSearchParams(searchParams);
		if (value === "all") {
			params.delete("from");
			params.delete("to");
		} else {
			const end = endOfDay(new Date());
			let start = new Date();

			if (value === "7d") {
				start = startOfDay(subDays(end, 7));
			} else if (value === "30d") {
				start = startOfDay(subDays(end, 30));
			}

			params.set("from", start.toISOString());
			params.set("to", end.toISOString());
		}

		startTransition(() => {
			router.push(`?${params.toString()}`);
			router.refresh();
		});
	};

	const handleExport = (format: "csv" | "json") => {
		if (format === "csv") {
			const headers = ["Date", "Cost ($)", "Tokens"];
			const rows = stats.usageHistory.map((h) =>
				[h.date, h.cost.toFixed(4), h.tokens].join(","),
			);
			const csvContent = [headers.join(","), ...rows].join("\n");

			const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
			const link = document.createElement("a");
			link.href = URL.createObjectURL(blob);
			link.download = `project-${projectId}-stats.csv`;
			link.click();
		}
	};

	return (
		<div className="flex items-center gap-2">
			<Select
				value={currentPreset}
				onValueChange={handlePresetChange}
				disabled={isPending}
			>
				<SelectTrigger className="w-[140px] h-9 text-xs glass-surface border-white/10">
					<SelectValue placeholder="Date Range" />
				</SelectTrigger>
				<SelectContent>
					{PRESETS.map((p) => (
						<SelectItem key={p.value} value={p.value} className="text-xs">
							{p.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="outline"
						size="sm"
						className="h-9 gap-2 text-xs glass-surface border-white/10"
					>
						<Download className="h-3.5 w-3.5" />
						Export
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuItem onClick={() => handleExport("csv")}>
						<LayoutList className="mr-2 h-4 w-4" />
						Export to CSV
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
