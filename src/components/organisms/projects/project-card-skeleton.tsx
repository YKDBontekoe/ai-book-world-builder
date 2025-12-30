import { GlassCard } from "@/components/molecules/glass-card";
import { Skeleton } from "@/components/atoms/skeleton";

export function ProjectCardSkeleton(): React.JSX.Element {
	return (
		<GlassCard
			variant="liquid"
			className="h-full flex flex-col justify-between space-y-6 p-6"
		>
			<div className="space-y-4">
				<div className="flex items-center gap-3 pr-8 pl-6">
					<Skeleton className="h-12 w-12 rounded-xl" />
					<Skeleton className="h-6 w-32" />
				</div>
				<div className="space-y-2">
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-5/6" />
				</div>
			</div>
			<div className="flex items-center justify-between pt-4 border-t border-border/30">
				<Skeleton className="h-4 w-24" />
				<Skeleton className="h-4 w-4" />
			</div>
		</GlassCard>
	);
}
