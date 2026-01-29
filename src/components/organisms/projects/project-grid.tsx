"use client";

import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { CalendarIcon, Eye, FolderIcon, Globe } from "lucide-react";
import Link from "next/link";
import { type SyntheticEvent, useState } from "react";
import { Button } from "@/components/atoms/button";
import { Checkbox } from "@/components/atoms/checkbox";
import { GridList } from "@/components/atoms/grid-list";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/atoms/tooltip";
import { GlassCard } from "@/components/molecules/glass-card";
import { ProjectActionsMenu } from "@/components/organisms/projects/project-actions-menu";
import { ProjectPreviewSheet } from "@/components/organisms/projects/project-preview-sheet";
import type { Project } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

const container = {
	hidden: { opacity: 0 },
	show: {
		opacity: 1,
		transition: {
			staggerChildren: 0.1,
		},
	},
};

const item = {
	hidden: { opacity: 0, y: 20 },
	show: {
		opacity: 1,
		y: 0,
		transition: { type: "spring", stiffness: 400, damping: 25 },
	},
} as const;

interface ProjectGridProps {
	projects: Project[];
	selectedIds?: Set<string>;
	onSelect?: (id: string, shiftKey?: boolean) => void;
	onDeleteProject?: (id: string) => void;
}

const MotionGlassCard = motion(GlassCard);

function ProjectCard({
	project,
	selected,
	onSelect,
	onDelete,
}: {
	project: Project;
	selected?: boolean;
	onSelect?: (id: string, shiftKey?: boolean) => void;
	onDelete?: (id: string) => void;
}) {
	const [showPreview, setShowPreview] = useState(false);

	const handleSelect = (e: SyntheticEvent, shiftKey = false) => {
		if (onSelect) {
			e.preventDefault();
			e.stopPropagation();
			onSelect(project.id, shiftKey);
		}
	};

	return (
		<>
			<div className="relative h-full group">
				<MotionGlassCard
					variant="liquid"
					whileHover={{ y: -4 }}
					whileTap={{ scale: 0.98 }}
					transition={{ type: "spring", stiffness: 400, damping: 25 }}
					className={cn(
						"relative h-full flex flex-col justify-between space-y-6 p-6 transition-colors",
						selected && "ring-2 ring-primary bg-primary/5",
					)}
				>
					<div className="space-y-4">
						<div className="flex items-center gap-3 pr-8">
							{/* Icon / Selection Trigger */}
							<div
								className={cn(
									"relative z-20 flex-shrink-0 p-3 rounded-xl bg-primary/10 text-primary transition-all duration-300",
									onSelect &&
										"cursor-pointer hover:bg-primary/20 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
								)}
								onClick={(e) => handleSelect(e, e.shiftKey)}
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === " ") {
										handleSelect(e, e.shiftKey);
									}
								}}
								role={onSelect ? "button" : undefined}
								tabIndex={onSelect ? 0 : undefined}
								aria-label={
									onSelect
										? selected
											? "Deselect project"
											: "Select project"
										: undefined
								}
							>
								<FolderIcon
									className={cn(
										"h-6 w-6 transition-all duration-300",
										selected ? "opacity-0 scale-75" : "scale-100",
										onSelect && "group-hover:opacity-0 group-hover:scale-75",
									)}
								/>

								{onSelect && (
									<div
										className={cn(
											"absolute inset-0 flex items-center justify-center transition-all duration-300",
											selected
												? "opacity-100 scale-100"
												: "opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100",
										)}
									>
										<Checkbox
											checked={selected}
											onCheckedChange={() => {}} // Controlled by wrapper
											tabIndex={-1}
											className="h-5 w-5 pointer-events-none data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground border-primary/50"
										/>
									</div>
								)}
							</div>

							<h3 className="font-bold text-lg truncate tracking-tight">
								{/* Link Overlay Pattern: pseudo element covers the parent relative container */}
								<Link
									href={`/projects/${project.id}`}
									className="static before:absolute before:inset-0 focus:outline-none"
								>
									{project.name}
								</Link>
							</h3>
						</div>
						{project.description && (
							<p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed pointer-events-none relative z-10">
								{project.description}
							</p>
						)}
					</div>
					<div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border/30 relative z-10 pointer-events-none">
						<div className="flex items-center gap-1">
							<CalendarIcon className="h-3.5 w-3.5" />
							<span>
								{formatDistanceToNow(project.createdAt, {
									addSuffix: true,
								})}
							</span>
						</div>
						{project.visibility === "public" && (
							<Globe className="h-3.5 w-3.5" />
						)}
					</div>
				</MotionGlassCard>

				{/* Actions (Top Right) */}
				<div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200 z-30">
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8 glass-surface hover:bg-background/80 shadow-sm rounded-full"
									onClick={(e) => {
										e.stopPropagation();
										setShowPreview(true);
									}}
								>
									<Eye className="h-3.5 w-3.5 text-muted-foreground" />
								</Button>
							</TooltipTrigger>
							<TooltipContent side="left">Quick Preview</TooltipContent>
						</Tooltip>
					</TooltipProvider>

					<ProjectActionsMenu
						projectId={project.id}
						projectName={project.name}
						projectDescription={project.description}
						onDelete={() => onDelete?.(project.id)}
					/>
				</div>
			</div>

			<ProjectPreviewSheet
				project={project}
				isOpen={showPreview}
				onClose={() => setShowPreview(false)}
			/>
		</>
	);
}

export function ProjectGrid({
	projects,
	selectedIds,
	onSelect,
	onDeleteProject,
}: ProjectGridProps) {
	return (
		<motion.div variants={container} initial="hidden" animate="show">
			<GridList columns={{ sm: 2, lg: 3, xl: 4 }} gap={8}>
				{projects.map((project) => (
					<motion.div key={project.id} variants={item} className="h-full">
						<ProjectCard
							project={project}
							selected={selectedIds?.has(project.id)}
							onSelect={onSelect}
							onDelete={onDeleteProject}
						/>
					</motion.div>
				))}
			</GridList>
		</motion.div>
	);
}
