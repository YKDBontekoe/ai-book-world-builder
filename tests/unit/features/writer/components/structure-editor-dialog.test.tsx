import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { saveProjectStructure } from "@/features/writer/actions";
import { StructureEditorDialog } from "@/features/writer/components/structure-editor-dialog";

// Mock resize observer
global.ResizeObserver = class ResizeObserver {
	observe() {}
	unobserve() {}
	disconnect() {}
};

// Mock ScrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn();

// Mock DND kit to avoid complex setup
vi.mock("@dnd-kit/core", () => ({
	DndContext: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
	useSensor: vi.fn(),
	useSensors: vi.fn(),
	PointerSensor: vi.fn(),
	KeyboardSensor: vi.fn(),
	closestCenter: vi.fn(),
}));

vi.mock("@dnd-kit/sortable", () => ({
	SortableContext: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
	useSortable: () => ({
		attributes: {},
		listeners: {},
		setNodeRef: vi.fn(),
		transform: null,
		transition: null,
	}),
	verticalListSortingStrategy: {},
}));

vi.mock("@dnd-kit/utilities", () => ({
	CSS: {
		Transform: {
			toString: vi.fn(),
		},
	},
}));

// Mock Framer Motion to avoid animation issues
vi.mock("framer-motion", async () => {
	const actual = await vi.importActual<typeof import("framer-motion")>("framer-motion");
	return {
		...actual,
		motion: {
			div: ({ children, ...props }: React.ComponentProps<"div">) => <div {...props}>{children}</div>,
			span: ({ children, ...props }: React.ComponentProps<"span">) => <span {...props}>{children}</span>,
			// Add other elements if needed
		},
		AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
	};
});

// Mock Lucide icons
vi.mock("lucide-react", () => ({
	GripVertical: () => <span>Grip</span>,
	Trash2: () => <span>Trash</span>,
	Plus: () => <span>Plus</span>,
	X: () => <span>X</span>,
	Save: () => <span>Save</span>,
	FilePlus: () => <span>FilePlus</span>,
	FolderPlus: () => <span>FolderPlus</span>,
	Keyboard: () => <span>Keyboard</span>,
	LayoutTemplate: () => <span>LayoutTemplate</span>,
	Loader2: () => <span>Loader2</span>,
	Wand2: () => <span>Wand2</span>,
}));

// Mock server actions
vi.mock("@/features/writer/actions", () => ({
	saveProjectStructure: vi.fn(),
}));

describe("StructureEditorDialog", () => {
	const mockStructureText = `Chapter 1
  Scene 1`;

	beforeEach(() => {
		vi.clearAllMocks();
		// @ts-ignore - Bypass strict Result type check if needed
		vi.mocked(saveProjectStructure).mockResolvedValue({ success: true, data: { success: true } });
	});

	it("renders trigger button", () => {
		const onSave = vi.fn();
		render(
			<StructureEditorDialog
				currentStructure={mockStructureText}
				projectId="p1"
				onSave={onSave}
			>
				<button type="button">Open Editor</button>
			</StructureEditorDialog>,
		);

		expect(screen.getByText("Open Editor")).toBeInTheDocument();
	});

	it("opens dialog when trigger is clicked", async () => {
		const onSave = vi.fn();
		const user = userEvent.setup();
		render(
			<StructureEditorDialog
				currentStructure={mockStructureText}
				projectId="p1"
				onSave={onSave}
			>
				<button type="button">Open Editor</button>
			</StructureEditorDialog>,
		);

		await user.click(screen.getByText("Open Editor"));

		await waitFor(() => {
			expect(screen.getByText("Structure Editor")).toBeInTheDocument();
			const textarea = screen.getByRole("textbox");
			expect(textarea).toBeInTheDocument();
			expect(textarea).toHaveValue(mockStructureText);
		});
	});

	it("saves changes", async () => {
		const onSave = vi.fn();
		const user = userEvent.setup();
		render(
			<StructureEditorDialog
				currentStructure={mockStructureText}
				projectId="p1"
				onSave={onSave}
			>
				<button type="button">Open Editor</button>
			</StructureEditorDialog>,
		);

		await user.click(screen.getByText("Open Editor"));

		// Modify text
		await waitFor(() => {
			expect(screen.getByRole("textbox")).toBeInTheDocument();
		});
		const textarea = screen.getByRole("textbox");
		await user.clear(textarea);
		await user.type(textarea, "Updated Content");

		// Click Save
		await user.click(screen.getByText("Save Changes"));

		await waitFor(() => {
			expect(saveProjectStructure).toHaveBeenCalledWith({
				projectId: "p1",
				structureText: "Updated Content",
			});
			expect(onSave).toHaveBeenCalled();
		});
	});

	it("cancels changes", async () => {
		const onSave = vi.fn();
		const user = userEvent.setup();
		render(
			<StructureEditorDialog
				currentStructure={mockStructureText}
				projectId="p1"
				onSave={onSave}
			>
				<button type="button">Open Editor</button>
			</StructureEditorDialog>,
		);

		await user.click(screen.getByText("Open Editor"));

		// Modify text
		await waitFor(() => {
			expect(screen.getByRole("textbox")).toBeInTheDocument();
		});
		const textarea = screen.getByRole("textbox");
		await user.type(textarea, "Updated Content");

		// Click Cancel
		await user.click(screen.getByText("Cancel"));

		expect(saveProjectStructure).not.toHaveBeenCalled();
		expect(onSave).not.toHaveBeenCalled();
	});
});
