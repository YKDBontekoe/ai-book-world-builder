"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface RelationshipPreviewProps {
	result: {
		message?: string;
		relation?: {
			type: string;
			description?: string | null;
			sourceEntityId: string;
			targetEntityId: string;
		};
		error?: string;
	};
	sourceName?: string;
	targetName?: string;
	projectId?: string;
}

export function RelationshipPreview({
	result,
	sourceName,
	targetName,
	projectId,
}: RelationshipPreviewProps) {
	if (result.error) {
		return (
			<div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-500 text-sm dark:border-red-900 dark:bg-red-950/50">
				Error creating relationship: {result.error}
			</div>
		);
	}

	if (!result.relation) return null;

	return (
		<div className="group relative flex w-full max-w-md flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md">
			{/* Header */}
			<div className="flex flex-col gap-2 bg-muted/30 px-4 py-3">
				{/* Relationship visualization */}
				<div className="flex items-center gap-2 text-sm">
					<div className="flex-1 truncate font-medium">
						{sourceName || "Entity"}
					</div>
					<div className="flex items-center gap-1 text-muted-foreground">
						<ArrowRight className="size-4" />
						<span className="rounded bg-primary/10 px-2 py-0.5 font-medium text-primary text-xs uppercase tracking-wide">
							{result.relation.type}
						</span>
						<ArrowRight className="size-4" />
					</div>
					<div className="flex-1 truncate text-right font-medium">
						{targetName || "Entity"}
					</div>
				</div>
			</div>

			{/* Description */}
			{result.relation.description && (
				<div className="px-4 py-3 text-muted-foreground text-sm">
					{result.relation.description}
				</div>
			)}

			{/* Footer with action link */}
			{projectId && (
				<div className="border-t bg-muted/20 px-4 py-2">
					<Link
						className="text-primary text-xs hover:underline"
						href={`/projects/${projectId}/entities`}
					>
						View in project →
					</Link>
				</div>
			)}
		</div>
	);
}
