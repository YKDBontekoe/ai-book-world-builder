import { WriterSkeleton } from "@/components/organisms/writer/writer-skeleton";

export default function ProjectLoading() {
	return (
		<div className="h-[calc(100vh-theme(spacing.16))] w-full">
			<WriterSkeleton />
		</div>
	);
}
