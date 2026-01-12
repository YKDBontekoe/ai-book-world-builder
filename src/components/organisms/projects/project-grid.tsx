"use client";

import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { CalendarIcon, Eye, FolderIcon, Globe } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
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

	return (
		<>
			<div className="relative h-full group">
				{/* Checkbox Overlay */}
				{onSelect && (
					// biome-ignore lint/a11y/useSemanticElements: this is an overlay wrapper for the checkbox
					<div
						className={cn(
							"absolute top-4 left-4 z-20 transition-opacity duration-200 cursor-pointer",
							selected
								? "opacity-100"
								: "opacity-0 group-hover:opacity-100 focus-within:opacity-100",
						)}
						onClick={(e) => {
							e.stopPropagation();
							onSelect(project.id, e.shiftKey);
						}}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ") {
								e.stopPropagation();
								// No shift key support for keyboard selection easily unless we track it globally
								onSelect(project.id, false);
							}
						}}
						role="button"
						tabIndex={0}
					>
						<Checkbox
							checked={selected}
							// We handle the change in the wrapper onClick to capture the event object
							onCheckedChange={() => {}}
							className="bg-background/80 backdrop-blur-sm data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground border-primary/50 h-5 w-5 pointer-events-none rounded shadow-sm"
						/>
					</div>
				)}

				<Link href={`/projects/${project.id}`} className="block h-full">
					<MotionGlassCard
						variant="liquid"
						// We handle motion via framer-motion props, not CSS interactive variant
						whileHover={{ y: -4 }}
						whileTap={{ scale: 0.98 }}
						transition={{ type: "spring", stiffness: 400, damping: 25 }}
						className={cn(
							"h-full flex flex-col justify-between space-y-6 p-6 cursor-pointer transition-colors",
							selected && "ring-2 ring-primary bg-primary/5",
						)}
					>
						<div className="space-y-4">
							<div className="flex items-center gap-3 pr-8 pl-6">
								<div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-300">
									<FolderIcon className="h-6 w-6" />
								</div>
								<h3 className="font-bold text-lg truncate tracking-tight">
									{project.name}
								</h3>
							</div>
							{project.description && (
								<p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
									{project.description}
								</p>
							)}
						</div>
						<div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border/30">
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
				</Link>

				{/* Actions (Top Right) */}
				<div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200 z-10">
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
