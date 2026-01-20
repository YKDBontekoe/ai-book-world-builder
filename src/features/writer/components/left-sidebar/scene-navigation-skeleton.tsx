import { Skeleton } from "@/components/atoms/skeleton";

export function SceneNavigationSkeleton() {
	return (
		<div className="flex flex-col h-full overflow-hidden">
			{/* Search Bar Area */}
			<div className="px-4 py-2 space-y-2">
				<Skeleton className="h-9 w-full rounded-md" />
				<div className="flex items-center justify-between">
					<Skeleton className="h-4 w-20 rounded" />
					<div className="flex gap-1">
						<Skeleton className="h-6 w-6 rounded" />
						<Skeleton className="h-6 w-6 rounded" />
						<Skeleton className="h-6 w-6 rounded" />
					</div>
				</div>
			</div>

			{/* Chapters List */}
			<div className="flex-1 p-2 space-y-4 overflow-hidden">
				{Array.from({ length: 5 }).map((_, i) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton items
					<div key={i} className="px-2">
						{/* Chapter Header */}
						<div className="flex items-center gap-2 py-2">
							<Skeleton className="h-4 w-4 rounded-sm shrink-0" />
							<Skeleton className="h-4 w-32 rounded" />
						</div>

						{/* Scenes (Simulating expanded state for some) */}
						<div className="pl-6 space-y-2 mt-1 border-l ml-2 border-border/50">
							{Array.from({ length: 3 }).map((_, j) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton items
								<div key={j} className="flex items-center gap-2 py-1">
									<Skeleton className="h-3 w-3 rounded-full shrink-0" />
									<Skeleton className="h-3 w-24 rounded" />
								</div>
							))}
							<Skeleton className="h-3 w-16 rounded opacity-50 mt-2" />
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
