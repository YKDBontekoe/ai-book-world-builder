"use client";

import { Checkbox } from "@/components/atoms/checkbox";
import { Label } from "@/components/atoms/label";
import { ScrollArea } from "@/components/atoms/scroll-area";
import { Skeleton } from "@/components/atoms/skeleton";
import { Switch } from "@/components/atoms/switch";
import { useEffect, useState } from "react";
import type { UseGenerationWizardReturn } from "../hooks/use-generation-wizard";

interface EntityItem {
	id: string;
	name: string;
	kind: string;
}

interface OutlineItem {
	id: string;
	title: string;
	chapterCount: number;
}

interface ContextStepProps {
	wizard: UseGenerationWizardReturn;
}

export function ContextStep({ wizard }: ContextStepProps) {
	const { state, updateContext, projectId } = wizard;
	const [entities, setEntities] = useState<EntityItem[]>([]);
	const [outlines, setOutlines] = useState<OutlineItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [loadError, setLoadError] = useState<string | null>(null);

	// Fetch entities and outlines for the project
	useEffect(() => {
		const controller = new AbortController();
		const { signal } = controller;

		async function loadData() {
			setIsLoading(true);
			setLoadError(null);
			try {
				const [entitiesRes, outlinesRes] = await Promise.all([
					fetch(`/api/projects/${projectId}/entities`, { signal }),
					fetch(`/api/projects/${projectId}/outlines`, { signal }),
				]);

				if (!entitiesRes.ok) {
					throw new Error("Failed to fetch entities.");
				}
				if (!outlinesRes.ok) {
					throw new Error("Failed to fetch outlines.");
				}

				const entitiesData = await entitiesRes.json();
				const outlinesData = await outlinesRes.json();

				if (!signal.aborted) {
					setEntities(entitiesData.entities || []);
					setOutlines(outlinesData.outlines || []);
				}
			} catch (error) {
				if (error instanceof Error && error.name !== "AbortError") {
					console.error("Failed to load context data:", error);
					setLoadError(
						"Could not load project data. Please try again later.",
					);
				}
			} finally {
				if (!signal.aborted) {
					setIsLoading(false);
				}
			}
		}

		loadData();

		return () => {
			controller.abort();
		};
	}, [projectId]);

	const toggleEntity = (id: string) => {
		const currentIds = new Set(state.context.selectedEntityIds);
		if (currentIds.has(id)) {
			currentIds.delete(id);
		} else {
			currentIds.add(id);
		}
		updateContext({
			selectedEntityIds: Array.from(currentIds),
			includeAllEntities: false,
		});
	};

	const toggleOutline = (id: string) => {
		const currentIds = new Set(state.context.selectedOutlineIds);
		if (currentIds.has(id)) {
			currentIds.delete(id);
		} else {
			currentIds.add(id);
		}
		updateContext({
			selectedOutlineIds: Array.from(currentIds),
			includeAllOutlines: false,
		});
	};

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div className="space-y-2">
					<Skeleton className="h-6 w-48" />
					<Skeleton className="h-4 w-72" />
				</div>
				<div className="space-y-4">
					<Skeleton className="h-10 w-full" />
					<Skeleton className="h-32 w-full" />
				</div>
				<div className="space-y-4">
					<Skeleton className="h-10 w-full" />
					<Skeleton className="h-32 w-full" />
				</div>
			</div>
		);
	}

	if (loadError) {
		return (
			<div className="flex flex-col items-center justify-center h-full text-center">
				<p className="text-destructive font-semibold">Loading Error</p>
				<p className="text-sm text-muted-foreground mt-1">{loadError}</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<h3 className="text-lg font-semibold">Context Selection</h3>
				<p className="text-sm text-muted-foreground">
					Choose which project elements to include in generation.
				</p>
			</div>

			{/* Entities */}
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<Label className="text-sm font-medium">
						Entities ({entities.length})
					</Label>
					<div className="flex items-center gap-2">
						<span className="text-xs text-muted-foreground">
							Include All
						</span>
						<Switch
							checked={state.context.includeAllEntities}
							onCheckedChange={(checked) =>
								updateContext({ includeAllEntities: checked })
							}
						/>
					</div>
				</div>

				{entities.length === 0 ? (
					<div className="p-4 rounded-lg border border-dashed text-center text-sm text-muted-foreground">
						No entities found. Create some characters, locations, or
						items first.
					</div>
				) : !state.context.includeAllEntities ? (
					<ScrollArea className="h-48 rounded-lg border">
						<div className="p-4 space-y-2">
							{entities.map((entity) => (
								<label
									key={entity.id}
									className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 cursor-pointer"
								>
									<Checkbox
										checked={state.context.selectedEntityIds.includes(
											entity.id,
										)}
										onCheckedChange={() => toggleEntity(entity.id)}
									/>
									<div className="flex-1">
										<div className="font-medium text-sm">
											{entity.name}
										</div>
										<div className="text-xs text-muted-foreground capitalize">
											{entity.kind}
										</div>
									</div>
								</label>
							))}
						</div>
					</ScrollArea>
				) : (
					<div className="p-4 rounded-lg bg-primary/5 border border-primary/20 text-sm">
						All {entities.length} entities will be included in the
						generation context.
					</div>
				)}
			</div>

			{/* Outlines */}
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<Label className="text-sm font-medium">
						Outlines ({outlines.length})
					</Label>
					<div className="flex items-center gap-2">
						<span className="text-xs text-muted-foreground">
							Include All
						</span>
						<Switch
							checked={state.context.includeAllOutlines}
							onCheckedChange={(checked) =>
								updateContext({ includeAllOutlines: checked })
							}
						/>
					</div>
				</div>

				{outlines.length === 0 ? (
					<div className="p-4 rounded-lg border border-dashed text-center text-sm text-muted-foreground">
						No outlines found. Use the Story Wizard to create an outline
						first.
					</div>
				) : !state.context.includeAllOutlines ? (
					<ScrollArea className="h-48 rounded-lg border">
						<div className="p-4 space-y-2">
							{outlines.map((outline) => (
								<label
									key={outline.id}
									className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 cursor-pointer"
								>
									<Checkbox
										checked={state.context.selectedOutlineIds.includes(
											outline.id,
										)}
										onCheckedChange={() =>
											toggleOutline(outline.id)
										}
									/>
									<div className="flex-1">
										<div className="font-medium text-sm">
											{outline.title}
										</div>
										<div className="text-xs text-muted-foreground">
											{outline.chapterCount} chapters
										</div>
									</div>
								</label>
							))}
						</div>
					</ScrollArea>
				) : (
					<div className="p-4 rounded-lg bg-primary/5 border border-primary/20 text-sm">
						All {outlines.length} outlines will be used for structure.
					</div>
				)}
			</div>
		</div>
	);
}
