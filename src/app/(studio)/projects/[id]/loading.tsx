import { WriterSkeleton } from "@/features/writer/components/writer-skeleton";

export default function ProjectLoading() {
	return (
		<div className="h-[calc(100vh-theme(spacing.16))] w-full">
			<WriterSkeleton />
		</div>
	);
}
