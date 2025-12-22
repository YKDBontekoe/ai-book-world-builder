"use client";

import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { CalendarIcon, FolderIcon, Globe } from "lucide-react";
import Link from "next/link";
import { GridList } from "@/components/atoms/grid-list";
import { GlassCard } from "@/components/molecules/glass-card";
import type { Project } from "@/lib/db/schema";

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
};

function ProjectCard({ project }: { project: Project }) {
	return (
		<Link href={`/projects/${project.id}`} className="block h-full group">
			<GlassCard
				variant="liquid"
				interactive
				className="h-full flex flex-col justify-between space-y-6 p-6"
			>
				<div className="space-y-4">
					<div className="flex items-center gap-3">
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
					{project.visibility === "public" && <Globe className="h-3.5 w-3.5" />}
				</div>
			</GlassCard>
		</Link>
	);
}

export function ProjectGrid({ projects }: { projects: Project[] }) {
	return (
		<motion.div variants={container} initial="hidden" animate="show">
			<GridList columns={{ sm: 2, lg: 3, xl: 4 }} gap={8}>
				{projects.map((project) => (
					<motion.div key={project.id} variants={item} className="h-full">
						<ProjectCard project={project} />
					</motion.div>
				))}
			</GridList>
		</motion.div>
	);
}
