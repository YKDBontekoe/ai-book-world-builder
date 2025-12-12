"use client";

import { CalendarIcon, ClockIcon } from "lucide-react";
import useSWR from "swr";
import {
	getTimelineEvents,
	type TimelineEvent,
} from "@/app/actions/project-stats";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
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
			<EmptyState
				icon={CalendarIcon}
				title="No Project Selected"
				className="h-full m-4"
			/>
		);
	}

	if (isLoading && !events) {
		return (
			<div className="flex h-full flex-col items-center justify-center p-8">
				<LoadingSpinner size="lg" variant="muted" />
				<p className="mt-2 text-sm text-muted-foreground">
					Loading timeline...
				</p>
			</div>
		);
	}

	if (!events || events.length === 0) {
		return (
			<EmptyState
				icon={ClockIcon}
				iconClassName="text-blue-500"
				title="No Events Yet"
				description="Create timeline events to track your story's history. Ask the AI:"
				className="m-4"
				suggestions={[
					"Create an event called The Great War",
					"Add the birth of the hero in 1990",
				]}
			/>
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
