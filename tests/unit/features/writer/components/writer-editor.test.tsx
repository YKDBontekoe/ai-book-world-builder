import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type * as writerContentContext from "@/features/writer/components/writer-content-context";
import type * as writerContext from "@/features/writer/components/writer-context";
import { WriterControlProvider } from "@/features/writer/components/writer-control-context";
import { WriterEditor } from "@/features/writer/components/writer-editor";

// --- Mocks ---

// Mock Server Actions
const mockExportProject = vi.fn();
vi.mock("@/features/writer/actions", () => ({
	initializeProject: vi.fn(),
	exportProject: (...args: any[]) => mockExportProject(...args),
	createSceneInChapter: vi.fn(),
}));

import { exportProject } from "@/features/writer/actions";

// Mock Appearance Provider
vi.mock("@/components/providers/appearance-provider", () => ({
	useAppearance: () => ({
		theme: "violet",
		editorFont: "sans",
		editorFontSize: 16,
		editorLineHeight: 1.6,
		updatePreferences: vi.fn(),
		isLoading: false,
	}),
}));

// Mock child components
vi.mock("@/components/organisms/editor/text-editor", () => ({
	Editor: () => <div data-testid="text-editor">Editor Content</div>,
}));

vi.mock("@/components/atoms/empty-state", () => ({
	EmptyState: ({ title, description, action }: any) => (
		<div data-testid="empty-state">
			<h1>{title}</h1>
			<p>{description}</p>
			{action}
		</div>
	),
}));

vi.mock("@/hooks/use-project-entities", () => ({
	useProjectEntities: vi.fn(() => ({ data: [] })),
}));

vi.mock("@/features/writer/components/writer-header", () => ({
	WriterHeader: () => <div data-testid="writer-header">Header</div>,
}));

vi.mock("@/features/writer/components/story-wizard", () => ({
	StoryWizard: ({ onComplete }: any) => (
		<div data-testid="story-wizard">
			Story Wizard
			<button type="button" onClick={onComplete}>
				Complete
			</button>
		</div>
	),
}));

vi.mock("@/features/writer/components/dashboard/director-dashboard", () => ({
	DirectorDashboard: () => (
		<div data-testid="director-dashboard">Director Dashboard</div>
	),
}));

vi.mock("@/features/writer/components/tools/contextual-prompts", () => ({
	ContextualPrompts: () => (
		<div data-testid="contextual-prompts">Contextual Prompts</div>
	),
}));

vi.mock("@/features/writer/components/tools/writing-style-analyzer", () => ({
	WritingStyleAnalyzer: () => (
		<div data-testid="writing-style-analyzer">Analyzer</div>
	),
}));

vi.mock("@/features/writer/components/time-travel-controls", () => ({
	TimeTravelControls: () => <div data-testid="time-travel-controls">Time Travel Controls</div>,
}));

vi.mock("@/hooks/use-narrative-intelligence", () => ({
	useNarrativeIntelligence: vi.fn(() => ({
		wordCount: 100,
		readingTimeMinutes: 1,
		pacingScore: 50,
		sentimentScore: 0,
		complexityScore: 50,
		characterMentions: {},
		sentenceCount: 10,
		pacingGraphData: [],
	})),
}));

// Mock app/actions/story-generation to prevent DB connection
vi.mock("@/app/actions/story-generation", () => ({
	planChapterScenes: vi.fn(),
	generateSceneText: vi.fn(),
}));

// Mock Icons
vi.mock("lucide-react", () => ({
	Loader2: () => <span>Loading...</span>,
	Save: () => <span>Save</span>,
	History: () => <span>History</span>,
	Sparkles: () => <span>Sparkles</span>,
	MousePointerClick: () => <span>Click</span>,
	Lock: () => <span>Lock</span>,
	RotateCcw: () => <span>Time Travel</span>,
}));

// Mock useRouter
const mockPush = vi.fn();
const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
	useRouter: () => ({
		push: mockPush,
		refresh: mockRefresh,
	}),
}));

// Mock Contexts
const mockUseWriterContext = vi.fn();
const mockUseWriterContent = vi.fn();

vi.mock(
	"@/features/writer/components/writer-context",
	async (importOriginal) => {
		const actual = await importOriginal<typeof writerContext>();
		return {
			...actual,
			useWriterContext: () => mockUseWriterContext(),
		};
	},
);

vi.mock(
	"@/features/writer/components/writer-content-context",
	async (importOriginal) => {
		const actual = await importOriginal<typeof writerContentContext>();
		return {
			...actual,
			useWriterContent: () => mockUseWriterContent(),
		};
	},
);

// Mock Layout Context
const mockUseWriterLayoutContext = vi.fn();
vi.mock(
	"@/features/writer/components/writer-layout-context",
	async (importOriginal) => {
		const actual = await importOriginal<any>();
		return {
			...actual,
			useWriterLayoutContext: () => mockUseWriterLayoutContext(),
		};
	},
);

// Mock Sonner
const mockToastError = vi.fn();
vi.mock("sonner", () => ({
	toast: {
		success: vi.fn(),
		error: (...args: any[]) => mockToastError(...args),
		loading: vi.fn(),
		dismiss: vi.fn(),
	},
}));

// Mock Clipboard
const mockWriteText = vi.fn();
Object.defineProperty(navigator, 'clipboard', {
	value: {
		writeText: mockWriteText,
	},
	writable: true,
	configurable: true,
});

// Helper to render with providers
const renderWithProviders = (ui: React.ReactNode) => {
	return render(<WriterControlProvider>{ui}</WriterControlProvider>);
};

describe("WriterEditor", () => {
	const defaultStructureContext = {
		project: { id: "project-123" },
		activeScene: undefined,
		activeSceneId: null,
		structure: [],
		isReadOnly: false,
		fetchStructure: vi.fn(),
		setActiveSceneId: vi.fn(),
	};

	const defaultContentContext = {
		sceneContent: "",
		handleContentChange: vi.fn(),
		handleSnapshot: vi.fn(),
		isSnapshotting: false,
		isSaving: false,
		lastSaved: false,
	};

	beforeEach(() => {
		vi.clearAllMocks();
		mockExportProject.mockReset();
		mockToastError.mockReset();

		mockUseWriterContext.mockReturnValue(defaultStructureContext);
		mockUseWriterContent.mockReturnValue(defaultContentContext);
		mockUseWriterLayoutContext.mockReturnValue({
			isSidebarOpen: true,
			toggleSidebar: vi.fn(),
			viewMode: "standard",
			toggleZenMode: vi.fn(),
			isTypewriterMode: false,
			toggleTypewriterMode: vi.fn(),
			isDirectorMode: false, // Ensure this is present
		});
	});

	it("renders StoryWizard when no scene selected and hasScenes is false (and not read-only)", () => {
		mockUseWriterContext.mockReturnValue({
			...defaultStructureContext,
			structure: [],
		});
		renderWithProviders(<WriterEditor />);

		expect(screen.getByTestId("story-wizard")).toBeInTheDocument();
	});

	it("renders Empty State (Read Only) when no scene selected, hasScenes is false, and isReadOnly is true", () => {
		mockUseWriterContext.mockReturnValue({
			...defaultStructureContext,
			structure: [],
			isReadOnly: true,
		});
		renderWithProviders(<WriterEditor />);

		expect(screen.getByTestId("empty-state")).toBeInTheDocument();
		expect(screen.getByText("Empty Project")).toBeInTheDocument();
		expect(screen.queryByTestId("story-wizard")).not.toBeInTheDocument();
	});

	it("renders 'No Scene Selected' when no scene selected but hasScenes is true", () => {
		mockUseWriterContext.mockReturnValue({
			...defaultStructureContext,
			structure: [{ scenes: [{ id: "s1" }] }], // hasScenes = true
		});
		renderWithProviders(<WriterEditor />);

		expect(screen.getByTestId("empty-state")).toBeInTheDocument();
		expect(screen.getByText("No Scene Selected")).toBeInTheDocument();
	});

	it("renders Editor when scene is selected", () => {
		mockUseWriterContext.mockReturnValue({
			...defaultStructureContext,
			activeSceneId: "scene-1",
			activeScene: { id: "scene-1", title: "Scene 1" },
			structure: [{ scenes: [{ id: "scene-1" }] }],
		});
		renderWithProviders(<WriterEditor />);

		expect(screen.getByTestId("text-editor")).toBeInTheDocument();
		expect(screen.queryByTestId("empty-state")).not.toBeInTheDocument();
	});

	it("calls refresh when wizard completes", async () => {
		mockUseWriterContext.mockReturnValue({
			...defaultStructureContext,
			structure: [],
		});
		renderWithProviders(<WriterEditor />);

		const completeButton = screen.getByText("Complete");
		fireEvent.click(completeButton);

		expect(mockRefresh).toHaveBeenCalled();
	});

	it("handles export error gracefully", async () => {
		const user = userEvent.setup();
		mockExportProject.mockRejectedValue(new Error("Network error"));

		mockUseWriterContext.mockReturnValue({
			...defaultStructureContext,
			structure: [],
		});

		renderWithProviders(<WriterEditor />);

		// Trigger Export Hotkey
		await user.keyboard("{Meta>}{Shift>}e{/Shift}{/Meta}");

		await waitFor(() => {
			expect(mockExportProject).toHaveBeenCalled();
		});

		expect(mockToastError).toHaveBeenCalledWith("Error exporting project", expect.anything());
	});
});
