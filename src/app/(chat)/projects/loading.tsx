import { PageContainer } from "@/components/organisms/page-container";
import { ProjectBrowserSkeleton } from "@/components/organisms/projects/project-browser-skeleton";
import { ProjectTabs } from "@/components/organisms/projects/project-tabs";
import { Skeleton } from "@/components/atoms/skeleton";

export default function ProjectsLoading() {
	return (
		<PageContainer className="p-8 md:p-12 max-w-[1800px] mx-auto">
			<div className="mb-8">
				<div
					className="flex flex-wrap items-start justify-between gap-4"
					data-testid="projects-header-skeleton"
				>
					<div className="space-y-1">
						<Skeleton className="h-8 w-32" />
					</div>
					<div>
						<Skeleton className="h-10 w-36" />
					</div>
				</div>
			</div>

			<div className="mt-8">
				<ProjectTabs currentTab="mine" />

				<div className="mt-6">
					<ProjectBrowserSkeleton />
				</div>
			</div>
		</PageContainer>
	);
}
