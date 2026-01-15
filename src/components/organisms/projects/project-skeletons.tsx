import type React from "react";
import { Skeleton } from "@/components/atoms/skeleton";
import { GlassCard } from "@/components/molecules/glass-card";

export function ProjectCardSkeleton(): React.JSX.Element {
	return (
		<GlassCard
			variant="liquid"
			className="h-full flex flex-col justify-between space-y-6 p-6"
		>
			<div className="space-y-4">
				<div className="flex items-center gap-3 pr-8 pl-6">
					<Skeleton className="h-12 w-12 rounded-xl shrink-0" />
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
	);
}

export function ProjectListSkeleton(): React.JSX.Element {
	return (
		<GlassCard
			variant="liquid"
			className="flex flex-row items-center justify-between gap-4 p-4"
		>
			<div className="flex items-center gap-4 flex-1">
				<Skeleton className="h-10 w-10 rounded-lg shrink-0" />
				<div className="space-y-2 flex-1 max-w-md">
					<Skeleton className="h-5 w-48 rounded" />
					<Skeleton className="h-3 w-64 rounded" />
				</div>
			</div>
			<div className="flex items-center gap-6">
				<Skeleton className="h-3 w-24 rounded hidden sm:block" />
				<Skeleton className="h-3 w-3 rounded-full" />
			</div>
		</GlassCard>
	);
}
