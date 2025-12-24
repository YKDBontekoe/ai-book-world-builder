import { Skeleton } from "@/components/atoms/skeleton";
import { GlassCard } from "@/components/molecules/glass-card";
import { PageContainer } from "@/components/organisms/page-container";

export default function ExportsLoading() {
	return (
		<PageContainer>
			<div className="mb-8 space-y-2">
				<Skeleton className="h-9 w-48 rounded-lg" />
				<Skeleton className="h-5 w-96 rounded-lg opacity-50" />
			</div>

			<div className="grid gap-4">
				{Array.from({ length: 5 }).map((_, i) => (
					<GlassCard
						// biome-ignore lint/suspicious/noArrayIndexKey: Skeleton loading requires array index keys
						key={i}
						variant="liquid"
						className="flex items-center justify-between p-6"
					>
						<div className="flex items-center gap-4">
							<Skeleton className="h-8 w-8 rounded-lg" />
							<div className="space-y-2">
								<Skeleton className="h-5 w-48 rounded" />
								<div className="flex gap-2">
									<Skeleton className="h-4 w-12 rounded-full" />
									<Skeleton className="h-4 w-32 rounded" />
								</div>
							</div>
						</div>
						<div className="flex gap-2">
							<Skeleton className="h-9 w-9 rounded-md" />
						</div>
					</GlassCard>
				))}
			</div>
		</PageContainer>
	);
}
