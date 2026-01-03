"use client";

import { Activity, BookOpen, Layers, Type } from "lucide-react";
import { GlassCard } from "@/components/molecules/glass-card";
import type { ActivityStats } from "@/lib/dashboard-queries";

export function ActivityOverview({ stats }: { stats: ActivityStats }) {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
			<GlassCard variant="liquid" className="p-6">
				<div className="flex items-center gap-4">
					<div className="p-3 bg-primary/10 rounded-full text-primary">
						<BookOpen className="w-6 h-6" />
					</div>
					<div>
						<p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
							Projects
						</p>
						<p className="text-3xl font-mono font-bold">
							{stats.totalProjects}
						</p>
					</div>
				</div>
			</GlassCard>

			<GlassCard variant="liquid" className="p-6">
				<div className="flex items-center gap-4">
					<div className="p-3 bg-blue-500/10 rounded-full text-blue-500">
						<Layers className="w-6 h-6" />
					</div>
					<div>
						<p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
							Chapters
						</p>
						<p className="text-3xl font-mono font-bold">
							{stats.totalChapters}
						</p>
					</div>
				</div>
			</GlassCard>

			<GlassCard variant="liquid" className="p-6">
				<div className="flex items-center gap-4">
					<div className="p-3 bg-violet-500/10 rounded-full text-violet-500">
						<Activity className="w-6 h-6" />
					</div>
					<div>
						<p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
							Scenes
						</p>
						<p className="text-3xl font-mono font-bold">{stats.totalScenes}</p>
					</div>
				</div>
			</GlassCard>

			<GlassCard variant="liquid" className="p-6">
				<div className="flex items-center gap-4">
					<div className="p-3 bg-green-500/10 rounded-full text-green-500">
						<Type className="w-6 h-6" />
					</div>
					<div>
						<p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
							Total Words
						</p>
						<p className="text-3xl font-mono font-bold">
							{stats.totalWords.toLocaleString()}
						</p>
					</div>
				</div>
			</GlassCard>
		</div>
	);
}
