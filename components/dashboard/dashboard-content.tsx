"use client";

import { useQuery } from "@tanstack/react-query";
import { getDashboardStatsAction } from "@/app/actions/dashboard";
import { UsageChart } from "./usage-chart";
import { EntityInsights } from "./entity-insights";
import { Loader2 } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";

export function DashboardContent({ projectId }: { projectId?: string }) {
    const { data, isLoading, error } = useQuery({
        queryKey: ['dashboard-stats', projectId || 'global'],
        queryFn: async () => {
             const result = await getDashboardStatsAction(projectId);
             if (result.error) throw new Error(result.error);
             return result.stats;
        }
    });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 border border-red-500/20 bg-red-500/10 rounded-lg text-red-400 text-center text-sm">
                {error instanceof Error ? error.message : "Failed to load stats"}
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="space-y-6 max-w-7xl mx-auto p-6">
            <header className="mb-8">
                <h1 className="text-3xl font-serif text-foreground">
                    {projectId ? "Project Insights" : "Global Dashboard"}
                </h1>
                <p className="text-muted-foreground mt-2">
                    Overview of token usage, costs, and entity statistics.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GlassCard className="p-6">
                    <h2 className="text-xl font-medium mb-4">Token Usage & Costs</h2>
                    <UsageChart stats={data.tokenStats} />
                </GlassCard>

                <GlassCard className="p-6">
                    <h2 className="text-xl font-medium mb-4">Entity Statistics</h2>
                    <EntityInsights stats={data.entityStats} />
                </GlassCard>
            </div>
        </div>
    );
}
