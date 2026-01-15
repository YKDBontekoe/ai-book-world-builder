import { GridList } from "@/components/atoms/grid-list";
import { Skeleton } from "@/components/atoms/skeleton";
import { PageContainer } from "@/components/organisms/page-container";
import { ProjectCardSkeleton } from "@/components/organisms/projects/project-skeletons";

export default function ProjectsLoading(): React.JSX.Element {
	return (
		<PageContainer className="p-8 md:p-12 max-w-[1800px] mx-auto">
			{/* PageHeader Skeleton */}
			<div className="mb-8 flex flex-wrap items-start justify-between gap-4">
				<div className="space-y-1">
					<Skeleton className="h-8 w-32 rounded-lg" />
				</div>
				<div>
					<Skeleton className="h-10 w-32 rounded-lg" />
				</div>
			</div>

			<div className="mt-8">
				{/* ProjectTabs Skeleton */}
				<div className="mb-6">
					<Skeleton className="h-10 w-[240px] rounded-lg bg-muted/50" />
				</div>

				{/* Grid Content Skeleton */}
				<div className="mt-6">
					<GridList columns={{ sm: 2, lg: 3, xl: 4 }} gap={8}>
						{Array.from({ length: 8 }).map((_, i) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: Skeleton list has no stable IDs
							<ProjectCardSkeleton key={i} />
						))}
					</GridList>
				</div>
			</div>
		</PageContainer>
	);
}
