"use client";

import { useQuery } from "@tanstack/react-query";
import { BookOpen, Sparkles } from "lucide-react";

import { getSceneContextAction } from "@/app/actions/context";
import { Badge } from "@/components/atoms/badge";
import { LoadingSpinner } from "@/components/atoms/loading-spinner";
import { EmptyState } from "@/components/molecules/empty-state";
import {
	useBookCanvasLayout,
	useBookCanvasSelection,
} from "@/components/organisms/book-canvas/book-canvas-context";
import {
	ENTITY_ICONS,
	type EntityType,
} from "@/components/organisms/book-canvas/panes/bible/types";

export function ContextPane() {
	const { projectId } = useBookCanvasLayout();
	const { activeSceneId } = useBookCanvasSelection();

	const { data, isLoading } = useQuery({
		queryKey: ["context", projectId, activeSceneId],
		queryFn: () =>
			projectId && activeSceneId
				? getSceneContextAction({ sceneId: activeSceneId, projectId })
				: null,
		enabled: !!projectId && !!activeSceneId,
	});

	if (!projectId || !activeSceneId) {
		return (
			<EmptyState
				icon={BookOpen}
				title="No Active Scene"
				description="Select a scene to see its context"
				className="h-full m-4"
			/>
		);
	}

	if (isLoading) {
		return (
			<div className="flex h-full items-center justify-center">
				<LoadingSpinner />
			</div>
		);
	}

	const entities = data?.success ? data.data : [];

	if (!entities || entities.length === 0) {
		return (
			<EmptyState
				icon={Sparkles}
				title="No Context Found"
				description="No entities detected in this scene yet."
				className="h-full m-4"
			/>
		);
	}

	return (
		<div className="flex flex-col h-full p-4 space-y-4 overflow-y-auto">
			<div className="flex items-center justify-between">
				<h3 className="font-semibold text-sm flex items-center gap-2">
					<Sparkles className="h-4 w-4 text-primary" />
					Active Context
				</h3>
				<Badge variant="secondary">{entities.length}</Badge>
			</div>

			<div className="space-y-3">
				{entities.map((entity) => {
					const Icon =
						ENTITY_ICONS[entity.kind as EntityType] || ENTITY_ICONS.character;
					const isExplicit = entity.matchType === "explicit";

					return (
						<div
							key={entity.id}
							className={`p-3 rounded-lg border text-sm transition-all hover:shadow-sm ${
								isExplicit ? "bg-primary/5 border-primary/20" : "bg-card"
							}`}
						>
							<div className="flex items-start gap-3">
								<div
									className={`p-2 rounded-full shrink-0 ${
										isExplicit
											? "bg-primary/10 text-primary"
											: "bg-muted text-muted-foreground"
									}`}
								>
									<Icon className="h-4 w-4" />
								</div>
								<div className="flex-1 space-y-1">
									<div className="flex items-center justify-between">
										<span className="font-medium">{entity.name}</span>
										<span className="text-[10px] uppercase text-muted-foreground font-medium">
											{entity.kind}
										</span>
									</div>
									<p className="text-xs text-muted-foreground line-clamp-2">
										{entity.summary || "No description available."}
									</p>
									<div className="pt-1 flex items-center gap-2">
										<Badge
											variant="outline"
											className={`text-[10px] h-4 px-1 ${
												isExplicit
													? "border-primary/30 text-primary"
													: "text-muted-foreground"
											}`}
										>
											{entity.relevance}
										</Badge>
									</div>
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
