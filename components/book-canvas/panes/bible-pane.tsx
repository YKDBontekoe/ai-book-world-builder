"use client";

import {
	BookOpenIcon,
	BookUp2Icon,
	BuildingIcon,
	CalendarIcon,
	Check,
	FileTextIcon,
	LinkIcon,
	MapPinIcon,
	MoreHorizontal,
	PackageIcon,
	Pencil,
	SparklesIcon,
	Trash,
	UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import useSWR, { useSWRConfig } from "swr";
import {
	analyzeBook,
	getSourceMaterialsForProject,
} from "@/app/actions/book-analysis";
import { deleteEntityAction, getEntities } from "@/app/actions/entities";
import {
	getRelationships,
	type SerializedRelationship,
} from "@/app/actions/project-stats";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { cn } from "@/lib/utils";
import { useBookCanvas } from "../book-canvas-context";

type SerializedEntity = {
	id: string;
	name: string;
	kind: string;
	summary: string | null;
	createdAt: string;
	updatedAt: string;
	startDate: string | null;
	endDate: string | null;
	projectId: string;
};

type EntityGroup = {
	type: string;
	label: string;
	icon: React.ElementType;
	color: string;
	entities: SerializedEntity[];
};

const entityTypeConfig: Record<
	string,
	{ label: string; icon: React.ElementType; color: string }
> = {
	character: {
		label: "Characters",
		icon: UsersIcon,
		color: "text-[var(--entity-character)]",
	},
	location: {
		label: "Locations",
		icon: MapPinIcon,
		color: "text-[var(--entity-location)]",
	},
	item: {
		label: "Items",
		icon: PackageIcon,
		color: "text-[var(--entity-item)]",
	},
	event: {
		label: "Events",
		icon: CalendarIcon,
		color: "text-[var(--entity-event)]",
	},
	organization: {
		label: "Organizations",
		icon: BuildingIcon,
		color: "text-[var(--entity-organization)]",
	},
};

function EntityActions({
	entityId,
	projectId,
	entityName,
}: {
	entityId: string;
	projectId: string;
	entityName: string;
}) {
	const [showDeleteAlert, setShowDeleteAlert] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const { mutate } = useSWRConfig();

	const handleDelete = async () => {
		setIsDeleting(true);
		try {
			await deleteEntityAction(entityId);
			// Optimistically update or just revalidate
			await mutate(["entities", projectId]);
			await mutate(["relationships", projectId]);
		} catch (error) {
			console.error("Failed to delete entity:", error);
			// Ideally show a toast here
		} finally {
			setIsDeleting(false);
			setShowDeleteAlert(false);
		}
	};

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						size="icon"
						className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2"
					>
						<MoreHorizontal className="h-4 w-4" />
						<span className="sr-only">Open menu</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuItem asChild>
						<Link
							href={`/projects/${projectId}/entities/${entityId}`}
							className="flex items-center cursor-pointer"
						>
							<Pencil className="mr-2 h-4 w-4" />
							Edit
						</Link>
					</DropdownMenuItem>
					<DropdownMenuItem
						className="text-destructive focus:text-destructive cursor-pointer"
						onSelect={() => setShowDeleteAlert(true)}
					>
						<Trash className="mr-2 h-4 w-4" />
						Delete
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This will permanently delete{" "}
							<span className="font-medium text-foreground">{entityName}</span>{" "}
							and remove all its relationships. This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={(e) => {
								e.preventDefault();
								handleDelete();
							}}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
							disabled={isDeleting}
						>
							{isDeleting ? (
								<>
									<LoadingSpinner size="sm" className="mr-2" />
									Deleting...
								</>
							) : (
								"Delete"
							)}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}

function EntityCard({
	entity,
	relationshipCount,
	projectId,
}: {
	entity: SerializedEntity;
	relationshipCount: number;
	projectId: string; // Made optional or required? Based on usage it's available.
}) {
	return (
		<Card variant="interactive" className="group relative p-3 pr-8">
			<div className="flex items-start justify-between gap-2">
				<div className="flex-1 min-w-0">
					<h4 className="font-medium text-sm truncate">{entity.name}</h4>
					{entity.summary && (
						<p className="mt-1 text-xs text-muted-foreground line-clamp-2">
							{entity.summary}
						</p>
					)}
				</div>
				{relationshipCount > 0 && (
					<div className="flex items-center gap-0.5 rounded-full bg-muted/60 px-1.5 py-0.5 text-muted-foreground">
						<LinkIcon className="h-3 w-3" />
						<span className="text-xs font-medium">{relationshipCount}</span>
					</div>
				)}
			</div>
			<EntityActions
				entityId={entity.id}
				projectId={projectId}
				entityName={entity.name}
			/>
		</Card>
	);
}

function EntityGroupSection({
	group,
	relationships,
	projectId,
}: {
	group: EntityGroup;
	relationships: SerializedRelationship[];
	projectId: string;
}) {
	const Icon = group.icon;

	// Count relationships for each entity
	const getRelationshipCount = (entityId: string) => {
		return relationships.filter(
			(r) => r.sourceEntityId === entityId || r.targetEntityId === entityId,
		).length;
	};

	return (
		<div className="space-y-2">
			<div className="flex items-center gap-2">
				<Icon className={cn("h-4 w-4", group.color)} />
				<h3 className="font-semibold text-sm">{group.label}</h3>
				<span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
					{group.entities.length}
				</span>
			</div>
			<div className="grid gap-2">
				{group.entities.map((entity) => (
					<EntityCard
						key={entity.id}
						entity={entity}
						relationshipCount={getRelationshipCount(entity.id)}
						projectId={projectId}
					/>
				))}
			</div>
		</div>
	);
}

// Source Materials Section with Analyze Button
function SourceMaterialsSection({ projectId }: { projectId: string }) {
	const [isPending, startTransition] = useTransition();
	const [analyzedIds, setAnalyzedIds] = useState<Set<string>>(new Set());
	const { mutate } = useSWRConfig();

	const { data: materials, isLoading } = useSWR(
		["source-materials", projectId],
		([_, id]) => getSourceMaterialsForProject(id),
		{ refreshInterval: 10000 },
	);

	const processedMaterials =
		materials?.filter((m) => m.status === "processed") ?? [];

	if (isLoading || processedMaterials.length === 0) {
		return null;
	}

	const handleAnalyze = (materialId: string, filename: string) => {
		startTransition(async () => {
			const toastId = toast.loading(`Analyzing "${filename}"...`);

			const response = await analyzeBook({
				sourceMaterialId: materialId,
				projectId,
				extractRelationships: true,
			});

			if (response.success) {
				toast.success(
					`Created ${response.result.stats.entitiesCreated} entities and ${response.result.stats.relationshipsCreated} relationships!`,
					{ id: toastId },
				);
				setAnalyzedIds((prev) => new Set([...prev, materialId]));
				// Refresh entities and relationships
				await mutate(["entities", projectId]);
				await mutate(["relationships", projectId]);
			} else {
				toast.error(response.error, { id: toastId });
			}
		});
	};

	return (
		<div className="space-y-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
			<div className="flex items-center gap-2">
				<BookUp2Icon className="h-4 w-4 text-amber-500" />
				<h3 className="font-semibold text-sm">Import from Books</h3>
				<Badge variant="secondary" className="text-xs">
					{processedMaterials.length}
				</Badge>
			</div>
			<div className="space-y-2">
				{processedMaterials.map((material) => {
					const isAnalyzed = analyzedIds.has(material.id);
					return (
						<div
							key={material.id}
							className="flex items-center gap-2 rounded-md border bg-card p-2"
						>
							<FileTextIcon className="h-4 w-4 text-muted-foreground shrink-0" />
							<span className="text-sm truncate flex-1">
								{material.filename}
							</span>
							{isAnalyzed ? (
								<Badge variant="secondary" className="gap-1 shrink-0">
									<Check className="h-3 w-3" />
									Done
								</Badge>
							) : (
								<Button
									size="sm"
									variant="ghost"
									className="h-7 px-2 gap-1 shrink-0"
									onClick={() => handleAnalyze(material.id, material.filename)}
									disabled={isPending}
								>
									{isPending ? (
										<LoadingSpinner size="xs" />
									) : (
										<SparklesIcon className="h-3 w-3" />
									)}
									Analyze
								</Button>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}

export function BiblePane() {
	const { projectId } = useBookCanvas();

	const { data: entities, isLoading: entitiesLoading } = useSWR(
		projectId ? ["entities", projectId] : null,
		([_, id]) => getEntities(id),
		{ refreshInterval: 3000 },
	);

	const { data: relationships, isLoading: relationshipsLoading } = useSWR(
		projectId ? ["relationships", projectId] : null,
		([_, id]) => getRelationships(id),
		{ refreshInterval: 5000 },
	);

	const isLoading = entitiesLoading || relationshipsLoading;

	if (!projectId) {
		return (
			<div className="flex h-full flex-col items-center justify-center p-8 text-center">
				<BookOpenIcon className="h-10 w-10 text-muted-foreground/50 mb-3" />
				<p className="font-medium text-sm">No Project Selected</p>
				<p className="text-xs text-muted-foreground mt-1">
					Select a project to view your Story Bible
				</p>
			</div>
		);
	}

	// Group entities by type
	const entityGroups: EntityGroup[] = [];
	const groupedByType: Record<string, SerializedEntity[]> = {};

	if (entities) {
		for (const entity of entities) {
			const kind = entity.kind.toLowerCase();
			if (!groupedByType[kind]) {
				groupedByType[kind] = [];
			}
			groupedByType[kind].push(entity);
		}

		// Create groups in priority order
		const typeOrder = [
			"character",
			"location",
			"item",
			"event",
			"organization",
		];
		for (const type of typeOrder) {
			if (groupedByType[type] && groupedByType[type].length > 0) {
				const config = entityTypeConfig[type] || {
					label: type.charAt(0).toUpperCase() + type.slice(1) + "s",
					icon: BookOpenIcon,
					color: "text-gray-500",
				};
				entityGroups.push({
					type,
					...config,
					entities: groupedByType[type],
				});
			}
		}

		// Add any remaining types
		for (const [type, entitiesList] of Object.entries(groupedByType)) {
			if (!typeOrder.includes(type) && entitiesList.length > 0) {
				entityGroups.push({
					type,
					label: type.charAt(0).toUpperCase() + type.slice(1) + "s",
					icon: BookOpenIcon,
					color: "text-gray-500",
					entities: entitiesList,
				});
			}
		}
	}

	const totalEntities = entities?.length ?? 0;
	const totalRelationships = relationships?.length ?? 0;

	return (
		<div className="flex flex-col gap-4 p-4">
			{/* Header with stats */}
			<div className="flex items-center justify-between">
				<div>
					<h3 className="font-semibold text-lg">Story Bible</h3>
					<p className="text-muted-foreground text-sm">
						Your world's entities and connections
					</p>
				</div>
				{!isLoading && totalEntities > 0 && (
					<div className="flex items-center gap-3 text-xs text-muted-foreground">
						<span className="flex items-center gap-1">
							<BookOpenIcon className="h-3.5 w-3.5" />
							{totalEntities}
						</span>
						<span className="flex items-center gap-1">
							<LinkIcon className="h-3.5 w-3.5" />
							{totalRelationships}
						</span>
					</div>
				)}
				{isLoading && !entities && <LoadingSpinner size="sm" variant="muted" />}
			</div>

			{/* Source Materials for Analysis */}
			<SourceMaterialsSection projectId={projectId} />

			{/* Entity groups */}
			{entityGroups.length > 0 ? (
				<div className="space-y-4">
					{entityGroups.map((group) => (
						<EntityGroupSection
							key={group.type}
							group={group}
							relationships={relationships ?? []}
							projectId={projectId}
						/>
					))}
				</div>
			) : (
				<EmptyState
					icon={isLoading ? undefined : SparklesIcon}
					iconClassName="text-[var(--entity-character)]"
					title={isLoading ? "Loading entities..." : "Build Your World"}
					description={
						isLoading
							? undefined
							: "Ask the AI to create characters, locations, items, and events to populate your Story Bible."
					}
					suggestions={
						isLoading
							? undefined
							: ['"Create a protagonist"', '"Add a mysterious forest"']
					}
					action={
						isLoading ? <LoadingSpinner size="md" variant="muted" /> : undefined
					}
				/>
			)}
		</div>
	);
}
