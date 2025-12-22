"use client";

import { ChevronDownIcon, FolderIcon, Sparkles } from "lucide-react";
import Link from "next/link";
import { memo } from "react";
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/atoms/dropdown-menu";
import type { ProjectSummary } from "@/lib/project-context";
import { cn } from "@/lib/utils";

type ProjectContextBarProps = {
	projects: ProjectSummary[];
	selectedProject?: ProjectSummary | null;
	selectedProjectId?: string | null;
	onProjectSelect: (projectId: string) => void;
	className?: string;
};

function PureProjectContextBar({
	projects,
	selectedProject,
	selectedProjectId,
	onProjectSelect,
	className,
}: ProjectContextBarProps) {
	return (
		<div
			className={cn(
				"flex items-center gap-3 border-b bg-gradient-to-r from-muted/30 to-muted/10 px-4 py-2",
				className,
			)}
		>
			{/* Project Selector */}
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						className="h-8 gap-2 bg-background/50 backdrop-blur-sm"
						size="sm"
						variant="outline"
					>
						<FolderIcon className="size-4" />
						<span className="max-w-[200px] truncate font-medium">
							{selectedProject?.name ?? "Select project"}
						</span>
						<ChevronDownIcon className="size-3 opacity-50" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="start" className="w-64">
					{projects.length === 0 ? (
						<div className="px-2 py-4 text-center text-muted-foreground text-sm">
							No projects yet
						</div>
					) : (
						<>
							{projects.map((project) => (
								<DropdownMenuItem
									className={cn(
										"cursor-pointer gap-2",
										project.id === selectedProjectId && "bg-accent",
									)}
									key={project.id}
									onClick={() => onProjectSelect(project.id)}
								>
									<FolderIcon className="size-4" />
									<span className="truncate">{project.name}</span>
									{project.id === selectedProjectId && (
										<Badge className="ml-auto" variant="secondary">
											Active
										</Badge>
									)}
								</DropdownMenuItem>
							))}
						</>
					)}
				</DropdownMenuContent>
			</DropdownMenu>

			{/* Project Info */}
			{selectedProject && (
				<div className="hidden items-center gap-2 md:flex">
					<span className="text-muted-foreground text-xs">
						Project context active
					</span>
				</div>
			)}

			{/* Quick Actions */}
			<div className="ml-auto flex items-center gap-2">
				{selectedProject && (
					<Link href={`/projects/${selectedProject.id}/generate`}>
						<Button className="h-8 gap-2" size="sm" variant="default">
							<Sparkles className="size-4" />
							<span className="hidden sm:inline">Generate Book</span>
						</Button>
					</Link>
				)}
			</div>
		</div>
	);
}

export const ProjectContextBar = memo(PureProjectContextBar);
