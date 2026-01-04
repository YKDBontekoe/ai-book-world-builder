import { Users as UsersIcon } from "lucide-react";
import Link from "next/link";
import type { JSX } from "react";
import { getUsers } from "@/app/actions/admin";
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
import { UserSearch } from "./user-search";

/**
 * UsersPage is a server component that renders a paginated, searchable list of users.
 *
 * @param props.searchParams - The URL search parameters (page, search).
 * @returns A promise resolving to the JSX element for the users page.
 */
export default async function UsersPage({
	searchParams,
}: {
	searchParams: Promise<{ page?: string; search?: string }>;
}): Promise<JSX.Element> {
	const params = await searchParams;
	const page = Number(params.page) || 1;
	const search = params.search || "";
	const result = await getUsers({ page, search });

	if (!result.success) {
		return (
			<EmptyState
				title="Error loading users"
				description={result.error}
				icon={UsersIcon}
				className="text-destructive"
			/>
		);
	}

	const { users, total, pageSize } = result.data;
	const totalPages = Math.ceil(total / (pageSize || 10));

	return (
		<div className="space-y-8">
			<div className="flex items-center justify-between">
				<h1 className="text-3xl font-bold tracking-tight">Users</h1>
				<UserSearch />
			</div>

			{users.length === 0 ? (
				<EmptyState
					title={search ? "No users match your search" : "No users found"}
					description={
						search
							? `No users found matching "${search}". Try a different search term.`
							: "There are no users in the system yet."
					}
					icon={UsersIcon}
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
							{users.map((user) => (
								<TableRow key={user.id}>
									<TableCell className="font-medium">
										{user.name || "N/A"}
									</TableCell>
									<TableCell>{user.email}</TableCell>
									<TableCell>
										<Badge
											variant={user.role === "admin" ? "default" : "secondary"}
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
											<Link href={`/admin/users/${user.id}`}>View Details</Link>
										</Button>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</GlassCard>
			)}

			{/* Pagination (Simple) */}
			{users.length > 0 && (
				<div className="flex items-center justify-end space-x-2">
					<Button variant="outline" size="sm" disabled={page <= 1} asChild>
						<Link
							href={`/admin/users?page=${page - 1}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
						>
							Previous
						</Link>
					</Button>
					<span className="text-sm text-muted-foreground">
						Page {page} of {totalPages}
					</span>
					<Button
						variant="outline"
						size="sm"
						disabled={page >= totalPages}
						asChild
					>
						<Link
							href={`/admin/users?page=${page + 1}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
						>
							Next
						</Link>
					</Button>
				</div>
			)}
		</div>
	);
}
