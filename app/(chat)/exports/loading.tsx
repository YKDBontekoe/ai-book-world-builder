import { PageContainer } from "@/components/page-container";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
	return (
		<PageContainer>
			<div className="mb-8 space-y-2">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-4 w-96" />
			</div>

			<div className="grid gap-4">
				{Array.from({ length: 3 }).map((_, i) => (
					<Skeleton key={i} className="h-32 w-full rounded-xl" />
				))}
			</div>
		</PageContainer>
	);
}
