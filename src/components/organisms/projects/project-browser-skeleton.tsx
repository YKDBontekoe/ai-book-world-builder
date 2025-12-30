import { Skeleton } from "@/components/atoms/skeleton";
import { ProjectGridSkeleton } from "@/components/organisms/projects/project-grid-skeleton";

export function ProjectBrowserSkeleton() {
	return (
		<div className="space-y-6">
			<div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
				<Skeleton className="h-10 w-full sm:max-w-md" />
				<div
					className="flex items-center gap-2 w-full sm:w-auto"
					data-testid="projects-actions-skeleton"
				>
					<Skeleton className="h-10 w-full sm:w-[140px]" />
					<div className="h-8 w-px bg-border/50 mx-1" />
					<Skeleton className="h-10 w-[42px] rounded-lg" />
					<Skeleton className="h-10 w-[42px] rounded-lg" />
					<Skeleton className="h-10 w-full sm:w-[180px]" />
				</div>
			</div>

			<div className="relative min-h-[200px]">
				<ProjectGridSkeleton />
			</div>
		</div>
	);
}
