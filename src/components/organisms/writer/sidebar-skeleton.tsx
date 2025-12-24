import { Skeleton } from "@/components/atoms/skeleton";

export function SidebarSkeleton() {
	return (
		<div className="space-y-4 p-4">
			{/* Simulate 4 chapters */}
			{Array.from({ length: 4 }).map((_, i) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton items
				<div key={i} className="space-y-2">
					{/* Chapter header */}
					<Skeleton className="h-8 w-full rounded-md" />

					{/* Simulate scenes for the first chapter */}
					{i === 0 && (
						<div className="pl-4 space-y-2 pt-1 border-l border-border/50 ml-2">
							<Skeleton className="h-6 w-[80%] rounded-md" />
							<Skeleton className="h-6 w-[70%] rounded-md" />
							<Skeleton className="h-6 w-[85%] rounded-md" />
						</div>
					)}
				</div>
			))}
		</div>
	);
}
