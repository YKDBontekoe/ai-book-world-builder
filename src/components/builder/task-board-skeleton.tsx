import type { JSX } from "react";
import { Skeleton } from "@/components/atoms/skeleton";

export function TaskBoardSkeleton(): JSX.Element {
	return (
		<div className="flex-1 min-h-0 overflow-x-auto pb-4">
			<div className="flex h-full gap-6 min-w-[1000px]">
				{[1, 2, 3, 4].map((colIndex) => (
					<div key={colIndex} className="w-[300px] flex-shrink-0 flex flex-col">
						{/* Column Header Skeleton */}
						<div className="flex items-center justify-between mb-3 px-1">
							<Skeleton className="h-5 w-24 rounded-md" />
							<Skeleton className="h-5 w-8 rounded-full" />
						</div>

						{/* Card Skeletons */}
						<div className="flex-1 overflow-y-auto pr-2 space-y-3">
							{[1, 2, 3].map((cardIndex) => (
								<div
									key={cardIndex}
									className="p-4 rounded-lg border border-border/40 bg-background/20 space-y-3"
								>
									<div className="flex justify-between items-start">
										<Skeleton className="h-4 w-16" />
										<Skeleton className="h-4 w-12 rounded-full" />
									</div>
									<Skeleton className="h-4 w-full" />
									<Skeleton className="h-4 w-3/4" />
									<div className="flex justify-between items-center pt-2">
										<div className="flex items-center gap-2">
											<Skeleton className="h-5 w-5 rounded-full" />
											<Skeleton className="h-3 w-16" />
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
