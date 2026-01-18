import { redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/app/(auth)/auth";
import { PageHeader } from "@/components/molecules/page-header";
import { PageContainer } from "@/components/organisms/page-container";
import { CreateProjectDialog } from "@/components/organisms/projects/create-project-dialog";
import { ProjectListContainer } from "@/components/organisms/projects/project-list-container";
import { ProjectListSkeleton } from "@/components/organisms/projects/project-list-skeleton";
import { ProjectTabs } from "@/components/organisms/projects/project-tabs";

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

	return (
		<PageContainer className="p-8 md:p-12 max-w-[1800px] mx-auto">
			<div className="mb-8">
				<PageHeader title="Projects" action={<CreateProjectDialog />} />
			</div>

			<div className="mt-8">
				<ProjectTabs currentTab={currentTab} />

				<div className="mt-6">
					<Suspense fallback={<ProjectListSkeleton />}>
						<ProjectListContainer
							userId={session.user.id}
							filter={currentTab}
						/>
					</Suspense>
				</div>
			</div>
		</PageContainer>
	);
}
