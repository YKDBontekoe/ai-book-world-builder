"use client";

import { Bot } from "lucide-react";
import type { JSX } from "react";
import type { JulesSession } from "@/lib/jules-client";
import { cn } from "@/lib/utils";

interface SessionCardProps {
	session: JulesSession;
	compact?: boolean;
}

export function SessionCard({
	session,
	compact,
}: SessionCardProps): JSX.Element {
	return (
		<>
			<div className="flex items-start justify-between gap-2">
				<div className="flex items-center gap-2 text-violet-500">
					<Bot className="h-4 w-4" />
					<span className="text-xs font-mono truncate max-w-[80px]">
						{session.id.split("/").pop()}
					</span>
				</div>
				<span className="text-[10px] text-muted-foreground">
					{session.state.replace("STATE_", "").replace("_", " ")}
				</span>
			</div>
			<h4
				className={cn(
					"font-medium text-sm mt-1",
					compact ? "line-clamp-1" : "line-clamp-2",
				)}
			>
				{session.title || session.prompt}
			</h4>
			{!compact && (
				<div className="mt-3 text-xs text-muted-foreground">Active Session</div>
			)}
		</>
	);
}
