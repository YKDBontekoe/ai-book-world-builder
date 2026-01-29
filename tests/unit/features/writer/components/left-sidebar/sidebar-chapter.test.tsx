import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
	beforeEach,
	type ComponentProps,
	describe,
	expect,
	it,
	type PropsWithChildren,
	vi,
} from "vitest";
import { Accordion } from "@/components/atoms/accordion";
import { SidebarChapter } from "@/features/writer/components/left-sidebar/sidebar-chapter";
import type { ChapterWithScenes } from "@/lib/types";

// Mock ContextMenu to avoid Radix UI interaction issues in JSDOM
vi.mock("@/components/atoms/context-menu", () => ({
	ContextMenu: ({ children }: PropsWithChildren) => <div>{children}</div>,
	ContextMenuTrigger: ({ children }: PropsWithChildren) => (
		<div data-testid="ctx-trigger">{children}</div>
	),
	ContextMenuContent: ({ children }: PropsWithChildren) => (
		<div data-testid="ctx-content">{children}</div>
	),
	ContextMenuItem: ({
		children,
		onClick,
	}: PropsWithChildren<{ onClick?: () => void }>) => (
		<button type="button" onClick={onClick}>
			{children}
		</button>
	),
	ContextMenuSeparator: () => <hr />,
}));

// Mock SceneItem to avoid complexity
vi.mock("@/features/writer/components/left-sidebar/scene-item", () => ({
	SceneItem: ({
		scene,
		onSelect,
		onRename,
		onDelete,
		isSelected,
		onToggleSelect,
	}: {
		scene: { id: string; title: string };
		onSelect: (id: string) => void;
		onRename: (id: string, name: string) => void;
		onDelete: (id: string) => void;
		isSelected: boolean;
		onToggleSelect: (id: string) => void;
	}) => (
		<div data-testid={`scene-item-${scene.id}`}>
			<span>{scene.title}</span>
			<button type="button" onClick={() => onSelect(scene.id)}>
				Select
			</button>
			<button type="button" onClick={() => onRename(scene.id, "New Title")}>
				Rename
			</button>
			<button type="button" onClick={() => onDelete(scene.id)}>
				Delete
			</button>
			<button type="button" onClick={() => onToggleSelect(scene.id)}>
				Toggle Select
			</button>
			{isSelected && <span>Selected</span>}
		</div>
	),
}));

// Mock Lucide icons
vi.mock("lucide-react", () => ({
	FilePlus2: () => <span data-testid="icon-file-plus" />,
	Pencil: () => <span data-testid="icon-pencil" />,
	Plus: () => <span data-testid="icon-plus" />,
	Sparkles: () => <span data-testid="icon-sparkles" />,
	Trash2: () => <span data-testid="icon-trash" />,
	ChevronDown: () => <span data-testid="icon-chevron-down" />,
}));

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn();

const renderComponent = (props: ComponentProps<typeof SidebarChapter>) => {
	return render(
		<Accordion type="multiple" defaultValue={[props.chapter.id]}>
			<SidebarChapter {...props} />
		</Accordion>,
	);
};

describe("SidebarChapter", () => {
	const mockScenes: ChapterWithScenes["scenes"] = [
		{
			id: "s1",
			title: "Scene 1",
			sequence: 1,
			content: "",
			status: "drafted",
			chapterId: "c1",
			projectId: "p1",
			createdAt: new Date(),
			updatedAt: new Date(),
			wordCount: 0,
		},
		{
			id: "s2",
			title: "Scene 2",
			sequence: 2,
			content: "",
			status: "drafted",
			chapterId: "c1",
			projectId: "p1",
			createdAt: new Date(),
			updatedAt: new Date(),
			wordCount: 0,
		},
	];

	const mockChapter: ChapterWithScenes = {
		id: "c1",
		title: "Chapter 1",
		scenes: mockScenes,
		sequence: 1,
		status: "planned",
		projectId: "p1",
		outlineId: "o1",
		volumeId: "v1",
		createdAt: new Date(),
		updatedAt: new Date(),
		notes: null,
	};

	const defaultProps = {
		chapter: mockChapter,
		activeSceneId: null,
		isGenerating: false,
		readOnly: false,
		isSelectionMode: false,
		selectedSceneIds: new Set<string>(),
		onSceneSelect: vi.fn(),
		onGenerateNextScene: vi.fn(),
		onCreateSceneManually: vi.fn(),
		onRenameScene: vi.fn(),
		onDeleteScene: vi.fn(),
		onToggleSceneSelect: vi.fn(),
		onRenameChapter: vi.fn(),
		onDeleteChapter: vi.fn(),
	};

	beforeEach(() => {
		vi.resetAllMocks();
	});

	it("renders chapter title and scenes", () => {
		renderComponent(defaultProps);
		expect(screen.getByText("Chapter 1")).toBeInTheDocument();
		expect(screen.getByText("Scene 1")).toBeInTheDocument();
		expect(screen.getByText("Scene 2")).toBeInTheDocument();
	});

	it("calls onCreateSceneManually when Add Scene button is clicked", async () => {
		const user = userEvent.setup();
		renderComponent(defaultProps);
		// Use strict match to avoid matching "Add Scene Manually" from context menu
		const addButton = screen.getByRole("button", { name: /^Add Scene$/i });
		await user.click(addButton);
		expect(defaultProps.onCreateSceneManually).toHaveBeenCalledWith("c1");
	});

	it("renders context menu items and handles actions", async () => {
		const user = userEvent.setup();
		renderComponent(defaultProps);

		// With mocked ContextMenu, items are always visible
		expect(screen.getByText("Generate New Scene")).toBeVisible();
		expect(screen.getByText("Add Scene Manually")).toBeVisible();
		expect(screen.getByText("Rename Chapter")).toBeVisible();
		expect(screen.getByText("Delete Chapter")).toBeVisible();

		// Click Generate
		await user.click(screen.getByText("Generate New Scene"));
		expect(defaultProps.onGenerateNextScene).toHaveBeenCalledWith("c1");
	});

	it("handles renaming chapter via context menu", async () => {
		const user = userEvent.setup();
		renderComponent(defaultProps);

		// Click Rename (mocked as button)
		await user.click(screen.getByRole("button", { name: /Rename Chapter/i }));

		// Check input appears
		const input = await screen.findByLabelText("Chapter title");
		expect(input).toBeInTheDocument();
		expect(input).toHaveValue("Chapter 1");

		// Type new name
		await fireEvent.change(input, { target: { value: "New Chapter Name" } });

		// Submit (blur or enter)
		await fireEvent.blur(input);

		expect(defaultProps.onRenameChapter).toHaveBeenCalledWith(
			"c1",
			"New Chapter Name",
		);
	});

	it("cancels renaming on Escape", async () => {
		const user = userEvent.setup();
		renderComponent(defaultProps);

		// Enter edit mode
		await user.click(screen.getByRole("button", { name: /Rename Chapter/i }));

		const input = await screen.findByLabelText("Chapter title");
		await fireEvent.change(input, { target: { value: "Changed" } });

		await user.keyboard("{Escape}");

		// Should revert to text
		expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
		expect(screen.getByText("Chapter 1")).toBeInTheDocument();
		expect(defaultProps.onRenameChapter).not.toHaveBeenCalled();
	});

	it("handles delete chapter", async () => {
		const user = userEvent.setup();
		renderComponent(defaultProps);

		await user.click(screen.getByRole("button", { name: /Delete Chapter/i }));

		expect(defaultProps.onDeleteChapter).toHaveBeenCalledWith("c1");
	});

	it("disables actions when readOnly is true", async () => {
		const user = userEvent.setup();
		renderComponent({ ...defaultProps, readOnly: true });

		// With mocked context menu, we can't check 'not.toBeInTheDocument' based on trigger interaction
		// But we can check if buttons are enabled/disabled if we passed that prop to mocked component?
		// The mocked ContextMenuTrigger doesn't enforce disabled logic on content visibility.
		// However, Add Scene button should be disabled.

		const addButton = screen.getByRole("button", { name: /^Add Scene$/i });
		expect(addButton).toBeDisabled();
	});
});
