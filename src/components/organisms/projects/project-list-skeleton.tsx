import { ProjectRowSkeleton } from "@/components/organisms/projects/project-row-skeleton";

const SKELETON_COUNT = 5;

export function ProjectListSkeleton(): React.JSX.Element {
	return (
		<div className="flex flex-col gap-3">
			{Array.from({ length: SKELETON_COUNT }).map((_, i) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: This is a skeleton loader, so the key is not important
				<ProjectRowSkeleton key={i} />
			))}
		</div>
	);
}
