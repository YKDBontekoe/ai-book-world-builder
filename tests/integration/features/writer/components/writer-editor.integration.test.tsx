import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { WriterProvider } from "@/features/writer/components/writer-context";
import { WriterControlProvider } from "@/features/writer/components/writer-control-context";
import { WriterEditor } from "@/features/writer/components/writer-editor";
import { WriterLayoutContext } from "@/features/writer/components/writer-layout-context";
import type { Project } from "@/lib/db/schema";
import type { ChapterWithScenes } from "@/lib/types";

// --- Mocks ---

// Mock Server Actions
vi.mock("@/features/writer/actions", () => ({
	exportProject: vi
		.fn()
		.mockResolvedValue({ success: true, content: "Exported Content" }),
	createSceneInChapter: vi
		.fn()
		.mockResolvedValue({ success: true, sceneId: "new-scene-id" }),
	getProjectStructure: vi.fn().mockResolvedValue({
		success: true,
		data: { structure: [], structureText: "" },
	}),
	updateLastViewedScene: vi.fn().mockResolvedValue({ success: true }),
	getSceneContent: vi
		.fn()
		.mockResolvedValue({ success: true, data: "Hello World" }),
}));

import { createSceneInChapter, exportProject } from "@/features/writer/actions";

// Mock Child Components
vi.mock("@/components/organisms/editor/text-editor", () => ({
	Editor: ({ content, onSaveContent }: any) => (
		<div data-testid="mock-text-editor">
			<textarea
				data-testid="editor-textarea"
				value={content}
				onChange={(e) => onSaveContent(e.target.value, false)}
			/>
		</div>
	),
}));

vi.mock("@/features/writer/components/tools/contextual-prompts", () => ({
	ContextualPrompts: () => <div data-testid="contextual-prompts" />,
}));
vi.mock("@/features/writer/components/tools/writing-style-analyzer", () => ({
	WritingStyleAnalyzer: () => <div data-testid="writing-style-analyzer" />,
}));
vi.mock("@/features/writer/components/writer-header", () => ({
	WriterHeader: () => <div data-testid="writer-header" />,
}));
vi.mock(
	"@/features/writer/components/editor-states/writer-empty-state",
	() => ({
		WriterEmptyState: () => <div data-testid="writer-empty-state" />,
	}),
);
vi.mock("@/features/writer/components/time-travel-controls", () => ({
	TimeTravelControls: () => <div data-testid="time-travel-controls" />,
}));

// Mock Appearance
vi.mock("@/components/providers/appearance-provider", () => ({
	useAppearance: () => ({
		editorFont: "sans",
		editorFontSize: 16,
		editorLineHeight: 1.5,
	}),
}));

// Mock Project Entities
vi.mock("@/hooks/use-project-entities", () => ({
	useProjectEntities: () => ({ data: [] }),
}));

// Mock Sonner
vi.mock("sonner", () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
		loading: vi.fn(),
		dismiss: vi.fn(),
	},
}));

// Mock Navigation
vi.mock("next/navigation", () => ({
	useRouter: () => ({
		push: vi.fn(),
		refresh: vi.fn(),
	}),
}));

// Mock Book Canvas Context
const mockSetActiveSceneId = vi.fn();
let currentActiveSceneId: string | null = null;

vi.mock("@/components/organisms/book-canvas/book-canvas-context", () => ({
	useBookCanvasSelection: () => ({
		activeSceneId: currentActiveSceneId,
	}),
	useBookCanvasActions: () => ({
		setActiveSceneId: (id: string | null) => {
			currentActiveSceneId = id;
			mockSetActiveSceneId(id);
		},
	}),
}));

// Mock Clipboard
const mockWriteText = vi.fn();
Object.defineProperty(navigator, "clipboard", {
	value: {
		writeText: mockWriteText,
	},
	writable: true,
	configurable: true,
});

// --- Test Setup ---

const mockProject: Project = {
	id: "project-1",
	name: "Test Project",
	description: "Desc",
	userId: "user-1",
	createdAt: new Date(),
	visibility: "private",
	folders: [],
	forkedFromId: null,
	lastViewedSceneId: null,
};

const mockStructure: ChapterWithScenes[] = [
	{
		id: "chapter-1",
		title: "Chapter 1",
		sequence: 0,
		projectId: "project-1",
		createdAt: new Date(),
		updatedAt: new Date(),
		outlineId: "outline-1",
		volumeId: "volume-1",
		notes: null,
		status: "planned",
		scenes: [
			{
				id: "scene-1",
				title: "Scene 1",
				content: "Hello World",
				chapterId: "chapter-1",
				createdAt: new Date(),
				updatedAt: new Date(),
				sequence: 0,
				projectId: "project-1",
				wordCount: 2,
				status: "draft",
				prevSceneId: null,
			},
		],
	},
];

const defaultLayoutContext = {
	isSidebarOpen: true,
	toggleSidebar: vi.fn(),
	isCanvasOpen: false,
	toggleCanvas: vi.fn(),
	viewMode: "standard" as const,
	toggleZenMode: vi.fn(),
	isTypewriterMode: false,
	toggleTypewriterMode: vi.fn(),
	isDirectorMode: false,
	toggleDirectorMode: vi.fn(),
};

function renderEditor(
	initialStructure = mockStructure,
	lastViewedSceneId: string | null = "scene-1",
) {
	currentActiveSceneId = lastViewedSceneId; // Reset state
	return render(
		<WriterLayoutContext.Provider value={defaultLayoutContext}>
			<WriterProvider
				project={{ ...mockProject, lastViewedSceneId }}
				initialStructure={initialStructure}
			>
				<WriterControlProvider>
					<WriterEditor />
				</WriterControlProvider>
			</WriterProvider>
		</WriterLayoutContext.Provider>,
	);
}

describe("WriterEditor Integration", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockWriteText.mockReset();
	});

	it("renders the active scene content", async () => {
		renderEditor();
		expect(screen.getByTestId("mock-text-editor")).toBeInTheDocument();
		expect(screen.getByDisplayValue("Hello World")).toBeInTheDocument();
	});

	it("updates content when typed in", async () => {
		const user = userEvent.setup();
		renderEditor();
		const textarea = screen.getByTestId("editor-textarea");
		await user.type(textarea, " updated");
		expect(textarea).toHaveValue("Hello World updated");
	});

	it("triggers project export on hotkey (Mod+Shift+E)", async () => {
		const user = userEvent.setup();
		// userEvent might replace clipboard, so we spy on the current instance
		const writeTextSpy = vi.spyOn(navigator.clipboard, "writeText");

		renderEditor();

		await user.keyboard("{Meta>}{Shift>}e{/Shift}{/Meta}");

		await waitFor(() => {
			expect(exportProject).toHaveBeenCalledWith("project-1");
		});
		expect(writeTextSpy).toHaveBeenCalledWith("Exported Content");
	});

	it("triggers new scene creation on hotkey (Mod+Alt+N)", async () => {
		const user = userEvent.setup();
		renderEditor();

		await user.keyboard("{Meta>}{Alt>}n{/Alt}{/Meta}");

		await waitFor(() => {
			expect(createSceneInChapter).toHaveBeenCalled();
		});
	});

	it("renders empty state if no scene is selected", () => {
		currentActiveSceneId = null;
		renderEditor(mockStructure, null);

		expect(screen.queryByTestId("mock-text-editor")).not.toBeInTheDocument();
		expect(screen.getByTestId("writer-empty-state")).toBeInTheDocument();
	});

	it("renders StoryWizard or EmptyState if structure is empty", () => {
		renderEditor([], null);
		expect(screen.queryByTestId("mock-text-editor")).not.toBeInTheDocument();
		expect(screen.getByTestId("writer-empty-state")).toBeInTheDocument();
	});
});
