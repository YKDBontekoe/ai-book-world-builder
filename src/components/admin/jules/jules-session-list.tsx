"use client";

import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { ArrowRight, Clock, GitPullRequest, Loader2 } from "lucide-react";
import type { JSX } from "react";
import { getJulesSessionsAction } from "@/app/actions/jules";
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import { GlassCard } from "@/components/molecules/glass-card";

/**
 * Props for the JulesSessionList component.
 */
interface JulesSessionListProps {
	/**
	 * Callback when a session is selected.
	 * @param sessionId The ID (name) of the selected session.
	 */
	onSelectSession: (sessionId: string) => void;
}

/**
 * Lists active Jules sessions with status indicators.
 * @param props Component props.
 * @returns The JulesSessionList component.
 */
export function JulesSessionList({
	onSelectSession,
}: JulesSessionListProps): JSX.Element {
	const { data, isLoading, error } = useQuery({
		queryKey: ["jules", "sessions"],
		queryFn: () => getJulesSessionsAction({ pageSize: 20 }),
	});

	if (isLoading) {
		return (
			<div className="flex items-center justify-center p-12">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (error || !data?.success) {
		return (
			<div className="p-8 text-center text-red-500">
				Failed to load sessions. Please check your API key and connection.
			</div>
		);
	}

	const sessions = data.data?.sessions || [];

	if (sessions.length === 0) {
		return (
			<div className="p-12 text-center text-muted-foreground">
				No active Jules sessions found.
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{sessions.map((session) => (
				<GlassCard
					key={session.id}
					variant="liquid"
					className="p-4 cursor-pointer hover:bg-muted/50 transition-colors group"
					onClick={() => onSelectSession(session.name)}
					role="button"
					tabIndex={0}
					aria-label={`Open session: ${session.title || "Untitled Session"}`}
					onKeyDown={(e) => {
						if (e.key === "Enter" || e.key === " ") {
							e.preventDefault();
							onSelectSession(session.name);
						}
					}}
				>
					<div className="flex items-start justify-between">
						<div className="space-y-1">
							<div className="flex items-center gap-2">
								<h3 className="font-semibold text-lg">
									{session.title || "Untitled Session"}
								</h3>
								<Badge variant="outline" className="capitalize">
									{session.state.toLowerCase()}
								</Badge>
							</div>
							<p className="text-sm text-muted-foreground line-clamp-2">
								{session.prompt}
							</p>
							<div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
								<span className="flex items-center gap-1">
									<Clock className="h-3 w-3" />
									{formatDistanceToNow(new Date(session.createTime), {
										addSuffix: true,
									})}
								</span>
								{session.outputs?.some((o) => o.pullRequest) && (
									<span className="flex items-center gap-1 text-green-500">
										<GitPullRequest className="h-3 w-3" />
										PR Created
									</span>
								)}
							</div>
						</div>
						<Button
							variant="ghost"
							size="icon"
							className="opacity-0 group-hover:opacity-100 transition-opacity"
							tabIndex={-1} // Prevent double focus since card is clickable
							aria-hidden="true"
						>
							<ArrowRight className="h-4 w-4" />
						</Button>
					</div>
				</GlassCard>
			))}
		</div>
	);
}
