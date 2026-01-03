import { Skeleton } from "@/components/atoms/skeleton";
import { GlassCard } from "@/components/molecules/glass-card";

export default function DashboardLoading() {
	return (
		<div className="flex-1 h-full overflow-y-auto p-8 space-y-8">
			{/* Header Skeleton */}
			<div className="flex items-center justify-between">
				<div className="space-y-2">
					<Skeleton className="h-9 w-64 rounded-lg" />
					<Skeleton className="h-5 w-48 rounded-lg opacity-60" />
				</div>
			</div>

			{/* Metric Cards Grid Skeleton */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				{Array.from({ length: 4 }).map((_, i) => (
					<GlassCard
						// biome-ignore lint/suspicious/noArrayIndexKey: Skeleton list
						key={i}
						variant="liquid"
						className="p-6 flex flex-col gap-4"
					>
						<Skeleton className="h-4 w-24 rounded opacity-70" />
						<Skeleton className="h-8 w-32 rounded-lg" />
					</GlassCard>
				))}
			</div>

			{/* Charts Grid Skeleton */}
			<div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
				{/* Usage Chart Skeleton */}
				<GlassCard className="p-6">
					<div className="mb-6 flex items-center gap-2">
						<Skeleton className="h-6 w-48 rounded-lg" />
					</div>
					<div className="space-y-6">
						{/* Tabs Skeleton */}
						<div className="grid grid-cols-2 gap-2 mb-4">
							<Skeleton className="h-9 rounded-md bg-muted/50" />
							<Skeleton className="h-9 rounded-md bg-muted/50" />
						</div>
						{/* Chart Area */}
						<Skeleton className="h-[240px] w-full rounded-lg" />
						{/* Footer Stats */}
						<div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/30">
							<div className="space-y-2">
								<Skeleton className="h-3 w-20 rounded opacity-60" />
								<Skeleton className="h-6 w-24 rounded" />
							</div>
							<div className="space-y-2">
								<Skeleton className="h-3 w-20 rounded opacity-60" />
								<Skeleton className="h-6 w-24 rounded" />
							</div>
						</div>
					</div>
				</GlassCard>

				{/* Entity Insights Skeleton */}
				<GlassCard className="p-6">
					<div className="mb-6 flex items-center gap-2">
						<Skeleton className="h-6 w-48 rounded-lg" />
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{/* Pie Chart Card Skeleton */}
						<div className="rounded-xl border border-dashed border-border/50 p-4 space-y-4">
							<Skeleton className="h-5 w-32 rounded mb-2" />
							<div className="flex justify-center py-4">
								<Skeleton className="h-32 w-32 rounded-full" />
							</div>
							<div className="flex flex-wrap gap-2 justify-center">
								{Array.from({ length: 4 }).map((_, j) => (
									<Skeleton
										// biome-ignore lint/suspicious/noArrayIndexKey: Skeleton list
										key={j}
										className="h-3 w-16 rounded-full"
									/>
								))}
							</div>
						</div>

						{/* Top Connected List Skeleton */}
						<div className="rounded-xl border border-dashed border-border/50 p-4 space-y-4">
							<Skeleton className="h-5 w-32 rounded mb-2" />
							<div className="space-y-3">
								{Array.from({ length: 5 }).map((_, k) => (
									<div
										// biome-ignore lint/suspicious/noArrayIndexKey: Skeleton list
										key={k}
										className="flex items-center justify-between"
									>
										<div className="flex items-center gap-3">
											<Skeleton className="h-3 w-4 rounded" />
											<div className="space-y-1">
												<Skeleton className="h-4 w-24 rounded" />
												<Skeleton className="h-3 w-12 rounded opacity-60" />
											</div>
										</div>
										<Skeleton className="h-6 w-12 rounded" />
									</div>
								))}
							</div>
						</div>
					</div>
				</GlassCard>
			</div>
		</div>
	);
}
