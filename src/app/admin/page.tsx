import { BookOpen, Cpu, Users } from "lucide-react";
import Link from "next/link";
import { connection } from "next/server";
import { getAdminStats, getUsers } from "@/app/actions/admin";
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/atoms/table";
import { EmptyState } from "@/components/molecules/empty-state";
import { GlassCard } from "@/components/molecules/glass-card";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
	await connection();
	const [statsResult, usersResult] = await Promise.all([
		getAdminStats(),
		getUsers({ page: 1, pageSize: 5 }), // Fetch top 5 recent users
	]);

	if (!statsResult.success) {
		return (
			<div className="p-8 text-destructive">
				Error loading stats: {statsResult.error}
			</div>
		);
	}

	const stats = statsResult.data;

	return (
		<div className="space-y-8">
			<h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

			<div className="grid gap-4 md:grid-cols-3">
				<GlassCard variant="liquid" className="p-6">
					<div className="flex flex-row items-center justify-between space-y-0 pb-2">
						<h3 className="text-sm font-medium">Total Users</h3>
						<div className="p-2 bg-primary/10 rounded-full">
							<Users className="h-4 w-4 text-primary" />
						</div>
					</div>
					<div className="text-2xl font-bold">{stats.totalUsers}</div>
					<p className="text-xs text-muted-foreground">Registered accounts</p>
				</GlassCard>

				<GlassCard variant="liquid" className="p-6">
					<div className="flex flex-row items-center justify-between space-y-0 pb-2">
						<h3 className="text-sm font-medium">Active Projects</h3>
						<div className="p-2 bg-blue-500/10 rounded-full">
							<BookOpen className="h-4 w-4 text-blue-500" />
						</div>
					</div>
					<div className="text-2xl font-bold">{stats.totalProjects}</div>
					<p className="text-xs text-muted-foreground">Books being written</p>
				</GlassCard>

				<GlassCard variant="liquid" className="p-6">
					<div className="flex flex-row items-center justify-between space-y-0 pb-2">
						<h3 className="text-sm font-medium">Total Tokens</h3>
						<div className="p-2 bg-violet-500/10 rounded-full">
							<Cpu className="h-4 w-4 text-violet-500" />
						</div>
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

			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="text-lg font-semibold tracking-tight">Recent Users</h2>
					<Button asChild variant="outline" size="sm">
						<Link href="/admin/users">View All</Link>
					</Button>
				</div>

				{!usersResult.success ? (
					<EmptyState
						title="Error loading users"
						description={usersResult.error}
						icon={Users}
						className="text-destructive"
						variant="glass"
					/>
				) : usersResult.data.users.length === 0 ? (
					<EmptyState
						title="No users found"
						description="There are no users in the system yet."
						icon={Users}
						variant="glass"
					/>
				) : (
					<GlassCard className="p-0 overflow-hidden">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Name</TableHead>
									<TableHead>Email</TableHead>
									<TableHead>Role</TableHead>
									<TableHead>Status</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{usersResult.data.users.map((user) => (
									<TableRow key={user.id}>
										<TableCell className="font-medium">
											{user.name || "N/A"}
										</TableCell>
										<TableCell>{user.email}</TableCell>
										<TableCell>
											<Badge
												variant={
													user.role === "admin" ? "default" : "secondary"
												}
											>
												{user.role}
											</Badge>
										</TableCell>
										<TableCell>
											{user.bannedAt ? (
												<Badge variant="destructive">Banned</Badge>
											) : (
												<Badge
													variant="outline"
													className="bg-green-500/10 text-green-600 border-green-500/20"
												>
													Active
												</Badge>
											)}
										</TableCell>
										<TableCell className="text-right">
											<Button asChild variant="ghost" size="sm">
												<Link href={`/admin/users/${user.id}`}>
													View Details
												</Link>
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</GlassCard>
				)}
			</div>
		</div>
	);
}
