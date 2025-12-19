import { formatDistanceToNow } from "date-fns";
import { CalendarIcon, FolderIcon, Globe, Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth";
import { PageContainer } from "@/components/page-container";
import { PageHeader } from "@/components/page-header";
import { ProjectTabs } from "@/components/projects/project-tabs";
import { CreateProjectDialog } from "@/components/projects/create-project-dialog";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { GlassCard } from "@/components/ui/glass-card";
import { GridList } from "@/components/ui/grid-list";
import { TabsContent } from "@/components/ui/tabs";
import { getProjectsVisibleToUser } from "@/lib/db/queries";
import type { Project } from "@/lib/db/schema";

function ProjectCard({ project }: { project: Project }) {
	return (
		<Link href={`/projects/${project.id}`} className="block h-full group">
			<GlassCard
				variant="liquid"
				interactive
				className="h-full flex flex-col justify-between space-y-6 p-6"
			>
				<div className="space-y-4">
					<div className="flex items-center gap-3">
						<div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-300">
							<FolderIcon className="h-6 w-6" />
						</div>
						<h3 className="font-bold text-lg truncate tracking-tight">{project.name}</h3>
					</div>
					{project.description && (
						<p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
							{project.description}
						</p>
					)}
				</div>
				<div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border/30">
					<div className="flex items-center gap-1">
						<CalendarIcon className="h-3.5 w-3.5" />
						<span>
							{formatDistanceToNow(project.createdAt, {
								addSuffix: true,
							})}
						</span>
					</div>
					{project.visibility === "public" && <Globe className="h-3.5 w-3.5" />}
				</div>
			</GlassCard>
		</Link>
	);
}

export default async function ProjectsPage(props: {
	searchParams: Promise<{ tab?: string }>;
}) {
	const session = await auth();

	if (!session?.user?.id) {
		redirect("/");
	}

	const searchParams = await props.searchParams;
	const tab = searchParams.tab || "mine";
	const isMine = tab === "mine";

	const projects = await getProjectsVisibleToUser({
		userId: session.user.id,
		filter: isMine ? "mine" : "shared",
	});

	return (
		<PageContainer className="p-8 md:p-12 max-w-[1800px] mx-auto">
			<div className="mb-8">
				<PageHeader title="Projects" action={<CreateProjectDialog />} />
			</div>

			<ProjectTabs currentTab={tab}>
				<TabsContent value={tab} className="mt-6">
					{projects.length === 0 ? (
						<EmptyState
							variant="glass"
							title={isMine ? "No projects found" : "No shared projects"}
							description={
								isMine
									? "Create a new story to get started with your first project."
									: "Explore projects shared by the community here."
							}
							icon={isMine ? FolderIcon : Globe}
							action={
								isMine ? (
									<CreateProjectDialog
										trigger={
											<Button className="gap-2">
												<Plus className="h-4 w-4" />
												Create Story
											</Button>
										}
									/>
								) : undefined
							}
						/>
					) : (
						<GridList columns={{ sm: 2, lg: 3, xl: 4 }} gap={8}>
							{projects.map((project) => (
								<ProjectCard key={project.id} project={project} />
							))}
						</GridList>
					)}
				</TabsContent>
			</ProjectTabs>
		</PageContainer>
	);
}
