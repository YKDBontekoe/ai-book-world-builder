import type React from "react";
import { SheetContent } from "@/components/atoms/sheet";
import { Skeleton } from "@/components/atoms/skeleton";

export function ProjectPreviewSheetSkeleton() {
	return (
		<SheetContent className="w-full sm:max-w-md bg-background/80 backdrop-blur-xl border-l border-border/50 p-0 overflow-hidden flex flex-col">
			{/* Header */}
			<div className="relative h-32 bg-muted/20 shrink-0">
				<div className="absolute bottom-6 left-6 right-6 space-y-2">
					<Skeleton className="h-8 w-3/4" />
					<Skeleton className="h-4 w-full" />
				</div>
			</div>

			<div className="flex-1 overflow-y-auto p-6 space-y-8">
				{/* Key Stats Grid */}
				<div className="grid grid-cols-3 gap-3">
					{[1, 2, 3].map((i) => (
						<div
							key={i}
							className="flex flex-col items-center justify-center p-3 rounded-xl border bg-muted/10 gap-2"
						>
							<Skeleton className="h-4 w-4 rounded-full" />
							<Skeleton className="h-6 w-12" />
							<Skeleton className="h-3 w-8" />
						</div>
					))}
				</div>

				{/* Recent Activity */}
				<div className="space-y-3">
					<Skeleton className="h-4 w-32" />
					<div className="rounded-lg border bg-muted/5 p-4 flex items-center justify-between">
						<div className="space-y-2 flex-1">
							<Skeleton className="h-4 w-48" />
							<Skeleton className="h-3 w-32" />
						</div>
						<Skeleton className="h-4 w-4 rounded-full" />
					</div>
				</div>

				{/* Structure Preview */}
				<div className="space-y-3">
					<Skeleton className="h-4 w-40" />
					<div className="space-y-2">
						{[1, 2, 3, 4, 5].map((i) => (
							<div
								key={i}
								className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
							>
								<Skeleton className="h-4 w-full max-w-[200px]" />
								<Skeleton className="h-5 w-16 rounded-full" />
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Footer Actions */}
			<div className="p-6 border-t border-border/50 bg-background/50 backdrop-blur-sm">
				<Skeleton className="h-11 w-full rounded-md" />
			</div>
		</SheetContent>
	);
}
