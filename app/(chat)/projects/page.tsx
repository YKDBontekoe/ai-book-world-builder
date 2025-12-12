import { formatDistanceToNow } from "date-fns";
import { CalendarIcon, FolderIcon } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth";
import { PageContainer } from "@/components/page-container";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { GlassCard } from "@/components/ui/glass-card";
import { GridList } from "@/components/ui/grid-list";
import { getProjectsVisibleToUser } from "@/lib/db/queries";

export default async function ProjectsPage() {
	const session = await auth();

	if (!session?.user?.id) {
		redirect("/");
	}

	const projects = await getProjectsVisibleToUser({
		userId: session.user.id,
	});

	return (
		<PageContainer className="p-8">
			<PageHeader title="Projects" />

			{projects.length === 0 ? (
				<EmptyState
					title="No projects found"
					description="Create a new story to get started with your first project."
					icon={FolderIcon}
				/>
			) : (
				<GridList columns={{ sm: 2, lg: 3 }}>
					{projects.map((project) => (
						<Link
							key={project.id}
							href={`/projects/${project.id}`}
							className="block h-full"
						>
							<GlassCard
								variant="default"
								interactive
								className="h-full flex flex-col justify-between space-y-4"
							>
								<div className="space-y-2">
									<div className="flex items-center gap-2">
										<div className="p-2 rounded-md bg-primary/10">
											<FolderIcon className="h-5 w-5 text-primary" />
										</div>
										<h3 className="font-semibold truncate">{project.name}</h3>
									</div>
									{project.description && (
										<p className="text-sm text-muted-foreground line-clamp-2">
											{project.description}
										</p>
									)}
								</div>
								<div className="flex items-center text-xs text-muted-foreground pt-4 border-t border-border/50">
									<CalendarIcon className="mr-1 h-3 w-3" />
									<span>
										Created{" "}
										{formatDistanceToNow(project.createdAt, {
											addSuffix: true,
										})}
									</span>
								</div>
							</GlassCard>
						</Link>
					))}
				</GridList>
			)}
		</PageContainer>
	);
}
