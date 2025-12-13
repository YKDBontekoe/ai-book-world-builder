"use client";

import { useQuery } from "@tanstack/react-query";
import {
	ActivityIcon,
	CheckCircle2Icon,
	CircleIcon,
	Loader2,
	XCircleIcon,
} from "lucide-react";
import { getGenerationLog } from "@/app/actions/project-stats";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { GenerationTaskLog } from "@/lib/db/schema";
import { QUERY_KEYS } from "@/lib/query-options";
import { cn } from "@/lib/utils";
import { useBookCanvas } from "../book-canvas-context";

export function ChangeLogPane() {
	const { projectId } = useBookCanvas();

	const { data: log, isLoading } = useQuery({
		queryKey: projectId
			? QUERY_KEYS.changelog(projectId)
			: ["changelog", "null"],
		queryFn: () => (projectId ? getGenerationLog(projectId) : Promise.resolve(null)),
		enabled: !!projectId,
		refetchInterval: 3000,
	});

	// Safely parse log if needed, but schema says it's typed.
	// However, Drizzle returns JSON fields as `unknown` or typed object if asserted.
	// We'll treat it as GenerationTaskLog (array of entries).
	const entries = Array.isArray(log) ? (log as GenerationTaskLog) : [];

	if (!projectId) {
		return (
			<div className="flex h-full flex-col items-center justify-center p-8 text-center bg-muted/5 rounded-xl border border-dashed m-4">
				<ActivityIcon className="h-10 w-10 text-muted-foreground/50 mb-3" />
				<p className="font-medium text-sm">No Project Selected</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-full overflow-hidden">
			<div className="p-4 border-b bg-muted/10 flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur z-10">
				<div>
					<h3 className="font-semibold text-sm">Generation Pipeline</h3>
					<p className="text-xs text-muted-foreground">Live activity log</p>
				</div>
				{isLoading && (
					<Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
				)}
			</div>

			<ScrollArea className="flex-1">
				<div className="p-4 space-y-4">
					{entries.length === 0 ? (
						<div className="text-center py-12 text-muted-foreground text-xs">
							No activity recorded yet. Start a generation task.
						</div>
					) : (
						entries
							.slice()
							.reverse()
							.map((entry) => (
								<div key={entry.id} className="relative pl-6 pb-2">
									{/* Line */}
									<div className="absolute left-[9px] top-2 bottom-0 w-px bg-border/50" />

									{/* Icon */}
									<div className="absolute left-0 top-1">
										{(entry as any).type === "error" ? (
											<XCircleIcon className="h-5 w-5 text-red-500 bg-background" />
										) : entry.type === "tool_result" ? (
											<CheckCircle2Icon className="h-5 w-5 text-green-500 bg-background" />
										) : (
											<CircleIcon className="h-5 w-5 text-blue-500 bg-background p-1" /> // Simple dot
										)}
									</div>

									<div className="flex flex-col gap-1">
										<div className="flex justify-between items-start gap-2">
											<span
												className={cn(
													"text-xs font-medium",
													entry.type === "orchestrator" && "text-purple-500",
													entry.type === "tool_result" && "text-foreground",
													(entry as any).type === "error" && "text-red-500",
												)}
											>
												{entry.type === "orchestrator"
													? "Orchestrator Decision"
													: entry.type === "tool_result"
														? "Task Completed"
														: "Activity"}
											</span>
											<span className="text-[10px] text-muted-foreground font-mono">
												{new Date(entry.timestamp).toLocaleTimeString()}
											</span>
										</div>

										<p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
											{typeof entry.content === "string"
												? entry.content
												: JSON.stringify(entry.content)}
										</p>

										{entry.metadata && (
											<div className="mt-1 flex gap-2">
												{Object.entries(entry.metadata).map(([k, v]) => (
													<span
														key={k}
														className="inline-flex items-center rounded-sm bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
													>
														{k}: {String(v)}
													</span>
												))}
											</div>
										)}
									</div>
								</div>
							))
					)}
				</div>
			</ScrollArea>
		</div>
	);
}
