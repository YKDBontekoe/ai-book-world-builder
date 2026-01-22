"use client";

import { FileTextIcon } from "lucide-react";
import type React from "react";
import type { SerializedOutline } from "@/app/actions/project-stats";

export function OutlineHeader({
	outline,
}: {
	outline: SerializedOutline;
}): React.JSX.Element {
	return (
		<div className="rounded-xl border glass-panel p-4">
			<div className="flex items-start justify-between gap-3">
				<div className="flex-1 min-w-0">
					<h4 className="font-semibold text-base truncate">{outline.title}</h4>
					{outline.summary && (
						<p className="mt-1 text-xs text-muted-foreground line-clamp-2">
							{outline.summary}
						</p>
					)}
				</div>
				<div className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary shrink-0">
					<FileTextIcon className="h-3 w-3" />
					{outline.chapters.length} chapters
				</div>
			</div>
			<div className="mt-3 flex flex-wrap gap-2">
				<span className="rounded-full border bg-background px-2 py-0.5 text-xs text-muted-foreground">
					POV: {outline.pov}
				</span>
				<span className="rounded-full border bg-background px-2 py-0.5 text-xs text-muted-foreground">
					Tone: {outline.tone}
				</span>
				<span className="rounded-full border bg-background px-2 py-0.5 text-xs text-muted-foreground">
					Pacing: {outline.pacing}
				</span>
			</div>
		</div>
	);
}
