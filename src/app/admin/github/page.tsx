"use client";

import type { JSX } from "react";
import { useState } from "react";
import { RoadmapView } from "@/components/admin/builder/roadmap-view";
import { TaskBoard } from "@/components/admin/builder/task-board";
import { JulesDashboard } from "@/components/admin/jules/jules-dashboard";
import { Button } from "@/components/atoms/button";
import { cn } from "@/lib/utils";

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
				<div className="bg-muted p-1 rounded-lg flex flex-wrap gap-1 w-full sm:w-auto">
					<Button
						variant={view === "board" ? "secondary" : "ghost"}
						size="sm"
						onClick={() => setView("board")}
						className={cn(
							"flex-1 sm:flex-initial",
							view === "board" && "bg-background shadow-sm",
						)}
					>
						Task Board
					</Button>
					<Button
						variant={view === "roadmap" ? "secondary" : "ghost"}
						size="sm"
						onClick={() => setView("roadmap")}
						className={cn(
							"flex-1 sm:flex-initial",
							view === "roadmap" && "bg-background shadow-sm",
						)}
					>
						Roadmap
					</Button>
					<Button
						variant={view === "jules" ? "secondary" : "ghost"}
						size="sm"
						onClick={() => setView("jules")}
						className={cn(
							"flex-1 sm:flex-initial",
							view === "jules" && "bg-background shadow-sm",
						)}
					>
						Jules Console
					</Button>
				</div>
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
