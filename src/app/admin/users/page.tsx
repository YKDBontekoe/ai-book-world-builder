import Link from "next/link";
import { getUsers } from "@/app/actions/admin";
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import { GlassCard } from "@/components/molecules/glass-card";

// Note: Table component might not exist in atoms. Checking file structure...
// list_files didn't show table.tsx in atoms.
// I'll assume standard HTML table or check if there's a Shadcn Table.
// If missing, I'll use standard HTML with Tailwind classes for now to be safe.

export default async function UsersPage({
	searchParams,
}: {
	searchParams: Promise<{ page?: string }>;
}) {
	const page = Number((await searchParams).page) || 1;
	const result = await getUsers({ page });

	if (!result.success) {
		return (
			<div className="p-4 sm:p-6 text-destructive">
				Error loading users: {result.error}
			</div>
		);
	}

	const { users, total, pageSize } = result.data;
	const totalPages = Math.ceil(total / (pageSize || 10));

	return (
		<div className="space-y-8">
			<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
				<h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Users</h1>
			</div>

			<div className="grid gap-4 md:hidden">
				{users.map(
					(user: {
						id: string;
						name: string | null;
						email: string;
						role: string;
						bannedAt: Date | null;
					}) => (
						<GlassCard key={user.id} className="p-4 space-y-3">
							<div className="space-y-1">
								<p className="text-base font-semibold">{user.name || "N/A"}</p>
								<p className="text-sm text-muted-foreground">{user.email}</p>
							</div>
							<div className="flex flex-wrap gap-2">
								<Badge
									variant={user.role === "admin" ? "default" : "secondary"}
								>
									{user.role}
								</Badge>
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
							</div>
							<Button asChild variant="outline" size="sm" className="w-full">
								<Link href={`/admin/users/${user.id}`}>View Details</Link>
							</Button>
						</GlassCard>
					),
				)}
			</div>

			<GlassCard className="hidden md:block p-0 overflow-hidden">
				<div className="w-full overflow-auto">
					<table className="w-full caption-bottom text-sm">
						<thead className="[&_tr]:border-b">
							<tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
								<th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
									Name
								</th>
								<th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
									Email
								</th>
								<th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
									Role
								</th>
								<th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
									Status
								</th>
								<th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
									Actions
								</th>
							</tr>
						</thead>
						<tbody className="[&_tr:last-child]:border-0">
							{users.map(
								(user: {
									id: string;
									name: string | null;
									email: string;
									role: string;
									bannedAt: Date | null;
								}) => (
									<tr
										key={user.id}
										className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
									>
										<td className="p-4 align-middle font-medium">
											{user.name || "N/A"}
										</td>
										<td className="p-4 align-middle">{user.email}</td>
										<td className="p-4 align-middle">
											<Badge
												variant={
													user.role === "admin" ? "default" : "secondary"
												}
											>
												{user.role}
											</Badge>
										</td>
										<td className="p-4 align-middle">
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
										</td>
										<td className="p-4 align-middle text-right">
											<Button asChild variant="ghost" size="sm">
												<Link href={`/admin/users/${user.id}`}>
													View Details
												</Link>
											</Button>
										</td>
									</tr>
								),
							)}
						</tbody>
					</table>
				</div>
			</GlassCard>

			{/* Pagination (Simple) */}
			<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end sm:space-x-2">
				<Button variant="outline" size="sm" disabled={page <= 1} asChild>
					<Link href={`/admin/users?page=${page - 1}`}>Previous</Link>
				</Button>
				<span className="text-sm text-muted-foreground text-center">
					Page {page} of {totalPages}
				</span>
				<Button
					variant="outline"
					size="sm"
					disabled={page >= totalPages}
					asChild
				>
					<Link href={`/admin/users?page=${page + 1}`}>Next</Link>
				</Button>
			</div>
		</div>
	);
}
