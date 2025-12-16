import { PageContainer } from "@/components/page-container";
import { Card, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ExportsLoading() {
	return (
		<PageContainer>
			<div className="flex flex-wrap items-start justify-between gap-4 mb-8">
				<div className="space-y-2">
					<Skeleton className="h-8 w-48 rounded-lg" />
					<Skeleton className="h-4 w-96 rounded-lg" />
				</div>
			</div>

			<div className="grid gap-4">
				{Array.from({ length: 5 }).map((_, i) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: Loading skeleton doesn't need stable keys
					<Card key={i}>
						<CardHeader className="flex flex-row items-center justify-between gap-4">
							<div className="flex items-center gap-4">
								<Skeleton className="size-8 rounded-lg" />
								<div className="space-y-2">
									<Skeleton className="h-5 w-48 rounded-lg" />
									<div className="flex gap-2">
										<Skeleton className="h-5 w-16 rounded-md" />
										<Skeleton className="h-5 w-32 rounded-md" />
									</div>
								</div>
							</div>
							<div className="flex items-center gap-2">
								<Skeleton className="h-9 w-24 rounded-lg" />
								<Skeleton className="h-9 w-9 rounded-lg" />
							</div>
						</CardHeader>
					</Card>
				))}
			</div>
		</PageContainer>
	);
}
