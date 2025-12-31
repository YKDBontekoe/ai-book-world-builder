"use client";

import { ClapperboardIcon, Edit3Icon, FileTextIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface ScenePreviewProps {
	result: {
		message?: string;
		scene?: {
			id: string;
			title: string;
			status: string;
			content?: string | null;
			sequence: number;
		};
		error?: string;
	};
	projectId?: string;
}

export function ScenePreview({ result, projectId }: ScenePreviewProps) {
	if (result.error) {
		return (
			<div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-500 text-sm dark:border-red-900 dark:bg-red-950/50">
				Error handling scene: {result.error}
			</div>
		);
	}

	if (!result.scene) return null;

	const statusColors = {
		planned: "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30",
		drafted:
			"text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30",
		completed:
			"text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30",
		revised:
			"text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30",
	};

	const statusColor =
		statusColors[result.scene.status as keyof typeof statusColors] ||
		"text-zinc-600 bg-zinc-100";

	return (
		<div className="group relative flex w-full max-w-sm flex-col overflow-hidden rounded-2xl border bg-white/50 text-card-foreground shadow-sm backdrop-blur-sm transition-all hover:shadow-md dark:bg-black/20">
			<div className="flex flex-row items-center gap-3 border-b bg-muted/20 px-4 py-3">
				<div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
					<ClapperboardIcon size={18} className="text-primary" />
				</div>
				<div className="flex flex-1 flex-col overflow-hidden">
					<div className="truncate font-medium text-sm">
						{result.scene.title}
					</div>
					<div className="flex items-center gap-2 text-xs">
						<span className="font-mono text-muted-foreground">
							Seq: {result.scene.sequence}
						</span>
						<span
							className={cn(
								"rounded-full px-1.5 py-0.5 text-[10px] uppercase font-semibold tracking-wider",
								statusColor,
							)}
						>
							{result.scene.status}
						</span>
					</div>
				</div>
			</div>

			{result.scene.content && (
				<div className="px-4 py-3 text-muted-foreground text-sm leading-relaxed line-clamp-3">
					<div className="flex items-center gap-1.5 mb-1 text-xs font-medium text-foreground/80">
						<FileTextIcon size={12} />
						<span>Preview</span>
					</div>
					{result.scene.content}
				</div>
			)}

			{projectId && (
				<div className="border-t bg-muted/20 px-4 py-2">
					<Link
						className="flex items-center gap-1.5 text-primary text-xs hover:underline"
						href={`/projects/${projectId}/drafts`}
					>
						<Edit3Icon size={12} />
						Open in Draft
					</Link>
				</div>
			)}
		</div>
	);
}
