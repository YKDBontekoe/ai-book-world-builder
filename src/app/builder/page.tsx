"use client";

import type { JSX } from "react";
import { useState } from "react";
import { JulesDashboard } from "@/components/builder/jules/jules-dashboard";
import { RoadmapView } from "@/components/builder/roadmap-view";
import { TaskBoard } from "@/components/builder/task-board";
import { SegmentedControl } from "@/components/molecules/segmented-control";

/**
 * Admin page for managing Software Builder tasks (GitHub & Jules).
 * @returns The GitHubAdminPage component.
 */
export default function GitHubAdminPage(): JSX.Element {
	const [view, setView] = useState<"board" | "roadmap" | "jules">("board");

	return (
		<div className="space-y-6 h-full flex flex-col">
			<div className="flex-shrink-0 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
				<div>
					<h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
						Software Builder
					</h1>
					<p className="text-muted-foreground mt-2">
						Manage your development lifecycle with Jules. Issues → Planning →
						PRs.
					</p>
				</div>
				<SegmentedControl
					options={[
						{ id: "board", label: "Task Board" },
						{ id: "roadmap", label: "Roadmap" },
						{ id: "jules", label: "Jules Console" },
					]}
					value={view}
					onChange={(v) => setView(v as "board" | "roadmap" | "jules")}
					className="w-full sm:w-auto"
				/>
			</div>

			<div className="flex-1 min-h-0">
				{view === "board" ? (
					<TaskBoard />
				) : view === "roadmap" ? (
					<RoadmapView />
				) : (
					<JulesDashboard />
				)}
			</div>
		</div>
	);
}
