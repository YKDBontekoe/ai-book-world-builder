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
import { AlertTriangle, Network } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useMemo } from "react";
import "@xyflow/react/dist/style.css";

import { getProjectIssuesAction } from "@/app/actions/analysis";
import { getProjectStructure } from "@/app/actions/writer";
import { LoadingSpinner } from "@/components/atoms/loading-spinner";
import { EmptyState } from "@/components/molecules/empty-state";
import { useBookCanvas } from "@/components/organisms/book-canvas/book-canvas-context";
import { QUERY_KEYS } from "@/lib/query-options";

// Custom Node Component
const CustomSceneNode = ({ data, selected }: any) => {
	const hasIssues = data.issueCount > 0;

	return (
		<div
			className={`px-4 py-2 rounded-md shadow-md border bg-card text-card-foreground min-w-[150px] relative
      ${selected ? "ring-2 ring-primary border-primary" : hasIssues ? "border-amber-500 ring-1 ring-amber-500" : "border-border"}
    `}
		>
			{hasIssues && (
				<div className="absolute -top-2 -right-2 bg-amber-500 text-white rounded-full p-0.5 shadow-sm">
					<AlertTriangle className="w-3 h-3" />
				</div>
			)}
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

const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
	const dagreGraph = new dagre.graphlib.Graph();
	dagreGraph.setDefaultEdgeLabel(() => ({}));

	dagreGraph.setGraph({ rankdir: "LR" });

	nodes.forEach((node) => {
		dagreGraph.setNode(node.id, { width: 180, height: 60 });
	});

	edges.forEach((edge) => {
		dagreGraph.setEdge(edge.source, edge.target);
	});

	dagre.layout(dagreGraph);

	nodes.forEach((node) => {
		const nodeWithPosition = dagreGraph.node(node.id);
		if (nodeWithPosition) {
			node.position = {
				x: nodeWithPosition.x - 90, // center offset
				y: nodeWithPosition.y - 30,
			};
		}
	});

	return { initialNodes: nodes, initialEdges: edges };
};

export function GraphPane() {
	const { projectId, activeSceneId, setActiveSceneId } = useBookCanvas();
	const { theme } = useTheme();

	const { data: result, isLoading } = useQuery({
		queryKey: projectId
			? ["project-structure", projectId]
			: ["structure", "null"],
		queryFn: () =>
			projectId ? getProjectStructure(projectId) : Promise.resolve(null),
		enabled: !!projectId,
	});

	const { data: issuesData } = useQuery({
		queryKey: projectId ? QUERY_KEYS.issues(projectId) : ["issues", "null"],
		queryFn: () =>
			projectId
				? getProjectIssuesAction(projectId)
				: Promise.resolve({ success: false, issues: [] }),
		enabled: !!projectId,
	});

	const structure = result?.structure;
	const issues =
		issuesData?.success && Array.isArray(issuesData.issues)
			? issuesData.issues
			: [];

	// Transform structure into nodes and edges
	const { initialNodes, initialEdges } = useMemo(() => {
		const nodes: Node[] = [];
		const edges: Edge[] = [];

		if (!structure) return { initialNodes: [], initialEdges: [] };

		type Issue = NonNullable<typeof issuesData>["issues"][number];

		// Optimization: Create an issue lookup map for O(1) access instead of filtering O(N) inside the loop
		const issuesByScene = new Map<string, Issue[]>();
		issues.forEach((issue) => {
			if (issue.status === "open" && issue.sceneId) {
				if (!issuesByScene.has(issue.sceneId)) {
					issuesByScene.set(issue.sceneId, []);
				}
				issuesByScene.get(issue.sceneId)?.push(issue);
			}
		});

		// Flatten structure
		structure.forEach((chapter) => {
			chapter.scenes.forEach((scene) => {
				const sceneIssues = issuesByScene.get(scene.id) || [];

				nodes.push({
					id: scene.id,
					type: "scene",
					position: { x: 0, y: 0 }, // Calculated by dagre
					data: {
						label: scene.title,
						chapter: chapter.title,
						issueCount: sceneIssues.length,
					},
					selected: scene.id === activeSceneId,
				});

				if (scene.prevSceneId) {
					edges.push({
						id: `${scene.prevSceneId}-${scene.id}`,
						source: scene.prevSceneId,
						target: scene.id,
						type: "smoothstep",
						markerEnd: {
							type: MarkerType.ArrowClosed,
						},
						animated: true,
					});
				}
			});
		});

		return getLayoutedElements(nodes, edges);
	}, [structure, activeSceneId, issues]);

	const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
	const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

	// Update nodes when initialNodes change (due to layout or data updates)
	useEffect(() => {
		setNodes(initialNodes);
		setEdges(initialEdges);
	}, [initialNodes, initialEdges, setNodes, setEdges]);

	const handleNodeClick = useCallback(
		(_event: any, node: Node) => {
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
				attributionPosition="bottom-right"
			>
				<Background color={theme === "dark" ? "#333" : "#eee"} gap={16} />
				<Controls />
			</ReactFlow>
		</div>
	);
}
