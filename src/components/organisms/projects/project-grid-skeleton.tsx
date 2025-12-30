import { GridList } from "@/components/atoms/grid-list";
import { ProjectCardSkeleton } from "@/components/organisms/projects/project-card-skeleton";

const SKELETON_COUNT = 8;

export function ProjectGridSkeleton() {
	return (
		<GridList columns={{ sm: 2, lg: 3, xl: 4 }} gap={8}>
			{Array.from({ length: SKELETON_COUNT }).map((_, i) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: This is a skeleton loader, so the key is not important
				<ProjectCardSkeleton key={i} />
			))}
		</GridList>
	);
}
