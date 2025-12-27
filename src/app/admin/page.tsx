import { BookOpen, Cpu, Users } from "lucide-react";
import { getAdminStats } from "@/app/actions/admin";
import { GlassCard } from "@/components/molecules/glass-card";

export default async function AdminDashboard() {
	const stats = await getAdminStats();

	return (
		<div className="space-y-8">
			<h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

			<div className="grid gap-4 md:grid-cols-3">
				<GlassCard variant="liquid" className="p-6">
					<div className="flex flex-row items-center justify-between space-y-0 pb-2">
						<h3 className="text-sm font-medium">Total Users</h3>
						<Users className="h-4 w-4 text-muted-foreground" />
					</div>
					<div className="text-2xl font-bold">{stats.totalUsers}</div>
					<p className="text-xs text-muted-foreground">Registered accounts</p>
				</GlassCard>

				<GlassCard variant="liquid" className="p-6">
					<div className="flex flex-row items-center justify-between space-y-0 pb-2">
						<h3 className="text-sm font-medium">Active Projects</h3>
						<BookOpen className="h-4 w-4 text-muted-foreground" />
					</div>
					<div className="text-2xl font-bold">{stats.totalProjects}</div>
					<p className="text-xs text-muted-foreground">Books being written</p>
				</GlassCard>

				<GlassCard variant="liquid" className="p-6">
					<div className="flex flex-row items-center justify-between space-y-0 pb-2">
						<h3 className="text-sm font-medium">Total Tokens</h3>
						<Cpu className="h-4 w-4 text-muted-foreground" />
					</div>
					<div className="text-2xl font-bold">
						{(
							(Number(stats.totalInputTokens) +
								Number(stats.totalOutputTokens)) /
							1000000
						).toFixed(2)}
						M
					</div>
					<p className="text-xs text-muted-foreground">
						In: {(Number(stats.totalInputTokens) / 1000000).toFixed(2)}M / Out:{" "}
						{(Number(stats.totalOutputTokens) / 1000000).toFixed(2)}M
					</p>
				</GlassCard>
			</div>
		</div>
	);
}
