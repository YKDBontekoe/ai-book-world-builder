"use client";

import { useQuery } from "@tanstack/react-query";
import { Network } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback, useMemo } from "react";
import { ReactFlow, Background, Controls, useNodesState, useEdgesState, Position, Handle, type Node, type Edge } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { getProjectStructure } from "@/app/actions/writer";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { QUERY_KEYS, STALE_TIMES } from "@/lib/query-options";
import { useBookCanvas } from "../book-canvas-context";

// Custom Node Component
const CustomSceneNode = ({ data, selected }: any) => {
	return (
		<div
			className={`px-4 py-2 rounded-md shadow-md border bg-card text-card-foreground min-w-[150px]
      ${selected ? "ring-2 ring-primary border-primary" : "border-border"}
    `}
		>
			<Handle type="target" position={Position.Left} className="w-2 h-2" />
			<div className="text-xs font-bold truncate">{data.label}</div>
			<div className="text-[10px] text-muted-foreground truncate">
				{data.chapter}
			</div>
			<Handle type="source" position={Position.Right} className="w-2 h-2" />
		</div>
	);
};

const nodeTypes = {
	scene: CustomSceneNode,
};

export function GraphPane() {
	const { projectId, activeSceneId, setActiveSceneId } = useBookCanvas();
	const { theme } = useTheme();

	const { data: result, isLoading } = useQuery({
		queryKey: projectId ? ["project-structure", projectId] : ["structure", "null"],
		queryFn: () =>
			projectId ? getProjectStructure(projectId) : Promise.resolve(null),
		enabled: !!projectId,
		staleTime: STALE_TIMES.CONTEXT,
	});

	const structure = result?.structure;

	// Transform structure into nodes and edges
	const { initialNodes, initialEdges } = useMemo(() => {
		const nodes: Node[] = [];
		const edges: Edge[] = [];

		if (!structure) return { initialNodes: [], initialEdges: [] };

		structure.forEach((chapter: any, cIdx: number) => {
			chapter.scenes.forEach((scene: any, sIdx: number) => {
				// Simple grid layout
				const nodeX = cIdx * 300 + sIdx * 50;
				const nodeY = sIdx * 100;

				nodes.push({
					id: scene.id,
					type: "scene",
					position: { x: nodeX, y: nodeY },
					data: { label: scene.title, chapter: chapter.title },
					selected: scene.id === activeSceneId,
				});

				if (scene.prevSceneId) {
					edges.push({
						id: `${scene.prevSceneId}-${scene.id}`,
						source: scene.prevSceneId,
						target: scene.id,
						type: "smoothstep",
						animated: true,
					});
				}
			});
		});

		return { initialNodes: nodes, initialEdges: edges };
	}, [structure, activeSceneId]);

	const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
	const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

	// Sync selection
	useMemo(() => {
		setNodes((nds) =>
			nds.map((node) => ({
				...node,
				selected: node.id === activeSceneId,
			})),
		);
	}, [activeSceneId, setNodes]);

	const handleNodeClick = useCallback(
		(event: any, node: Node) => {
			if (setActiveSceneId) {
				setActiveSceneId(node.id);
			}
		},
		[setActiveSceneId],
	);

	if (!projectId) {
		return (
			<EmptyState
				icon={Network}
				title="No Project Selected"
				description="Select a project to view the node graph"
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

	return (
		<div className="w-full h-full min-h-[300px] bg-muted/5">
			<ReactFlow
				nodes={nodes}
				edges={edges}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				onNodeClick={handleNodeClick}
				nodeTypes={nodeTypes}
				fitView
				minZoom={0.1}
				maxZoom={1.5}
			>
				<Background color={theme === "dark" ? "#333" : "#eee"} gap={16} />
				<Controls />
			</ReactFlow>
		</div>
	);
}
