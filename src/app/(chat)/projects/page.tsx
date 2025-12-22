import { FolderIcon, Globe, Plus } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth";
import { Button } from "@/components/atoms/button";
import { EmptyState } from "@/components/molecules/empty-state";
import { PageHeader } from "@/components/molecules/page-header";
import { PageContainer } from "@/components/organisms/page-container";
import { CreateProjectDialog } from "@/components/organisms/projects/create-project-dialog";
import { ProjectBrowser } from "@/components/organisms/projects/project-browser";
import { ProjectTabs } from "@/components/organisms/projects/project-tabs";
import { getProjectsVisibleToUser } from "@/lib/db/queries";

export default async function ProjectsPage({
	searchParams,
}: {
	searchParams: Promise<{ tab?: string }>;
}) {
	const session = await auth();

	if (!session?.user?.id) {
		redirect("/");
	}

	const { tab } = await searchParams;
	const currentTab = tab === "shared" ? "shared" : "mine";

	const projects = await getProjectsVisibleToUser({
		userId: session.user.id,
		filter: currentTab,
	});

	return (
		<PageContainer className="p-8 md:p-12 max-w-[1800px] mx-auto">
			<div className="mb-8">
				<PageHeader title="Projects" action={<CreateProjectDialog />} />
			</div>

			<div className="mt-8">
				<ProjectTabs currentTab={currentTab} />

				<div className="mt-6">
					{projects.length === 0 ? (
						currentTab === "mine" ? (
							<EmptyState
								variant="glass"
								title="No projects found"
								description="Create a new story to get started with your first project."
								icon={FolderIcon}
								action={
									<CreateProjectDialog
										trigger={
											<Button className="gap-2">
												<Plus className="h-4 w-4" />
												Create Story
											</Button>
										}
									/>
								}
							/>
						) : (
							<EmptyState
								variant="glass"
								title="No shared projects"
								description="Explore projects shared by the community here."
								icon={Globe}
							/>
						)
					) : (
						<ProjectBrowser projects={projects} />
					)}
				</div>
			</div>
		</PageContainer>
	);
}
