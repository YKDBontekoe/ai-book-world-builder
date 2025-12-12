"use client";

import { CalendarIcon, ClockIcon, Loader2 } from "lucide-react";
import useSWR from "swr";
import {
	getTimelineEvents,
	type TimelineEvent,
} from "@/app/actions/project-stats";
import { cn } from "@/lib/utils";
import { useBookCanvas } from "../book-canvas-context";

function TimelineEventCard({
	event,
	isLast,
}: {
	event: TimelineEvent;
	isLast: boolean;
}) {
	// Format dates
	const formatDate = (dateString: string | null) => {
		if (!dateString) return null;
		try {
			return new Date(dateString).toLocaleDateString(undefined, {
				year: "numeric",
				month: "short",
				day: "numeric",
			});
		} catch {
			return dateString;
		}
	};

	const start = formatDate(event.startDate);
	const end = formatDate(event.endDate);
	const dateDisplay = start ? (end ? `${start} — ${end}` : start) : "Undated";

	return (
		<div className="relative pl-8 pb-8">
			{/* Connector Line */}
			{!isLast && (
				<div className="absolute left-[11px] top-3 bottom-0 w-px bg-border" />
			)}

			{/* Dot */}
			<div
				className={cn(
					"absolute left-0 top-1.5 h-6 w-6 rounded-full border-4 border-background",
					event.startDate ? "bg-blue-500" : "bg-muted",
				)}
			/>

			{/* Content */}
			<div className="flex flex-col gap-1">
				<div className="flex items-baseline justify-between gap-4">
					<h4 className="text-sm font-semibold">{event.name}</h4>
					<span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
						{dateDisplay}
					</span>
				</div>
				{event.summary && (
					<p className="text-xs text-muted-foreground leading-relaxed">
						{event.summary}
					</p>
				)}
			</div>
		</div>
	);
}

export function TimelinePane() {
	const { projectId } = useBookCanvas();

	const { data: events, isLoading } = useSWR(
		projectId ? ["timeline", projectId] : null,
		([_, id]) => getTimelineEvents(id),
		{ refreshInterval: 5000 },
	);

	if (!projectId) {
		return (
			<div className="flex h-full flex-col items-center justify-center p-8 text-center">
				<CalendarIcon className="h-10 w-10 text-muted-foreground/50 mb-3" />
				<p className="font-medium text-sm">No Project Selected</p>
			</div>
		);
	}

	if (isLoading && !events) {
		return (
			<div className="flex h-full flex-col items-center justify-center p-8">
				<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
				<p className="mt-2 text-sm text-muted-foreground">
					Loading timeline...
				</p>
			</div>
		);
	}

	if (!events || events.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/10 m-4 p-8 text-center">
				<div className="mb-4 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-4">
					<ClockIcon className="h-6 w-6 text-blue-500" />
				</div>
				<h4 className="font-medium text-sm">No Events Yet</h4>
				<p className="mt-1 max-w-xs text-xs text-muted-foreground">
					Create timeline events to track your story's history. Ask the AI:
				</p>
				<div className="mt-4 flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
					<span className="rounded-full border px-2 py-1">
						"Create an event called The Great War"
					</span>
					<span className="rounded-full border px-2 py-1">
						"Add the birth of the hero in 1990"
					</span>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-4 p-4">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h3 className="font-semibold text-lg">Timeline</h3>
					<p className="text-muted-foreground text-sm">Chronological events</p>
				</div>
			</div>

			<div className="mt-2">
				{events.map((event, index) => (
					<TimelineEventCard
						key={event.id}
						event={event}
						isLast={index === events.length - 1}
					/>
				))}
			</div>
		</div>
	);
}
