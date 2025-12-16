"use client";

import { useMemo, useCallback } from "react";
import { ReactFlow, Controls, Background, useNodesState, useEdgesState, Handle, Position, Node, Edge } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useTheme } from "next-themes";

interface NodeGraphProps {
  structure: any[];
  activeSceneId: string | null;
  onNodeClick: (sceneId: string) => void;
}

// Custom Node Component
const CustomSceneNode = ({ data, selected }: any) => {
  return (
    <div className={`px-4 py-2 rounded-md shadow-md border bg-card text-card-foreground min-w-[150px]
      ${selected ? 'ring-2 ring-primary border-primary' : 'border-border'}
    `}>
      <Handle type="target" position={Position.Left} className="w-2 h-2" />
      <div className="text-xs font-bold truncate">{data.label}</div>
      <div className="text-[10px] text-muted-foreground truncate">{data.chapter}</div>
      <Handle type="source" position={Position.Right} className="w-2 h-2" />
    </div>
  );
};

const nodeTypes = {
  scene: CustomSceneNode,
};

export function NodeGraph({ structure, activeSceneId, onNodeClick }: NodeGraphProps) {
  const { theme } = useTheme();

  // Transform structure into nodes and edges
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    if (!structure) return { initialNodes: [], initialEdges: [] };

    let x = 0;
    let y = 0;

    // Simple layout strategy: Chapters horizontal, Scenes vertical or vice versa.
    // Since it's a "Tree", let's use a simple grid for now.
    // In a real implementation, we'd use dagre or elkjs for layout.

    structure.forEach((chapter: any, cIdx: number) => {
      // Chapter Group? For now, just linear scenes.

      chapter.scenes.forEach((scene: any, sIdx: number) => {
         // Determine position based on previous scene ID or sequence
         // This is a naive layout.
         const nodeX = cIdx * 300 + (sIdx * 50);
         const nodeY = sIdx * 100;

         nodes.push({
            id: scene.id,
            type: 'scene',
            position: { x: nodeX, y: nodeY },
            data: { label: scene.title, chapter: chapter.title },
            selected: scene.id === activeSceneId
         });

         if (scene.prevSceneId) {
             edges.push({
                 id: `${scene.prevSceneId}-${scene.id}`,
                 source: scene.prevSceneId,
                 target: scene.id,
                 type: 'smoothstep',
                 animated: true,
             });
         } else if (sIdx === 0 && cIdx > 0) {
             // Link to last scene of previous chapter?
             // This logic needs the 'true' graph data.
             // For migration, we might rely on sequence if prevSceneId is missing.
         }
      });
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [structure, activeSceneId]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sync selection
  useMemo(() => {
      setNodes((nds) => nds.map((node) => ({
          ...node,
          selected: node.id === activeSceneId
      })));
  }, [activeSceneId, setNodes]);

  const handleNodeClick = useCallback((event: any, node: Node) => {
      onNodeClick(node.id);
  }, [onNodeClick]);

  return (
    <div className="w-full h-full min-h-[300px]">
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
        <Background color={theme === 'dark' ? '#333' : '#eee'} gap={16} />
        <Controls />
      </ReactFlow>
    </div>
  );
}
