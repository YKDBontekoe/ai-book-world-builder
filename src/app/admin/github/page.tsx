"use client";

import type { JSX } from "react";
import { useState } from "react";
import { RoadmapView } from "@/components/admin/builder/roadmap-view";
import { TaskBoard } from "@/components/admin/builder/task-board";
import { Button } from "@/components/atoms/button";
import { cn } from "@/lib/utils";

/**
 * Admin page for managing Software Builder tasks (GitHub & Jules).
 * @returns The GitHubAdminPage component.
 */
export default function GitHubAdminPage(): JSX.Element {
	const [view, setView] = useState<"board" | "roadmap">("board");

	return (
		<div className="space-y-6 h-full flex flex-col">
			<div className="flex-shrink-0 flex justify-between items-start">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">
						Software Builder
					</h1>
					<p className="text-muted-foreground mt-2">
						Manage your development lifecycle with Jules. Issues → Planning →
						PRs.
					</p>
				</div>
				<div className="bg-muted p-1 rounded-lg flex gap-1">
					<Button
						variant={view === "board" ? "secondary" : "ghost"}
						size="sm"
						onClick={() => setView("board")}
						className={cn(view === "board" && "bg-background shadow-sm")}
					>
						Task Board
					</Button>
					<Button
						variant={view === "roadmap" ? "secondary" : "ghost"}
						size="sm"
						onClick={() => setView("roadmap")}
						className={cn(view === "roadmap" && "bg-background shadow-sm")}
					>
						Roadmap
					</Button>
				</div>
			</div>

			<div className="flex-1 min-h-0">
				{view === "board" ? <TaskBoard /> : <RoadmapView />}
			</div>
		</div>
	);
}
