import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import React from "react";
import { PowerDockInput } from "@/features/writer/components/power-dock/power-dock-input";

// Mock dependencies
vi.mock("@/components/atoms/textarea", () => ({
	Textarea: (props: any) => (
		<textarea
			data-testid="input-textarea"
			{...props}
		/>
	),
}));

vi.mock("@/components/atoms/dropdown-menu", () => ({
	DropdownMenu: ({ children }: any) => <div>{children}</div>,
	DropdownMenuTrigger: ({ children }: any) => <div>{children}</div>,
	DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
	DropdownMenuItem: ({ children }: any) => <div>{children}</div>,
	DropdownMenuLabel: ({ children }: any) => <div>{children}</div>,
	DropdownMenuSeparator: () => <div />,
}));

vi.mock("@/features/writer/components/power-dock/power-dock-suggestions", () => ({
	PowerDockSuggestions: ({ items, onSelect }: any) => (
		<div data-testid="suggestions">
			{items.map((item: any) => (
				<button key={item.id} onClick={() => onSelect(item)}>
					{item.label}
				</button>
			))}
		</div>
	),
}));

// Mock framer-motion
vi.mock("framer-motion", () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock icons to avoid issues
vi.mock("lucide-react", async () => {
    return {
        Clock: () => <span />,
        FileText: () => <span />,
        HistoryIcon: () => <span />,
        MapPin: () => <span />,
        Send: () => <span />,
        Sparkles: () => <span />,
        Trash2: () => <span />,
        User: () => <span />,
        X: () => <span />,
        Feather: () => <span />,
        Edit: () => <span />,
        Expand: () => <span />,
        BookOpenCheck: () => <span />,
        AlertTriangle: () => <span />,
        MessageSquareText: () => <span />,
        Globe: () => <span />,
        Search: () => <span />,
        Download: () => <span />,
    }
});

describe("PowerDockInput", () => {
	const defaultProps = {
		mode: "input" as const,
		selectedTool: "write" as const,
		input: "",
		isProcessing: false,
		setInput: vi.fn(),
		onExecute: vi.fn(),
		onReset: vi.fn(),
		onClearHistory: vi.fn(),
		getHistory: vi.fn().mockReturnValue([]),
		entities: [
			{ id: "e1", name: "John Doe", kind: "character", summary: "" },
			{ id: "e2", name: "New York", kind: "location", summary: "" },
		],
		onExport: vi.fn(),
	};

	it("replaces entity trigger correctly when cursor is at end", async () => {
        const setInputSpy = vi.fn();
        const Wrapper = () => {
            const [val, setVal] = React.useState("");
            const handleSetInput = (v: string) => {
                setVal(v);
                setInputSpy(v);
            };
            return <PowerDockInput {...defaultProps} input={val} setInput={handleSetInput} />;
        };

		render(<Wrapper />);

        const textarea = screen.getByTestId("input-textarea");
        const user = userEvent.setup();

        await user.type(textarea, "Hello @Jo");

        // Verify suggestions appear
        expect(screen.getByTestId("suggestions")).toBeInTheDocument();
        expect(screen.getByText("John Doe")).toBeInTheDocument();

        // Click suggestion
        await user.click(screen.getByText("John Doe"));

        // Expect replacement: "Hello " + "John Doe" + " " + "" -> "Hello John Doe "
        expect(setInputSpy).toHaveBeenLastCalledWith("Hello John Doe ");
	});

    it("replaces entity trigger correctly when cursor is immediately after @", async () => {
        const setInputSpy = vi.fn();
        const Wrapper = () => {
            const [val, setVal] = React.useState("");
            const handleSetInput = (v: string) => {
                setVal(v);
                setInputSpy(v);
            };
            return <PowerDockInput {...defaultProps} input={val} setInput={handleSetInput} />;
        };

		render(<Wrapper />);

        const textarea = screen.getByTestId("input-textarea");
        const user = userEvent.setup();

        await user.type(textarea, "Hello @");

        expect(screen.getByText("John Doe")).toBeInTheDocument();
        await user.click(screen.getByText("John Doe"));

        expect(setInputSpy).toHaveBeenLastCalledWith("Hello John Doe ");
    });

    it("replaces entity trigger correctly when cursor is in middle of text", async () => {
        const setInputSpy = vi.fn();
        const Wrapper = () => {
            const [val, setVal] = React.useState("");
            const handleSetInput = (v: string) => {
                setVal(v);
                setInputSpy(v);
            };
            return <PowerDockInput {...defaultProps} input={val} setInput={handleSetInput} />;
        };

		render(<Wrapper />);

        const textarea = screen.getByTestId("input-textarea") as HTMLTextAreaElement;
        const user = userEvent.setup();

        const inputVal = "Hello @Jo world";

        // Use fireEvent for precise control over value update relative to cursor
        // fireEvent.change triggers the onChange handler
        const { fireEvent } = await import("@testing-library/react");
        // Pass selectionStart in target options to ensure it overrides any side effect of setting value
        fireEvent.change(textarea, { target: { value: inputVal, selectionStart: 9 } });

        expect(screen.getByText("John Doe")).toBeInTheDocument();
        await user.click(screen.getByText("John Doe"));

        // "Hello " + "John Doe" + " " + " world"
        expect(setInputSpy).toHaveBeenLastCalledWith("Hello John Doe  world");
    });
});
