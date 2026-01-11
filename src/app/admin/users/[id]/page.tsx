import { format } from "date-fns";
import { ArrowLeft, Book, Clock } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getUserDetails } from "@/app/actions/admin";
import { UserStatusToggle } from "@/components/admin/user-status-toggle";
import { Badge } from "@/components/atoms/badge";
import { GlassCard } from "@/components/molecules/glass-card";

export default async function UserDetailsPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const result = await getUserDetails({ userId: id });

	if (!result.success) {
		// If the action itself failed (e.g., network error, server error)
		// We can render an error message or redirect. For now, we'll use notFound.
		notFound();
	}

	if (!result.data) {
		// If the action succeeded but returned no data (e.g., user not found)
		notFound();
	}

	const { user, projects, usage } = result.data;

	return (
		<div className="space-y-8">
			<div>
				<Link
					href="/admin/users"
					className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
				>
					<ArrowLeft className="mr-2 h-4 w-4" />
					Back to Users
				</Link>
				<div className="flex items-center justify-between">
					<h1 className="text-3xl font-bold tracking-tight">
						{user.name || "Unnamed User"}
					</h1>
					<div className="flex items-center gap-4">
						<Badge variant={user.role === "admin" ? "default" : "secondary"}>
							{user.role}
						</Badge>
						<UserStatusToggle userId={user.id} isBanned={!!user.bannedAt} />
					</div>
				</div>
				<p className="text-muted-foreground">{user.email}</p>
			</div>

			<div className="grid gap-6 md:grid-cols-2">
				{/* Stats */}
				<GlassCard variant="liquid" className="p-6 space-y-4">
					<h3 className="text-lg font-semibold">Usage Statistics</h3>
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-1">
							<span className="text-sm text-muted-foreground">
								Total Projects
							</span>
							<p className="text-2xl font-bold">{projects.length}</p>
						</div>
						<div className="space-y-1">
							<span className="text-sm text-muted-foreground">Joined</span>
							<p className="text-lg font-medium">Unknown</p>
						</div>
						<div className="space-y-1">
							<span className="text-sm text-muted-foreground">
								Input Tokens
							</span>
							<p className="text-xl font-mono">
								{(Number(usage.inputTokens) / 1000).toFixed(1)}k
							</p>
						</div>
						<div className="space-y-1">
							<span className="text-sm text-muted-foreground">
								Output Tokens
							</span>
							<p className="text-xl font-mono">
								{(Number(usage.outputTokens) / 1000).toFixed(1)}k
							</p>
						</div>
					</div>
				</GlassCard>

				{/* Projects List */}
				<GlassCard className="p-6 space-y-4">
					<h3 className="text-lg font-semibold flex items-center gap-2">
						<Book className="h-4 w-4" />
						Projects
					</h3>
					{projects.length === 0 ? (
						<p className="text-muted-foreground text-sm">No projects found.</p>
					) : (
						<ul className="space-y-3">
							{projects.map(
								(project: {
									id: string;
									name: string;
									createdAt: Date;
									visibility: string;
								}) => (
									<li
										key={project.id}
										className="flex items-center justify-between p-3 rounded-md bg-muted/50"
									>
										<div className="space-y-1">
											<p className="font-medium text-sm">{project.name}</p>
											<div className="flex items-center gap-2 text-xs text-muted-foreground">
												<Clock className="h-3 w-3" />
												{format(project.createdAt, "MMM d, yyyy")}
											</div>
										</div>
										<Badge
											variant={
												project.visibility === "public" ? "default" : "outline"
											}
										>
											{project.visibility}
										</Badge>
									</li>
								),
							)}
						</ul>
					)}
				</GlassCard>
			</div>
		</div>
	);
}
