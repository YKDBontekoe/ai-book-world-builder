"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";
import { getDashboardStatsAction } from "@/app/actions/dashboard";
import { STALE_TIMES } from "@/lib/query-options";
import { UsageChart } from "./usage-chart";
import { EntityInsights } from "./entity-insights";
import { Loader2, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DashboardSheet({ projectId, trigger }: { projectId?: string, trigger?: React.ReactNode }) {
    const { data, isLoading, error } = useQuery({
        queryKey: ['dashboard-stats', projectId || 'global'],
        queryFn: async () => {
             const result = await getDashboardStatsAction(projectId);
             if (result.error) throw new Error(result.error);
             return result.stats;
        },
        staleTime: STALE_TIMES.STANDARD,
    });

    return (
        <Sheet>
            <SheetTrigger asChild>
                {trigger || (
                    <Button variant="ghost" size="icon" title={projectId ? "Project Dashboard" : "Global Dashboard"}>
                        <LayoutDashboard className="h-5 w-5" />
                    </Button>
                )}
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px] md:w-[600px] overflow-y-auto glass-panel border-l border-white/10" side="right">
                <SheetHeader className="mb-6">
                    <SheetTitle className="text-xl font-serif">{projectId ? "Project Insights" : "Global Dashboard"}</SheetTitle>
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
    )
}
