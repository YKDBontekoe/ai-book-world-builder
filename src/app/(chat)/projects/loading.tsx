import { GridList } from "@/components/atoms/grid-list";
import { Skeleton } from "@/components/atoms/skeleton";
import { GlassCard } from "@/components/molecules/glass-card";
import { PageContainer } from "@/components/organisms/page-container";

export default function ProjectsLoading() {
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
					<Skeleton className="h-10 w-[240px] rounded-lg bg-muted" />
				</div>

				{/* Grid Content Skeleton */}
				<div className="mt-6">
					<GridList columns={{ sm: 2, lg: 3, xl: 4 }} gap={8}>
						{Array.from({ length: 8 }).map((_, i) => (
							<GlassCard
								// biome-ignore lint/suspicious/noArrayIndexKey: Skeleton list has no stable IDs
								key={i}
								variant="liquid"
								className="h-[200px] p-6 flex flex-col justify-between"
							>
								<div className="space-y-4">
									<div className="flex items-center gap-3 pr-8 pl-6">
										<Skeleton className="h-12 w-12 rounded-xl" />
										<Skeleton className="h-6 w-32 rounded-lg" />
									</div>
									<div className="space-y-2">
										<Skeleton className="h-4 w-full rounded" />
										<Skeleton className="h-4 w-2/3 rounded" />
									</div>
								</div>
								<div className="flex justify-between items-center pt-4 border-t border-border/30">
									<Skeleton className="h-3 w-24 rounded" />
									<Skeleton className="h-3 w-3 rounded-full" />
								</div>
							</GlassCard>
						))}
					</GridList>
				</div>
			</div>
		</PageContainer>
	);
}
