import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { StructureEditorDialog } from "@/features/writer/components/structure-editor-dialog";
import { saveProjectStructure } from "@/features/writer/actions";

// Mock the server action
vi.mock("@/features/writer/actions", () => ({
	saveProjectStructure: vi.fn(),
}));

describe("StructureEditorDialog", () => {
	const projectId = "project-123";
	const currentStructure = "Chapter 1: Start\n  Scene 1: Intro";
	const onSave = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("renders trigger button", () => {
		render(
			<StructureEditorDialog
				projectId={projectId}
				currentStructure={currentStructure}
				onSave={onSave}
			>
				<button>Open Editor</button>
			</StructureEditorDialog>,
		);

		expect(screen.getByRole("button", { name: "Open Editor" })).toBeInTheDocument();
	});

	it("opens dialog and shows content", async () => {
		const user = userEvent.setup();
		render(
			<StructureEditorDialog
				projectId={projectId}
				currentStructure={currentStructure}
				onSave={onSave}
			>
				<button>Open Editor</button>
			</StructureEditorDialog>,
		);

		await user.click(screen.getByRole("button", { name: "Open Editor" }));

		expect(screen.getByRole("dialog", { name: "Structure Editor" })).toBeInTheDocument();
		const textarea = screen.getByRole("textbox");
		expect(textarea).toHaveValue(currentStructure);
	});

	it("edits text and saves", async () => {
		const user = userEvent.setup();
		(saveProjectStructure as any).mockResolvedValue({ success: true });

		render(
			<StructureEditorDialog
				projectId={projectId}
				currentStructure={currentStructure}
				onSave={onSave}
			>
				<button>Open Editor</button>
			</StructureEditorDialog>,
		);

		await user.click(screen.getByRole("button", { name: "Open Editor" }));

		const textarea = screen.getByRole("textbox");
		await user.type(textarea, "\n  Scene 2: New Scene");

		await user.click(screen.getByRole("button", { name: "Save Changes" }));

		expect(saveProjectStructure).toHaveBeenCalledWith({
			projectId,
			structureText: expect.stringContaining("Scene 2: New Scene"),
		});

		await waitFor(() => {
            expect(onSave).toHaveBeenCalled();
        });

        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
	});

	it("handles save error", async () => {
		const user = userEvent.setup();
		(saveProjectStructure as any).mockResolvedValue({ success: false, error: "Save failed" });

		render(
			<StructureEditorDialog
				projectId={projectId}
				currentStructure={currentStructure}
				onSave={onSave}
			>
				<button>Open Editor</button>
			</StructureEditorDialog>,
		);

		await user.click(screen.getByRole("button", { name: "Open Editor" }));

		await user.click(screen.getByRole("button", { name: "Save Changes" }));

		expect(saveProjectStructure).toHaveBeenCalled();
		expect(onSave).not.toHaveBeenCalled();
        // Dialog should stay open
        expect(screen.getByRole("dialog")).toBeInTheDocument();
	});

    it("toggles preview", async () => {
        const user = userEvent.setup();
		render(
			<StructureEditorDialog
				projectId={projectId}
				currentStructure={currentStructure}
				onSave={onSave}
			>
				<button>Open Editor</button>
			</StructureEditorDialog>,
		);

		await user.click(screen.getByRole("button", { name: "Open Editor" }));

        // Toggle Preview
        const previewButton = screen.getByRole("button", { name: "Toggle Preview" });
        await user.click(previewButton);

        expect(screen.getByText("Structure Preview")).toBeInTheDocument();
        expect(screen.getByText("Chapter 1: Start")).toBeInTheDocument();
    });

    it("uses smart format", async () => {
        const user = userEvent.setup();
        const messyStructure = "Chapter 1\nScene A";
		render(
			<StructureEditorDialog
				projectId={projectId}
				currentStructure={messyStructure}
				onSave={onSave}
			>
				<button>Open Editor</button>
			</StructureEditorDialog>,
		);

		await user.click(screen.getByRole("button", { name: "Open Editor" }));

        const formatButton = screen.getByRole("button", { name: "Smart Format" });
        await user.click(formatButton);

        // Smart format output depends on the util.
        expect(screen.getByDisplayValue(/Chapter 1: Untitled Chapter/)).toBeInTheDocument();
        expect(screen.getByDisplayValue(/Scene 1: A/)).toBeInTheDocument();
    });
});
