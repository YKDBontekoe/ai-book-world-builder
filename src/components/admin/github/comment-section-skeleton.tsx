import { Skeleton } from "@/components/atoms/skeleton";
import { GlassCard } from "@/components/molecules/glass-card";

/**
 * Skeleton UI for GitHub comment section used during loading.
 * @returns The rendered skeleton component.
 */
export function CommentSectionSkeleton(): React.JSX.Element {
	return (
		<div className="space-y-4">
			<div className="flex items-center gap-2">
				<Skeleton className="h-4 w-4 rounded-full" />
				<Skeleton className="h-6 w-32 rounded-lg" />
			</div>

			<div className="space-y-4">
				{Array.from({ length: 3 }).map((_, i) => (
					<GlassCard
						// biome-ignore lint/suspicious/noArrayIndexKey: Skeleton list has no stable IDs
						key={i}
						className="p-4"
						variant="liquid"
					>
						<div className="flex items-center gap-2 mb-2">
							<Skeleton className="h-6 w-6 rounded-full" />
							<Skeleton className="h-4 w-24 rounded-lg" />
							<Skeleton className="h-3 w-16 rounded-lg" />
						</div>
						<div className="space-y-2">
							<Skeleton className="h-4 w-full rounded-lg" />
							<Skeleton className="h-4 w-3/4 rounded-lg" />
						</div>
					</GlassCard>
				))}
			</div>

			<div className="flex flex-col gap-2">
				<Skeleton className="h-20 w-full rounded-lg" />
				<div className="flex justify-end">
					<Skeleton className="h-9 w-24 rounded-lg" />
				</div>
			</div>
		</div>
	);
}
