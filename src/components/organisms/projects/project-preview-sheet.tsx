"use client";

import { formatDistanceToNow } from "date-fns";
import {
	Book,
	ChevronRight,
	FileText,
	LayoutDashboard,
	Loader2,
	PenTool,
	Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
	getProjectPreviewData,
	type ProjectPreviewData,
} from "@/app/actions/project-preview";
import { Button } from "@/components/atoms/button";
import { Sheet, SheetContent } from "@/components/atoms/sheet";
import { GlassCard } from "@/components/molecules/glass-card";
import type { Project } from "@/lib/db/schema";

interface ProjectPreviewSheetProps {
	project: Project;
	isOpen: boolean;
	onClose: () => void;
}

export function ProjectPreviewSheet({
	project,
	isOpen,
	onClose,
}: ProjectPreviewSheetProps) {
	const [data, setData] = useState<ProjectPreviewData | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (isOpen && !data) {
			setIsLoading(true);
			getProjectPreviewData(project.id)
				.then((result) => {
					if ("error" in result) {
						toast.error(result.error);
					} else {
						setData(result.data);
					}
				})
				.finally(() => setIsLoading(false));
		}
	}, [isOpen, project.id, data]);

	return (
		<Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<SheetContent className="w-full sm:max-w-md bg-background/80 backdrop-blur-xl border-l border-border/50 p-0 overflow-hidden flex flex-col">
				<div className="relative h-32 bg-gradient-to-br from-primary/20 via-primary/5 to-background shrink-0">
					<div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]" />
					<div className="absolute bottom-6 left-6 right-6">
						<h2 className="text-2xl font-bold tracking-tight text-foreground line-clamp-1">
							{project.name}
						</h2>
						{project.description && (
							<p className="text-sm text-muted-foreground mt-1 line-clamp-1">
								{project.description}
							</p>
						)}
					</div>
				</div>

				<div className="flex-1 overflow-y-auto p-6 space-y-8">
					{isLoading ? (
						<div className="flex flex-col items-center justify-center h-40 gap-3 text-muted-foreground">
							<Loader2 className="h-6 w-6 animate-spin" />
							<p className="text-sm">Loading stats...</p>
						</div>
					) : data ? (
						<>
							{/* Key Stats Grid */}
							<div className="grid grid-cols-3 gap-3">
								<StatCard
									icon={FileText}
									label="Words"
									value={data.counts.words.toLocaleString()}
								/>
								<StatCard
									icon={Book}
									label="Chapters"
									value={data.counts.chapters.toString()}
								/>
								<StatCard
									icon={LayoutDashboard}
									label="Scenes"
									value={data.counts.scenes.toString()}
								/>
							</div>

							{/* Recent Activity */}
							{data.recentActivity && (
								<div className="space-y-3">
									<h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
										<Zap className="h-4 w-4" /> Recent Activity
									</h3>
									<Link
										href={`/projects/${project.id}?sceneId=${data.recentActivity.sceneId}`}
										onClick={onClose}
									>
										<GlassCard
											variant="liquid"
											interactive
											className="p-4 flex items-center justify-between group"
										>
											<div className="space-y-1">
												<div className="font-medium text-sm group-hover:text-primary transition-colors">
													{data.recentActivity.sceneTitle}
												</div>
												<div className="text-xs text-muted-foreground">
													in {data.recentActivity.chapterTitle} •{" "}
													{formatDistanceToNow(data.recentActivity.updatedAt, {
														addSuffix: true,
													})}
												</div>
											</div>
											<ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
										</GlassCard>
									</Link>
								</div>
							)}

							{/* Structure Preview */}
							{data.structure.length > 0 && (
								<div className="space-y-3">
									<h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
										<Book className="h-4 w-4" /> Structure Preview
									</h3>
									<div className="space-y-2">
										{data.structure.map((chapter) => (
											<div
												key={chapter.id}
												className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
											>
												<span className="text-sm font-medium line-clamp-1 flex-1">
													{chapter.title}
												</span>
												<span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full ml-2">
													{chapter.sceneCount} scenes
												</span>
											</div>
										))}
										{data.counts.chapters > 5 && (
											<div className="text-xs text-center text-muted-foreground pt-2">
												+ {data.counts.chapters - 5} more chapters
											</div>
										)}
									</div>
								</div>
							)}
						</>
					) : (
						<div className="text-center text-muted-foreground py-10">
							Failed to load data
						</div>
					)}
				</div>

				{/* Footer Actions */}
				<div className="p-6 border-t border-border/50 bg-background/50 backdrop-blur-sm">
					<Button asChild className="w-full gap-2" size="lg">
						<Link href={`/projects/${project.id}`}>
							<PenTool className="h-4 w-4" />
							Open Project
						</Link>
					</Button>
				</div>
			</SheetContent>
		</Sheet>
	);
}

function StatCard({
	icon: Icon,
	label,
	value,
}: {
	icon: any;
	label: string;
	value: string;
}) {
	return (
		<div className="flex flex-col items-center justify-center p-3 rounded-xl bg-primary/5 border border-primary/10 text-center gap-1">
			<Icon className="h-4 w-4 text-primary mb-1" />
			<div className="text-lg font-bold text-foreground">{value}</div>
			<div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
				{label}
			</div>
		</div>
	);
}
