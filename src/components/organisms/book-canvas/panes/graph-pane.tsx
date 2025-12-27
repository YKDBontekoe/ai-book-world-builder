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
import { Network, User, MapPin, Package } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useMemo } from "react";
import "@xyflow/react/dist/style.css";

import { getEntitiesForProject } from "@/app/actions/entities";
import { LoadingSpinner } from "@/components/atoms/loading-spinner";
import { EmptyState } from "@/components/molecules/empty-state";
import { useBookCanvas } from "@/components/organisms/book-canvas/book-canvas-context";

// Helper to resolve icon from name
const getIconComponent = (name: string) => {
	switch (name) {
		case "MapPin": return MapPin;
		case "Package": return Package;
		default: return User;
	}
};

// Custom Node Component
const EntityNode = ({ data, selected }: any) => {
	const Icon = getIconComponent(data.iconName);

	return (
		<div
			className={`px-4 py-2 rounded-lg shadow-md border bg-card text-card-foreground min-w-[140px] relative transition-all
      ${selected ? "ring-2 ring-primary border-primary shadow-lg scale-105" : "border-border"}
    `}
		>
			<Handle type="target" position={Position.Top} className="w-2 h-2 !bg-muted-foreground" />
			<div className="flex items-center gap-2 mb-1">
				<div className={`p-1.5 rounded-full ${data.color || "bg-primary/10 text-primary"}`}>
					<Icon className="w-3.5 h-3.5" />
				</div>
				<div className="text-xs font-bold truncate flex-1">{data.label}</div>
			</div>
			{data.kind && (
				<div className="text-[10px] text-muted-foreground truncate pl-1 uppercase tracking-wider font-medium opacity-70">
					{data.kind}
				</div>
			)}
			<Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-muted-foreground" />
		</div>
	);
};

const nodeTypes = {
	entity: EntityNode,
};

const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
	const dagreGraph = new dagre.graphlib.Graph();
	dagreGraph.setDefaultEdgeLabel(() => ({}));

	// Use Top-Down for entity hierarchies (e.g. family trees) or just spread them out
	dagreGraph.setGraph({ rankdir: "TB", nodesep: 80, ranksep: 80 });

	nodes.forEach((node) => {
		dagreGraph.setNode(node.id, { width: 160, height: 70 });
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
				y: nodeWithPosition.y - 35,
			};
		}
	});

	return { initialNodes: nodes, initialEdges: edges };
};

const getEntityIconName = (kind: string) => {
	const lower = kind.toLowerCase();
	if (lower.includes("location") || lower.includes("place")) return "MapPin";
	if (lower.includes("item") || lower.includes("object")) return "Package";
	return "User";
};

const getEntityColor = (kind: string) => {
	const lower = kind.toLowerCase();
	if (lower.includes("location") || lower.includes("place")) return "bg-emerald-500/10 text-emerald-500";
	if (lower.includes("item") || lower.includes("object")) return "bg-amber-500/10 text-amber-500";
	if (lower.includes("antagonist") || lower.includes("villain")) return "bg-red-500/10 text-red-500";
	return "bg-blue-500/10 text-blue-500";
};

export function GraphPane() {
	const { projectId } = useBookCanvas();
	const { theme } = useTheme();

	const { data: result, isLoading } = useQuery({
		queryKey: projectId ? ["entities", projectId] : ["entities", "null"],
		queryFn: () =>
			projectId ? getEntitiesForProject(projectId) : Promise.resolve({ success: [] }),
		enabled: !!projectId,
	});

	// Handle the union type return from action
	const entities = result && 'success' in result ? result.success : [];

	const { initialNodes, initialEdges } = useMemo(() => {
		const nodes: Node[] = [];
		const edges: Edge[] = [];
		const addedEdges = new Set<string>();

		if (!entities || entities.length === 0) return { initialNodes: [], initialEdges: [] };

		entities.forEach((entity) => {
			nodes.push({
				id: entity.id,
				type: "entity",
				position: { x: 0, y: 0 },
				data: {
					label: entity.name,
					kind: entity.kind,
					iconName: getEntityIconName(entity.kind),
					color: getEntityColor(entity.kind),
				},
			});

			// Relationships are duplicated on both source and target in the API return.
			// We iterate through them but use a Set to ensure we only add each edge once.
			entity.relationships.forEach((rel) => {
				const edgeId = rel.id;
				if (!addedEdges.has(edgeId)) {
					addedEdges.add(edgeId);
					edges.push({
						id: edgeId,
						source: rel.sourceEntityId,
						target: rel.targetEntityId,
						label: rel.type, // Show relationship type on edge
						type: "smoothstep",
						markerEnd: {
							type: MarkerType.ArrowClosed,
						},
						animated: false,
						labelStyle: { fill: theme === 'dark' ? '#aaa' : '#555', fontSize: 10, fontWeight: 500 },
						style: { stroke: theme === 'dark' ? '#555' : '#ccc' },
					});
				}
			});
		});

		return getLayoutedElements(nodes, edges);
	}, [entities, theme]);

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
				description="Select a project to view the entity web"
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

	if (nodes.length === 0) {
		return (
			<EmptyState
				icon={Network}
				title="No Entities Found"
				description="Create characters and locations to see their connections here."
				className="h-full m-4"
			/>
		);
	}

	return (
		<div className="w-full h-full min-h-[300px] bg-muted/5">
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
