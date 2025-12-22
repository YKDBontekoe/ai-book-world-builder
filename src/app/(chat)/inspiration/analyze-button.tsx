"use client";

import { Check, Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
	type AnalyzeBookResponse,
	analyzeBook,
} from "@/app/actions/book-analysis";
import { Button } from "@/components/atoms/button";

type AnalyzeBookButtonProps = {
	sourceMaterialId: string;
	projectId: string;
	filename: string;
};

export function AnalyzeBookButton({
	sourceMaterialId,
	projectId,
	filename,
}: AnalyzeBookButtonProps) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [result, setResult] = useState<AnalyzeBookResponse | null>(null);

	const handleAnalyze = () => {
		startTransition(async () => {
			toast.info(`Starting analysis of "${filename}"...`);

			const response = await analyzeBook({
				sourceMaterialId,
				projectId,
				extractRelationships: true,
			});

			setResult(response);

			if (response.success) {
				toast.success(
					`Analysis complete! Created ${response.result.stats.entitiesCreated} entities and ${response.result.stats.relationshipsCreated} relationships.`,
				);
				router.refresh();
			} else {
				toast.error(response.error);
			}
		});
	};

	if (result?.success) {
		return (
			<div className="space-y-2">
				<div className="flex items-center gap-2 text-green-600 text-sm">
					<Check className="size-4" />
					Analysis Complete
				</div>
				<p className="text-xs text-muted-foreground">
					Created {result.result.stats.entitiesCreated} entities,{" "}
					{result.result.stats.relationshipsCreated} relationships
				</p>
				{result.result.entities.length > 0 && (
					<div className="flex flex-wrap gap-1 mt-2">
						{result.result.entities.slice(0, 5).map((entity) => (
							<span
								key={entity.id}
								className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded"
							>
								{entity.name}
							</span>
						))}
						{result.result.entities.length > 5 && (
							<span className="text-xs text-muted-foreground">
								+{result.result.entities.length - 5} more
							</span>
						)}
					</div>
				)}
			</div>
		);
	}

	return (
		<Button
			onClick={handleAnalyze}
			disabled={isPending}
			className="w-full gap-2"
			variant="secondary"
		>
			{isPending ? (
				<>
					<Loader2 className="size-4 animate-spin" />
					Analyzing...
				</>
			) : (
				<>
					<Sparkles className="size-4" />
					Analyze for Inspiration
				</>
			)}
		</Button>
	);
}
