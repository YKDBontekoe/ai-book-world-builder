import { GlassCard } from "@/components/molecules/glass-card";
import { Skeleton } from "@/components/atoms/skeleton";

export function ProjectRowSkeleton(): React.JSX.Element {
	return (
		<GlassCard
			variant="liquid"
			className="flex flex-row items-center justify-between gap-4 p-4"
		>
			<div className="flex items-center gap-4 min-w-0">
				<Skeleton className="h-9 w-9 rounded-lg" />
				<div className="space-y-1.5 min-w-0">
					<Skeleton className="h-5 w-40" />
					<Skeleton className="h-3 w-64" />
				</div>
			</div>

			<div className="flex items-center gap-6">
				<Skeleton className="h-4 w-24 hidden sm:block" />
				<Skeleton className="h-4 w-4" />
			</div>
		</GlassCard>
	);
}
