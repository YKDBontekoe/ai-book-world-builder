import { GridList } from "@/components/atoms/grid-list";
import { Skeleton } from "@/components/atoms/skeleton";
import { GlassCard } from "@/components/molecules/glass-card";
import { PageContainer } from "@/components/organisms/page-container";

export default function InspirationLoading() {
	return (
		<PageContainer>
			{/* Page Header Skeleton */}
			<div className="mb-8 space-y-2">
				<Skeleton className="h-8 w-48 rounded-lg" />
				<Skeleton className="h-4 w-96 rounded-lg opacity-70" />
				<Skeleton className="h-4 w-32 rounded-lg opacity-50" />
			</div>

			<div className="space-y-8">
				{/* Section Header */}
				<div className="flex items-center gap-2">
					<Skeleton className="h-5 w-5 rounded-full" />
					<Skeleton className="h-6 w-40 rounded-lg" />
				</div>

				<GridList columns={{ md: 2 }}>
					{Array.from({ length: 4 }).map((_, i) => (
						<GlassCard
							// biome-ignore lint/suspicious/noArrayIndexKey: Skeleton list has no stable IDs
							key={i}
							variant="liquid"
							className="flex flex-col gap-4 p-6"
						>
							<div className="flex items-start justify-between gap-4">
								<div className="flex items-center gap-4">
									<Skeleton className="h-12 w-12 rounded-xl" />
									<div className="space-y-2">
										<Skeleton className="h-5 w-48 rounded" />
										<Skeleton className="h-3 w-32 rounded opacity-70" />
									</div>
								</div>
								<Skeleton className="h-6 w-16 rounded-full" />
							</div>

							<div className="pt-2">
								<Skeleton className="h-10 w-full rounded-lg" />
							</div>
						</GlassCard>
					))}
				</GridList>
			</div>
		</PageContainer>
	);
}
