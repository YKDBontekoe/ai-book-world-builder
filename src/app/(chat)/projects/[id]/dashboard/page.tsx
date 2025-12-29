import { notFound } from "next/navigation";
import { getDashboardStatsAction } from "@/app/actions/dashboard";
import { GlassCard } from "@/components/molecules/glass-card";
import { EntityInsights } from "@/components/organisms/dashboard/entity-insights";
import { UsageChart } from "@/components/organisms/dashboard/usage-chart";

export const metadata = {
	title: "Project Dashboard",
};

export default async function ProjectDashboardPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const result = await getDashboardStatsAction(id);

	if (result.error) {
		return (
			<div className="flex flex-col items-center justify-center h-full text-muted-foreground">
				<p>Failed to load dashboard: {result.error}</p>
			</div>
		);
	}

	if (!result.stats) {
		notFound();
	}

	const { tokenStats, entityStats } = result.stats;

	return (
		<div className="flex-1 h-full overflow-y-auto p-8 space-y-8 animate-in fade-in duration-500">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-serif font-bold tracking-tight mb-2">
						Project Dashboard
					</h1>
					<p className="text-muted-foreground">
						Insights and metrics for your story
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<GlassCard variant="liquid" className="p-6 flex flex-col gap-2">
					<span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
						Total Cost
					</span>
					<span className="text-3xl font-mono font-bold">
						${tokenStats.totalCost.toFixed(4)}
					</span>
				</GlassCard>

				<GlassCard variant="liquid" className="p-6 flex flex-col gap-2">
					<span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
						Total Entities
					</span>
					<span className="text-3xl font-mono font-bold">
						{entityStats.totalEntities}
					</span>
				</GlassCard>

				<GlassCard variant="liquid" className="p-6 flex flex-col gap-2">
					<span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
						Input Tokens
					</span>
					<span className="text-3xl font-mono font-bold">
						{tokenStats.totalInputTokens.toLocaleString()}
					</span>
				</GlassCard>

				<GlassCard variant="liquid" className="p-6 flex flex-col gap-2">
					<span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
						Output Tokens
					</span>
					<span className="text-3xl font-mono font-bold">
						{tokenStats.totalOutputTokens.toLocaleString()}
					</span>
				</GlassCard>
			</div>

			<div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
				<GlassCard className="p-6">
					<h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
						AI Usage Over Time
					</h2>
					<UsageChart stats={tokenStats} />
				</GlassCard>

				<GlassCard className="p-6">
					<h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
						Entity Analysis
					</h2>
					<EntityInsights stats={entityStats} />
				</GlassCard>
			</div>
		</div>
	);
}
