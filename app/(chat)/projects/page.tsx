import { formatDistanceToNow } from "date-fns";
import { CalendarIcon, FolderIcon, Globe, User } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth";
import { PageContainer } from "@/components/page-container";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { GlassCard } from "@/components/ui/glass-card";
import { GridList } from "@/components/ui/grid-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getProjectsVisibleToUser } from "@/lib/db/queries";
import type { Project } from "@/lib/db/schema";

function ProjectCard({ project }: { project: Project }) {
	return (
		<Link href={`/projects/${project.id}`} className="block h-full">
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
				<div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border/50">
					<div className="flex items-center">
						<CalendarIcon className="mr-1 h-3 w-3" />
						<span>
							{formatDistanceToNow(project.createdAt, {
								addSuffix: true,
							})}
						</span>
					</div>
					{project.visibility === "public" && <Globe className="h-3 w-3" />}
				</div>
			</GlassCard>
		</Link>
	);
}

export default async function ProjectsPage() {
	const session = await auth();

	if (!session?.user?.id) {
		redirect("/");
	}

	const myProjects = await getProjectsVisibleToUser({
		userId: session.user.id,
		filter: "mine",
	});

	const sharedProjects = await getProjectsVisibleToUser({
		userId: session.user.id,
		filter: "shared",
	});

	return (
		<PageContainer className="p-8">
			<PageHeader title="Projects" />

			<Tabs defaultValue="mine" className="mt-6">
				<TabsList className="mb-6">
					<TabsTrigger value="mine" className="gap-2">
						<User className="h-4 w-4" />
						My Projects
					</TabsTrigger>
					<TabsTrigger value="shared" className="gap-2">
						<Globe className="h-4 w-4" />
						Community
					</TabsTrigger>
				</TabsList>

				<TabsContent value="mine">
					{myProjects.length === 0 ? (
						<EmptyState
							title="No projects found"
							description="Create a new story to get started with your first project."
							icon={FolderIcon}
						/>
					) : (
						<GridList columns={{ sm: 2, lg: 3 }}>
							{myProjects.map((project) => (
								<ProjectCard key={project.id} project={project} />
							))}
						</GridList>
					)}
				</TabsContent>

				<TabsContent value="shared">
					{sharedProjects.length === 0 ? (
						<EmptyState
							title="No shared projects"
							description="Explore projects shared by the community here."
							icon={Globe}
						/>
					) : (
						<GridList columns={{ sm: 2, lg: 3 }}>
							{sharedProjects.map((project) => (
								<ProjectCard key={project.id} project={project} />
							))}
						</GridList>
					)}
				</TabsContent>
			</Tabs>
		</PageContainer>
	);
}
