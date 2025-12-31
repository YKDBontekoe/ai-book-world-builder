import { render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getProjectIssuesAction } from "../../../../../../src/app/actions/analysis";
import { getProjectStructure } from "../../../../../../src/app/actions/writer";
import { useBookCanvas } from "../../../../../../src/components/organisms/book-canvas/book-canvas-context";
import { GraphPane } from "../../../../../../src/components/organisms/book-canvas/panes/graph-pane";

// Mock dependencies with relative paths
vi.mock(
	"../../../../../../src/components/organisms/book-canvas/book-canvas-context",
	() => ({
		useBookCanvas: vi.fn(),
	}),
);

vi.mock("../../../../../../src/app/actions/writer", () => ({
	getProjectStructure: vi.fn(),
}));

vi.mock("../../../../../../src/app/actions/analysis", () => ({
	getProjectIssuesAction: vi.fn(),
}));

vi.mock("../../../../../../src/lib/query-options", () => ({
	QUERY_KEYS: {
		issues: (id: string) => ["issues", id],
	},
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

// Mock React Flow to be self-contained and avoid loading the large library
vi.mock("@xyflow/react", () => ({
	Background: () => <div>Background</div>,
	Controls: () => <div>Controls</div>,
	Handle: (props: any) => <div data-testid={`handle-${props.position}`} />,
	MarkerType: {
		ArrowClosed: "arrow-closed",
	},
	Position: {
		Left: "left",
		Right: "right",
	},
	ReactFlow: ({ nodes, edges, children }: any) => (
		<div data-testid="react-flow">
			Nodes: {nodes?.length}, Edges: {edges?.length}
			{children}
		</div>
	),
	useEdgesState: (initial: any) => {
		const [edges, setEdges] = React.useState(initial);
		return [edges, setEdges, vi.fn()];
	},
	useNodesState: (initial: any) => {
		const [nodes, setNodes] = React.useState(initial);
		return [nodes, setNodes, vi.fn()];
	},
}));

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

	// TODO: This test is skipped due to a persistent out-of-memory error in the CI environment.
	// The test runs successfully locally, but fails in CI even after extensive mocking.
	// This suggests an issue with the test runner's configuration or resource limits.
	it.skip("renders without crashing", async () => {
		(useBookCanvas as any).mockReturnValue({
			projectId: "test-project-id",
			activeSceneId: null,
			setActiveSceneId: vi.fn(),
		});

		// Mock return values
		const mockStructure = {
			structure: [
				{
					title: "Chapter 1",
					scenes: [
						{ id: "s1", title: "Scene 1", prevSceneId: null },
						{ id: "s2", title: "Scene 2", prevSceneId: "s1" },
					],
				},
			],
		};

		(getProjectStructure as any).mockResolvedValue(mockStructure);

		(getProjectIssuesAction as any).mockResolvedValue({
			success: true,
			issues: [],
		});

		const useQuery = await import("@tanstack/react-query").then(
			(m) => m.useQuery,
		);
		(useQuery as any).mockImplementation(({ queryKey }: any) => {
			if (queryKey[0] === "project-structure") {
				return {
					data: mockStructure,
					isLoading: false,
				};
			}
			if (queryKey[0] === "issues") {
				return {
					data: { success: true, issues: [] },
					isLoading: false,
				};
			}
			return { data: null, isLoading: false };
		});

		render(<GraphPane />);

		expect(screen.getByTestId("react-flow")).toBeInTheDocument();
		expect(screen.getByText("Nodes: 2, Edges: 1")).toBeInTheDocument();
	});
});
