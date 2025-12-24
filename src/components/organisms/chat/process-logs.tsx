"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
	ChevronDownIcon,
	ChevronUpIcon,
	Loader2,
	TerminalIcon,
} from "lucide-react";
import { useState } from "react";
import { springs } from "@/lib/animations";
import type { ProcessLog } from "@/lib/types";
import { cn } from "@/lib/utils";

export type { ProcessLog };

export function ProcessLogs({ logs }: { logs: ProcessLog[] }) {
	const [isExpanded, setIsExpanded] = useState(false);

	if (logs.length === 0) return null;

	const lastLog = logs[logs.length - 1];
	const contentId = "process-logs-content";

	return (
		<div className="mt-2 w-full">
			<motion.div
				layout
				transition={springs.liquid}
				className={cn(
					"flex flex-col rounded-lg glass-panel transition-all overflow-hidden",
					isExpanded && "shadow-md",
				)}
			>
				<button
					type="button"
					onClick={() => setIsExpanded(!isExpanded)}
					aria-expanded={isExpanded}
					aria-controls={contentId}
					className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left hover:bg-muted/30 transition-colors"
				>
					<div className="flex items-center gap-2 text-foreground/80 min-w-0 flex-1">
						<div className="flex size-5 items-center justify-center rounded bg-primary/10 text-primary shrink-0">
							{logs.length > 0 && !isExpanded ? (
								<Loader2 className="h-3 w-3 animate-spin" />
							) : (
								<TerminalIcon className="h-3 w-3" />
							)}
						</div>

						<div className="flex flex-col min-w-0 flex-1">
							<div className="flex items-center gap-2">
								<span className="font-mono text-[10px] font-medium uppercase text-primary/80 bg-primary/5 px-1.5 py-0.5 rounded">
									{lastLog.tool}
								</span>
								<span className="truncate text-xs text-muted-foreground">
									{isExpanded ? "Process Logs" : lastLog.message}
								</span>
							</div>
						</div>
					</div>

					<div className="shrink-0 text-muted-foreground">
						{isExpanded ? (
							<ChevronUpIcon className="h-4 w-4" />
						) : (
							<ChevronDownIcon className="h-4 w-4" />
						)}
					</div>
				</button>

				<AnimatePresence>
					{isExpanded && (
						<motion.div
							id={contentId}
							initial={{ height: 0, opacity: 0 }}
							animate={{ height: "auto", opacity: 1 }}
							exit={{ height: 0, opacity: 0 }}
							transition={springs.liquid}
							className="border-t border-border/50 bg-muted/10"
						>
							<div className="flex flex-col gap-1 p-3 max-h-48 overflow-y-auto font-mono text-xs">
								{logs.map((log, i) => (
									<div
										key={`${log.timestamp}-${i}`}
										className="flex gap-2 items-start opacity-80 hover:opacity-100"
									>
										<span className="text-muted-foreground shrink-0 select-none opacity-50">
											{new Date(log.timestamp).toLocaleTimeString([], {
												hour12: false,
												hour: "2-digit",
												minute: "2-digit",
												second: "2-digit",
											})}
										</span>
										<span
											className={cn(
												"break-words",
												i === logs.length - 1
													? "text-primary font-medium"
													: "text-foreground",
											)}
										>
											<span className="opacity-50 mr-1">[{log.tool}]</span>
											{log.message}
										</span>
									</div>
								))}
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</motion.div>
		</div>
	);
}
