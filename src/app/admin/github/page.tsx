import { GitHubDashboard } from "@/components/admin/github/github-dashboard";

export default function GitHubAdminPage() {
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">GitHub Management</h1>
				<p className="text-muted-foreground mt-2">
					Manage pull requests and issues for this repository.
				</p>
			</div>

			<GitHubDashboard />
		</div>
	);
}
