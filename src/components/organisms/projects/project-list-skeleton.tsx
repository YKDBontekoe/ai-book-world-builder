import { GridList } from "@/components/atoms/grid-list";
import { Skeleton } from "@/components/atoms/skeleton";
import { GlassCard } from "@/components/molecules/glass-card";

export function ProjectListSkeleton() {
	return (
		<div className="space-y-6 relative pb-20">
			{/* Toolbar Skeleton */}
			<div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
				<div className="w-full sm:max-w-md">
					<Skeleton className="h-10 w-full rounded-lg" />
				</div>
				<div className="flex items-center gap-2 w-full sm:w-auto">
					<Skeleton className="h-10 w-[140px] rounded-lg" />
					<div className="h-8 w-px bg-border/50 mx-1" />
					<Skeleton className="h-10 w-[80px] rounded-lg" />
					<Skeleton className="h-10 w-[180px] rounded-lg" />
				</div>
			</div>

			{/* Grid Skeleton */}
			<GridList columns={{ sm: 2, lg: 3, xl: 4 }} gap={8}>
				{Array.from({ length: 8 }).map((_, index) => (
					<GlassCard
						// biome-ignore lint/suspicious/noArrayIndexKey: strictly for skeleton
						key={index}
						variant="liquid"
						className="h-full flex flex-col justify-between space-y-6 p-6"
					>
						<div className="space-y-4">
							<div className="flex items-center gap-3">
								<Skeleton className="h-12 w-12 rounded-xl" />
								<div className="space-y-2 flex-1">
									<Skeleton className="h-5 w-3/4 rounded-md" />
								</div>
							</div>
							<div className="space-y-2">
								<Skeleton className="h-4 w-full rounded-md" />
								<Skeleton className="h-4 w-2/3 rounded-md" />
							</div>
						</div>
						<div className="flex items-center justify-between pt-4 border-t border-border/30">
							<Skeleton className="h-4 w-24 rounded-md" />
							<Skeleton className="h-4 w-4 rounded-full" />
						</div>
					</GlassCard>
				))}
			</GridList>
		</div>
	);
}
