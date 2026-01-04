"use client";

import { useQuery } from "@tanstack/react-query";
import {
	Background,
	Controls,
	type Edge,
	Handle,
	MarkerType,
	type Node,
	Position,
	ReactFlow,
	useEdgesState,
	useNodesState,
} from "@xyflow/react";
import dagre from "dagre";
import { Network } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useMemo } from "react";
import "@xyflow/react/dist/style.css";

import { getEntitiesWithImagesAction } from "@/app/actions/entity";
import {
	getRelationships,
	type SerializedRelationship,
} from "@/app/actions/project-stats";
import { LoadingSpinner } from "@/components/atoms/loading-spinner";
import { EmptyState } from "@/components/molecules/empty-state";
import { useBookCanvas } from "@/components/organisms/book-canvas/book-canvas-context";
import { ENTITY_ICONS, type EntityType } from "./bible/types";

// Custom Entity Node
const EntityNode = ({ data, selected }: any) => {
	const Icon = ENTITY_ICONS[data.type as EntityType] || ENTITY_ICONS.character;

	return (
		<div
			className={`px-4 py-2 rounded-md shadow-md border bg-card text-card-foreground min-w-[120px] flex items-center gap-2
      ${selected ? "ring-2 ring-primary border-primary" : "border-border"}
    `}
		>
			<Handle type="target" position={Position.Top} className="w-2 h-2" />
			<div className="p-1.5 rounded-full bg-primary/10 text-primary">
				<Icon className="w-4 h-4" />
			</div>
			<div>
				<div className="text-xs font-bold truncate max-w-[120px]">
					{data.label}
				</div>
				<div className="text-[10px] text-muted-foreground capitalize">
					{data.type}
				</div>
			</div>
			<Handle type="source" position={Position.Bottom} className="w-2 h-2" />
		</div>
	);
};

const nodeTypes = {
	entity: EntityNode,
};

const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
	const dagreGraph = new dagre.graphlib.Graph();
	dagreGraph.setDefaultEdgeLabel(() => ({}));

	dagreGraph.setGraph({ rankdir: "TB" });

	nodes.forEach((node) => {
		dagreGraph.setNode(node.id, { width: 160, height: 60 });
	});

	edges.forEach((edge) => {
		dagreGraph.setEdge(edge.source, edge.target);
	});

	dagre.layout(dagreGraph);

	nodes.forEach((node) => {
		const nodeWithPosition = dagreGraph.node(node.id);
		if (nodeWithPosition) {
			node.position = {
				x: nodeWithPosition.x - 80,
				y: nodeWithPosition.y - 30,
			};
		}
	});

	return { initialNodes: nodes, initialEdges: edges };
};

export function NetworkPane() {
	const { projectId, activePane } = useBookCanvas();
	const { theme } = useTheme();

	const { data: entitiesResult, isLoading: isLoadingEntities } = useQuery({
		queryKey: ["entities", projectId],
		queryFn: () =>
			projectId ? getEntitiesWithImagesAction({ projectId }) : null,
		enabled: !!projectId && activePane === "graph",
	});

	const { data: relationshipsResult, isLoading: isLoadingRelationships } =
		useQuery({
			queryKey: ["relationships", projectId],
			queryFn: () => (projectId ? getRelationships({ projectId }) : null),
			enabled: !!projectId && activePane === "graph",
		});

	const entities = entitiesResult?.success ? entitiesResult.data : [];
	const relationships = relationshipsResult?.success
		? (relationshipsResult.data as SerializedRelationship[])
		: [];

	const { initialNodes, initialEdges } = useMemo(() => {
		const nodes: Node[] = [];
		const edges: Edge[] = [];

		if (!entities?.length) return { initialNodes: [], initialEdges: [] };

		entities.forEach((entity: any) => {
			nodes.push({
				id: entity.id,
				type: "entity",
				position: { x: 0, y: 0 },
				data: {
					label: entity.name,
					type: entity.kind,
				},
			});
		});

		relationships.forEach((rel: SerializedRelationship) => {
			edges.push({
				id: rel.id,
				source: rel.sourceEntityId,
				target: rel.targetEntityId,
				label: rel.type,
				type: "smoothstep",
				markerEnd: {
					type: MarkerType.ArrowClosed,
				},
				animated: false,
				style: { strokeWidth: 1.5 },
				labelStyle: { fill: theme === "dark" ? "#aaa" : "#555", fontSize: 10 },
				labelBgStyle: {
					fill: theme === "dark" ? "#1a1a1a" : "#ffffff",
					fillOpacity: 0.8,
				},
			});
		});

		if (nodes.length > 0) {
			return getLayoutedElements(nodes, edges);
		}

		return { initialNodes: nodes, initialEdges: edges };
	}, [entities, relationships, theme]);

	const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
	const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

	useEffect(() => {
		setNodes(initialNodes);
		setEdges(initialEdges);
	}, [initialNodes, initialEdges, setNodes, setEdges]);

	if (!projectId) {
		return (
			<EmptyState
				icon={Network}
				title="No Project Selected"
				description="Select a project to view the entity network"
				className="h-full m-4"
			/>
		);
	}

	if (isLoadingEntities || isLoadingRelationships) {
		return (
			<div className="flex h-full items-center justify-center">
				<LoadingSpinner />
			</div>
		);
	}

	if (nodes.length === 0) {
		return (
			<EmptyState
				icon={Network}
				title="No Network Data"
				description="Add entities and relationships to visualize connections"
				className="h-full m-4"
			/>
		);
	}

	return (
		<div className="w-full h-full min-h-[300px] bg-muted/5 relative">
			<div className="absolute top-4 left-4 z-10 bg-background/80 backdrop-blur p-2 rounded-lg border text-xs shadow-sm">
				<div className="font-semibold mb-1">Entity Network</div>
				<div className="text-muted-foreground">
					{nodes.length} entities, {edges.length} connections
				</div>
			</div>

			<ReactFlow
				nodes={nodes}
				edges={edges}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				nodeTypes={nodeTypes}
				fitView
				minZoom={0.1}
				maxZoom={1.5}
				attributionPosition="bottom-right"
			>
				<Background color={theme === "dark" ? "#333" : "#eee"} gap={16} />
				<Controls />
			</ReactFlow>
		</div>
	);
}
