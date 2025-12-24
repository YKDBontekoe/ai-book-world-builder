"use client";

import { useQuery } from "@tanstack/react-query";
import { LayoutDashboard, Loader2 } from "lucide-react";
import { getDashboardStatsAction } from "@/app/actions/dashboard";
import { Button } from "@/components/atoms/button";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/atoms/sheet";
import { EntityInsights } from "@/components/organisms/dashboard/entity-insights";
import { UsageChart } from "@/components/organisms/dashboard/usage-chart";

export function DashboardSheet({
	projectId,
	trigger,
}: {
	projectId?: string;
	trigger?: React.ReactNode;
}) {
	const { data, isLoading, error } = useQuery({
		queryKey: ["dashboard-stats", projectId || "global"],
		queryFn: async () => {
			const result = await getDashboardStatsAction(projectId);
			if (result.error) throw new Error(result.error);
			return result.stats;
		},
	});

	return (
		<Sheet>
			<SheetTrigger asChild>
				{trigger || (
					<Button
						variant="ghost"
						size="icon"
						title={projectId ? "Project Dashboard" : "Global Dashboard"}
					>
						<LayoutDashboard className="h-5 w-5" />
					</Button>
				)}
			</SheetTrigger>
			<SheetContent
				className="w-[400px] sm:w-[540px] md:w-[600px] overflow-y-auto glass-panel border-l border-white/10"
				side="right"
			>
				<SheetHeader className="mb-6">
					<SheetTitle className="text-xl font-serif">
						{projectId ? "Project Insights" : "Global Dashboard"}
					</SheetTitle>
				</SheetHeader>

				{isLoading ? (
					<div className="flex justify-center items-center h-[200px]">
						<Loader2 className="h-8 w-8 animate-spin text-primary" />
					</div>
				) : data ? (
					<div className="space-y-6 pb-10">
						<UsageChart stats={data.tokenStats} />
						<EntityInsights stats={data.entityStats} />
					</div>
				) : (
					<div className="p-4 border border-red-500/20 bg-red-500/10 rounded-lg text-red-400 text-center text-sm">
						{error instanceof Error ? error.message : "Failed to load stats"}
					</div>
				)}
			</SheetContent>
		</Sheet>
	);
}
