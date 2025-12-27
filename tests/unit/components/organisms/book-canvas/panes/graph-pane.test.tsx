import { render, screen, waitFor } from "@testing-library/react";
import * as ReactFlow from "@xyflow/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getEntitiesForProject } from "../../../../../../src/app/actions/entities";
import { useBookCanvas } from "../../../../../../src/components/organisms/book-canvas/book-canvas-context";
import { GraphPane } from "../../../../../../src/components/organisms/book-canvas/panes/graph-pane";

// Mock dependencies with relative paths
vi.mock(
	"../../../../../../src/components/organisms/book-canvas/book-canvas-context",
	() => ({
		useBookCanvas: vi.fn(),
	}),
);

vi.mock("../../../../../../src/app/actions/entities", () => ({
	getEntitiesForProject: vi.fn(),
}));

// Mock @tanstack/react-query
vi.mock("@tanstack/react-query", async (importOriginal) => {
	const actual = await importOriginal();
	return {
		...(actual as any),
		useQuery: vi.fn(),
	};
});

// Mock dagre
vi.mock("dagre", () => ({
	default: {
		graphlib: {
			Graph: class {
				setDefaultEdgeLabel() {}
				setGraph() {}
				setNode() {}
				setEdge() {}
				node() {
					return { x: 0, y: 0 };
				}
			},
		},
		layout: vi.fn(),
	},
}));

// Mock React Flow
vi.mock("@xyflow/react", async (importOriginal) => {
	const actual = await importOriginal();
	return {
		...(actual as any),
		ReactFlow: ({ nodes, edges, children }: any) => (
			<div data-testid="react-flow">
				Nodes: {nodes?.length}, Edges: {edges?.length}
				{children}
			</div>
		),
		Background: () => <div>Background</div>,
		Controls: () => <div>Controls</div>,
		useNodesState: (initial: any) => {
			const [nodes, setNodes] = React.useState(initial);
			return [nodes, setNodes, vi.fn()];
		},
		useEdgesState: (initial: any) => {
			const [edges, setEdges] = React.useState(initial);
			return [edges, setEdges, vi.fn()];
		},
	};
});

describe("GraphPane", () => {
	beforeEach(() => {
		vi.clearAllMocks();

		// Polyfill ResizeObserver
		global.ResizeObserver = class ResizeObserver {
			observe() {}
			unobserve() {}
			disconnect() {}
		};
	});

	it("renders without crashing and displays entities", async () => {
		(useBookCanvas as any).mockReturnValue({
			projectId: "test-project-id",
		});

		// Mock Entities Return
		const mockEntities = [
			{
				id: "e1",
				name: "Alice",
				kind: "Character",
				relationships: [
					{
						id: "rel1",
						sourceEntityId: "e1",
						targetEntityId: "e2",
						type: "friend",
					},
				],
			},
			{
				id: "e2",
				name: "Bob",
				kind: "Character",
				relationships: [
					{
						id: "rel1",
						sourceEntityId: "e1",
						targetEntityId: "e2",
						type: "friend",
					},
				],
			},
		];

		const useQuery = await import("@tanstack/react-query").then(
			(m) => m.useQuery,
		);
		(useQuery as any).mockImplementation(({ queryKey }: any) => {
			if (queryKey[0] === "entities") {
				return {
					data: { success: mockEntities },
					isLoading: false,
				};
			}
			return { data: null, isLoading: false };
		});

		render(<GraphPane />);

		expect(screen.getByTestId("react-flow")).toBeInTheDocument();
		// We have 2 entities -> 2 Nodes.
		// We have 1 unique relationship -> 1 Edge.
		expect(screen.getByText("Nodes: 2, Edges: 1")).toBeInTheDocument();
	});

	it("renders empty state when no entities", async () => {
		(useBookCanvas as any).mockReturnValue({
			projectId: "test-project-id",
		});

		const useQuery = await import("@tanstack/react-query").then(
			(m) => m.useQuery,
		);
		(useQuery as any).mockImplementation(({ queryKey }: any) => {
			return {
				data: { success: [] },
				isLoading: false,
			};
		});

		render(<GraphPane />);
		expect(screen.getByText("No Entities Found")).toBeInTheDocument();
	});
});
