"use client";

import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { CalendarIcon, FolderIcon, Globe } from "lucide-react";
import Link from "next/link";
import { Checkbox } from "@/components/atoms/checkbox";
import { GlassCard } from "@/components/molecules/glass-card";
import { ProjectActionsMenu } from "@/components/organisms/projects/project-actions-menu";
import type { Project } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

const container = {
	hidden: { opacity: 0 },
	show: {
		opacity: 1,
		transition: {
			staggerChildren: 0.05,
		},
	},
};

const item = {
	hidden: { opacity: 0, x: -20 },
	show: {
		opacity: 1,
		x: 0,
		transition: { type: "spring", stiffness: 400, damping: 25 },
	},
} as const;

interface ProjectListProps {
	projects: Project[];
	selectedIds?: Set<string>;
	onSelect?: (id: string) => void;
	onDeleteProject?: (id: string) => void;
}

function ProjectRow({
	project,
	selected,
	onSelect,
	onDelete,
}: {
	project: Project;
	selected?: boolean;
	onSelect?: (id: string) => void;
	onDelete?: (id: string) => void;
}) {
	return (
		<div className="relative group">
			<Link href={`/projects/${project.id}`} className="block">
				<GlassCard
					variant="liquid"
					interactive
					className={cn(
						"flex flex-row items-center justify-between gap-4 p-4 transition-all duration-300 relative",
						selected && "ring-2 ring-primary bg-primary/5 scale-[0.99]",
					)}
				>
					<div className="flex items-center gap-4 min-w-0">
						{/* Icon & Checkbox Container */}
						<div className="relative shrink-0">
							{/* Folder Icon */}
							<div
								className={cn(
									"p-2.5 rounded-lg bg-primary/10 text-primary transition-all duration-300",
									selected ? "opacity-0 scale-90" : "group-hover:scale-105",
									onSelect && "group-hover:opacity-0",
								)}
							>
								<FolderIcon className="h-5 w-5" />
							</div>

							{/* Checkbox Overlay */}
							{onSelect && (
								<div
									className={cn(
										"absolute inset-0 flex items-center justify-center transition-all duration-200",
										selected
											? "opacity-100 scale-100"
											: "opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100",
									)}
								>
									{/* biome-ignore lint/a11y/noStaticElementInteractions: stop propagation only */}
									<div
										onClick={(e) => e.stopPropagation()}
										onKeyDown={(e) => e.stopPropagation()}
										className="flex items-center justify-center"
									>
										<Checkbox
											checked={selected}
											onCheckedChange={() => onSelect(project.id)}
											className="h-5 w-5 border-primary/50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground bg-background/80 backdrop-blur-sm shadow-sm"
										/>
									</div>
								</div>
							)}
						</div>

						{/* Content */}
						<div className="min-w-0 flex-1">
							<h3 className="font-bold text-base truncate tracking-tight">
								{project.name}
							</h3>
							{project.description && (
								<p className="text-xs text-muted-foreground truncate leading-relaxed">
									{project.description}
								</p>
							)}
						</div>
					</div>

					{/* Metadata & Actions */}
					<div className="flex items-center gap-6 shrink-0 pr-10">
						<div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground whitespace-nowrap">
							<CalendarIcon className="h-3.5 w-3.5" />
							<span>
								{formatDistanceToNow(project.createdAt, {
									addSuffix: true,
								})}
							</span>
						</div>
						{project.visibility === "public" && (
							<Globe className="h-3.5 w-3.5 text-muted-foreground" />
						)}
					</div>
				</GlassCard>
			</Link>

			{/* Floating Actions */}
			<div className="absolute top-1/2 right-4 -translate-y-1/2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200 z-10 pointer-events-none group-hover:pointer-events-auto">
				<ProjectActionsMenu
					projectId={project.id}
					projectName={project.name}
					projectDescription={project.description}
					onDelete={() => onDelete?.(project.id)}
				/>
			</div>
		</div>
	);
}

export function ProjectList({
	projects,
	selectedIds,
	onSelect,
	onDeleteProject,
}: ProjectListProps) {
	return (
		<motion.div
			variants={container}
			initial="hidden"
			animate="show"
			className="flex flex-col gap-3"
		>
			{projects.map((project) => (
				<motion.div key={project.id} variants={item}>
					<ProjectRow
						project={project}
						selected={selectedIds?.has(project.id)}
						onSelect={onSelect}
						onDelete={onDeleteProject}
					/>
				</motion.div>
			))}
		</motion.div>
	);
}
