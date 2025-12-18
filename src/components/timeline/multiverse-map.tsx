"use client";

import { useCallback, useEffect, useMemo } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  Position,
  Handle,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import dagre from "dagre";
import { Loader2 } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";

// Custom Node Component
const TimelineNodeComponent = ({ data }: NodeProps) => {
  return (
    <div
      className={`px-4 py-2 rounded-lg shadow-md border min-w-[150px] text-center transition-all ${
        data.type === "canon"
          ? "bg-background border-primary/50"
          : "bg-amber-500/10 border-amber-500/50"
      }`}
    >
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-muted-foreground" />
      <div className="font-bold text-xs mb-1 uppercase tracking-wider text-muted-foreground">
        {data.type === "canon" ? "Canon" : "Branch"}
      </div>
      <div className="text-sm font-medium">{data.label as string}</div>
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-muted-foreground" />
    </div>
  );
};

const nodeTypes = {
  timelineNode: TimelineNodeComponent,
};

interface MultiverseMapProps {
  nodes: any[];
  branches: any[];
  onNodeClick: (nodeId: string) => void;
}

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = "LR") => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const isHorizontal = direction === "LR";
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 150, height: 50 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      // We are shifting the dagre node position (anchor=center center) to the top left
      // so it matches the React Flow node anchor point (top left).
      position: {
        x: nodeWithPosition.x - 150 / 2,
        y: nodeWithPosition.y - 50 / 2,
      },
    };
  });

  return { nodes: newNodes, edges };
};

export function MultiverseMap({ nodes: dbNodes, branches, onNodeClick }: MultiverseMapProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  useEffect(() => {
    if (!dbNodes.length) return;

    const initialNodes: Node[] = dbNodes.map((n) => ({
      id: n.id,
      type: "timelineNode",
      data: { label: n.summary || "Event", type: n.type },
      position: { x: 0, y: 0 },
    }));

    const initialEdges: Edge[] = dbNodes
      .filter((n) => n.parentNodeId)
      .map((n) => ({
        id: `e-${n.parentNodeId}-${n.id}`,
        source: n.parentNodeId,
        target: n.id,
        animated: n.type === "divergent",
        style: { stroke: n.type === "canon" ? "var(--primary)" : "var(--amber-500)", strokeWidth: n.type === "canon" ? 2 : 1 },
      }));

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      initialNodes,
      initialEdges
    );

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [dbNodes, setNodes, setEdges]);

  return (
    <div className="h-[600px] w-full bg-muted/5 rounded-xl border border-border overflow-hidden relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={(_, node) => onNodeClick(node.id)}
        nodeTypes={nodeTypes}
        fitView
        className="bg-background/50"
      >
        <Background color="#888" gap={16} size={1} className="opacity-20" />
        <Controls className="bg-background border-border" />
        <MiniMap
            nodeColor={(n) => n.data.type === 'canon' ? 'var(--primary)' : 'var(--amber-500)'}
            className="bg-background border-border"
        />
      </ReactFlow>
    </div>
  );
}
