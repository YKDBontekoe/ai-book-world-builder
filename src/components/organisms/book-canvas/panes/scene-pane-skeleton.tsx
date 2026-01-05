import { Skeleton } from "@/components/atoms/skeleton";

export function ScenePaneSkeleton() {
	return (
		<div className="p-4 space-y-6">
			{/* Header Skeleton */}
			<div className="flex items-center justify-between mb-6">
				<div className="space-y-2">
					<Skeleton className="h-6 w-32" />
					<Skeleton className="h-4 w-48" />
				</div>
				<Skeleton className="h-8 w-24 rounded-md" />
			</div>

			{/* Chapter Sections */}
			<div className="space-y-6">
				{[1, 2, 3].map((i) => (
					<div key={i} className="space-y-2">
						{/* Chapter Header */}
						<div className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
							<div className="space-y-2">
								<Skeleton className="h-5 w-40" />
								<Skeleton className="h-3 w-16" />
							</div>
							<Skeleton className="h-4 w-4 rounded-full" />
						</div>

						{/* Scene Cards */}
						<div className="px-1 space-y-3">
							{[1, 2].map((j) => (
								<div
									key={j}
									className="rounded-lg border bg-card p-3 shadow-sm space-y-3"
								>
									{/* Card Header */}
									<div className="flex items-center gap-3">
										<Skeleton className="h-5 w-5 rounded-full" />
										<div className="space-y-1.5 flex-1">
											<Skeleton className="h-4 w-3/4" />
											<Skeleton className="h-3 w-full" />
										</div>
										<Skeleton className="h-6 w-6 rounded-md" />
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
