import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { WriterControlBar } from "@/components/organisms/writer/writer-control-bar";

// Mock dependencies
vi.mock("@/components/organisms/writer/writer-control-context", () => ({
	useWriterControl: () => ({
		editorActions: { undo: vi.fn(), redo: vi.fn() },
		toggleChat: vi.fn(),
		isChatOpen: false,
		toggleSpotlight: vi.fn(),
		isSpotlightOpen: false,
	}),
}));

vi.mock("@/components/organisms/writer/writer-layout-context", () => ({
	useWriterLayoutContext: () => ({
		viewMode: "standard",
	}),
}));

vi.mock("@/components/organisms/writer/tools/ai-tools-menu", () => ({
	AIToolsMenu: () => <div data-testid="ai-tools-menu" />,
}));

// Mock GlassCard since it might use complex Framer Motion or other things
vi.mock("@/components/molecules/glass-card", () => ({
	GlassCard: ({
		children,
		className,
	}: {
		children: React.ReactNode;
		className?: string;
	}) => (
		<div className={className} data-testid="glass-card">
			{children}
		</div>
	),
}));

describe("WriterControlBar", () => {
	it("renders correctly with editor actions", () => {
		render(<WriterControlBar />);

		expect(screen.getByLabelText("Undo")).toBeInTheDocument();
		expect(screen.getByLabelText("Redo")).toBeInTheDocument();
		expect(screen.getByLabelText("Spotlight")).toBeInTheDocument();
		expect(screen.getByLabelText("AI Tools")).toBeInTheDocument();
		expect(screen.getByLabelText("Assistant")).toBeInTheDocument();
	});

	it("renders AI Tools Menu", () => {
		render(<WriterControlBar />);
		expect(screen.getByTestId("ai-tools-menu")).toBeInTheDocument();
	});
});
