import { Skeleton } from "@/components/atoms/skeleton";
import { GlassCard } from "@/components/molecules/glass-card";

/**
 * Skeleton UI for GitHub item detail (issue or PR) used during loading.
 * Renders skeleton placeholders for the item detail and comments.
 * @returns The rendered skeleton component.
 */
export function ItemDetailSkeleton(): React.JSX.Element {
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<Skeleton className="h-8 w-24 rounded-lg" />
				<div className="flex gap-2">
					<Skeleton className="h-9 w-32 rounded-lg" />
					<Skeleton className="h-9 w-32 rounded-lg" />
					<Skeleton className="h-9 w-32 rounded-lg" />
				</div>
			</div>

			<GlassCard className="p-6" variant="liquid">
				<div className="flex flex-col gap-4">
					<div className="flex items-start gap-4">
						<div className="pt-1">
							<Skeleton className="h-6 w-6 rounded-full" />
						</div>
						<div className="flex-1 space-y-2">
							<Skeleton className="h-8 w-3/4 rounded-lg" />
							<div className="flex items-center gap-2">
								<Skeleton className="h-5 w-16 rounded-full" />
								<Skeleton className="h-4 w-48 rounded-lg" />
							</div>
						</div>
					</div>

					<div className="border-t border-border/50 pt-4 mt-2">
						<div className="space-y-2">
							<Skeleton className="h-4 w-full rounded-lg" />
							<Skeleton className="h-4 w-full rounded-lg" />
							<Skeleton className="h-4 w-2/3 rounded-lg" />
						</div>
					</div>
				</div>
			</GlassCard>

			{/* Placeholder for comment section skeleton which might be rendered separately or included here */}
			<div className="space-y-4">
				<Skeleton className="h-6 w-32 rounded-lg" />
				<div className="space-y-4">
					<GlassCard className="p-4" variant="liquid">
						<div className="flex items-center gap-2 mb-2">
							<Skeleton className="h-6 w-6 rounded-full" />
							<Skeleton className="h-4 w-24 rounded-lg" />
							<Skeleton className="h-3 w-16 rounded-lg" />
						</div>
						<Skeleton className="h-4 w-full rounded-lg" />
					</GlassCard>
					<GlassCard className="p-4" variant="liquid">
						<div className="flex items-center gap-2 mb-2">
							<Skeleton className="h-6 w-6 rounded-full" />
							<Skeleton className="h-4 w-24 rounded-lg" />
							<Skeleton className="h-3 w-16 rounded-lg" />
						</div>
						<Skeleton className="h-4 w-full rounded-lg" />
					</GlassCard>
				</div>
			</div>
		</div>
	);
}
