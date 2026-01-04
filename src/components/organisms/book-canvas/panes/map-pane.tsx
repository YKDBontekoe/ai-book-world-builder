"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ImageIcon, MapIcon, MapPin, Plus, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
	getEntitiesWithImagesAction,
	setEntityImageAction,
} from "@/app/actions/entity";
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { LoadingSpinner } from "@/components/atoms/loading-spinner";
import { EmptyState } from "@/components/molecules/empty-state";
import { useBookCanvas } from "@/components/organisms/book-canvas/book-canvas-context";

function LocationCard({
	entity,
	onSaveImage,
}: {
	entity: any;
	onSaveImage: (id: string, url: string) => void;
}) {
	const [isEditing, setIsEditing] = useState(false);
	const [url, setUrl] = useState(entity.imageUrl || "");

	const handleSave = () => {
		onSaveImage(entity.id, url);
		setIsEditing(false);
	};

	return (
		<div className="group relative aspect-video rounded-lg border bg-muted/20 overflow-hidden hover:shadow-md transition-all">
			{entity.imageUrl ? (
				// biome-ignore lint/a11y/useAltText: User generated content
				// biome-ignore lint/performance/noImgElement: External user content
				<img
					src={entity.imageUrl}
					className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
				/>
			) : (
				<div className="w-full h-full flex items-center justify-center bg-muted/40 text-muted-foreground/30">
					<MapIcon className="w-12 h-12" />
				</div>
			)}

			<div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 pt-8">
				<div className="flex items-center justify-between">
					<div>
						<h4 className="text-white font-medium text-sm drop-shadow-sm">
							{entity.name}
						</h4>
						<p className="text-white/70 text-[10px] uppercase tracking-wider">
							{entity.kind}
						</p>
					</div>
					<Button
						size="icon"
						variant="ghost"
						className="h-6 w-6 text-white/70 hover:text-white hover:bg-white/20"
						onClick={() => setIsEditing(!isEditing)}
					>
						{entity.imageUrl ? (
							<ImageIcon className="h-3 w-3" />
						) : (
							<Plus className="h-3 w-3" />
						)}
					</Button>
				</div>
			</div>

			{isEditing && (
				<div className="absolute inset-0 bg-background/90 backdrop-blur-sm p-3 flex flex-col justify-center gap-2 animate-in fade-in duration-200">
					<p className="text-xs font-medium">Image URL</p>
					<div className="flex gap-2">
						<Input
							value={url}
							onChange={(e) => setUrl(e.target.value)}
							placeholder="https://..."
							className="h-8 text-xs"
						/>
						<Button size="icon" className="h-8 w-8" onClick={handleSave}>
							<Save className="h-3 w-3" />
						</Button>
					</div>
					<Button
						variant="ghost"
						size="sm"
						className="h-6 text-[10px]"
						onClick={() => setIsEditing(false)}
					>
						Cancel
					</Button>
				</div>
			)}
		</div>
	);
}

export function MapPane() {
	const { projectId, activePane } = useBookCanvas();
	const queryClient = useQueryClient();
	const [filter, setFilter] = useState<string>("location");

	const { data, isLoading } = useQuery({
		queryKey: ["entities-images", projectId],
		queryFn: () =>
			projectId ? getEntitiesWithImagesAction({ projectId }) : null,
		enabled: !!projectId && activePane === "map",
	});

	const { mutate: saveImage } = useMutation({
		mutationFn: async ({ id, url }: { id: string; url: string }) => {
			if (!projectId) return;
			return setEntityImageAction({
				entityId: id,
				imageUrl: url,
				projectId,
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["entities-images", projectId],
			});
			toast.success("Image saved");
		},
		onError: () => toast.error("Failed to save image"),
	});

	if (!projectId) {
		return (
			<EmptyState
				icon={MapPin}
				title="No Project Selected"
				description="Select a project to view location visuals"
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

	const entities = data?.success && data.data ? data.data : [];
	const filteredEntities = entities.filter((e) => e.kind === filter);

	// Count by kind
	const counts = entities.reduce(
		(acc: any, curr) => {
			acc[curr.kind] = (acc[curr.kind] || 0) + 1;
			return acc;
		},
		{} as Record<string, number>,
	);

	return (
		<div className="flex flex-col h-full p-4 space-y-4">
			<div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
				{["location", "character", "item"].map((kind) => (
					<Button
						key={kind}
						variant={filter === kind ? "secondary" : "ghost"}
						size="sm"
						className="h-7 text-xs capitalize gap-1"
						onClick={() => setFilter(kind)}
					>
						{kind}
						<Badge variant="outline" className="ml-1 px-1 h-4 text-[9px]">
							{counts[kind] || 0}
						</Badge>
					</Button>
				))}
			</div>

			{filteredEntities.length === 0 ? (
				<EmptyState
					icon={MapIcon}
					title={`No ${filter}s found`}
					description={`Create some ${filter} entities to add visuals.`}
					className="h-full"
				/>
			) : (
				<div className="grid grid-cols-2 gap-4 overflow-y-auto pb-10">
					{filteredEntities.map((entity) => (
						<LocationCard
							key={entity.id}
							entity={entity}
							onSaveImage={(id, url) => saveImage({ id, url })}
						/>
					))}
				</div>
			)}
		</div>
	);
}
