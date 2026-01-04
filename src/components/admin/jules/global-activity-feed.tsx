"use client";

import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Activity, Loader2 } from "lucide-react";
import type { JSX } from "react";
import { getJulesSessionDetailsAction } from "@/app/actions/jules";
import type { JulesSession } from "@/lib/jules-client";

interface GlobalActivityFeedProps {
	activeSessions: JulesSession[];
}

export function GlobalActivityFeed({
	activeSessions,
}: GlobalActivityFeedProps): JSX.Element | null {
	// Only track the top 3 most recent active sessions to avoid API spam
	const targetSessions = activeSessions
		.sort(
			(a, b) =>
				new Date(b.updateTime).getTime() - new Date(a.updateTime).getTime(),
		)
		.slice(0, 3);

	// Fetch activities for these sessions
	const { data: activities, isLoading } = useQuery({
		queryKey: ["jules", "global-feed", targetSessions.map((s) => s.id)],
		queryFn: async () => {
			const promises = targetSessions.map((session) =>
				getJulesSessionDetailsAction({ sessionId: session.id }).then((res) => ({
					sessionId: session.id,
					sessionTitle: session.title || session.prompt,
					activities: res.success ? res.data?.activities || [] : [],
				})),
			);

			const results = await Promise.all(promises);

			// Flatten and sort by time
			const allActivities = results.flatMap((res) =>
				res.activities.map((act) => ({
					...act,
					sessionTitle: res.sessionTitle,
					sessionId: res.sessionId,
				})),
			);

			return allActivities
				.sort(
					(a, b) =>
						new Date(b.createTime).getTime() - new Date(a.createTime).getTime(),
				)
				.slice(0, 10); // Show last 10 global events
		},
		enabled: targetSessions.length > 0,
		refetchInterval: 10000,
	});

	if (targetSessions.length === 0) return null;

	return (
		<div className="fixed bottom-0 left-0 right-0 h-10 bg-background/80 backdrop-blur-md border-t flex items-center px-4 overflow-hidden z-50">
			<div className="flex items-center gap-2 mr-6 text-primary shrink-0">
				<Activity className="h-4 w-4" />
				<span className="text-xs font-bold uppercase tracking-wider">
					Live Feed
				</span>
			</div>

			{isLoading && !activities ? (
				<div className="flex items-center gap-2 text-xs text-muted-foreground">
					<Loader2 className="h-3 w-3 animate-spin" />
					Loading activity...
				</div>
			) : (
				<div className="flex-1 flex items-center gap-8 animate-in fade-in slide-in-from-bottom-2">
					{activities?.map((activity, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: no stable id for feed
						<div key={i} className="flex items-center gap-2 text-xs shrink-0">
							<span className="font-semibold text-foreground/80">
								{activity.sessionTitle}:
							</span>
							<span className="text-muted-foreground truncate max-w-[300px]">
								{activity.description ||
									activity.progressUpdated?.description ||
									activity.agentMessaged?.agentMessage?.slice(0, 50) ||
									"Updated"}
							</span>
							<span className="text-[10px] text-muted-foreground/50">
								{formatDistanceToNow(new Date(activity.createTime), {
									addSuffix: true,
								})}
							</span>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
