import { fireEvent, render, screen } from "@testing-library/react";
import { Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { StoryWizard } from "@/features/writer/components/story-wizard";

// Mock server actions
vi.mock("@/app/actions/story-generation", () => ({
	generateBookPlan: vi.fn(),
	createBookFromPlan: vi.fn(),
}));

// Mock toast
vi.mock("sonner", () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
		loading: vi.fn(),
	},
}));

// Mock components that might be problematic
vi.mock("@/components/atoms/scroll-area", () => ({
	ScrollArea: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

// Mock Radix UI Select properly since it's hard to test in JSDOM without pointer events
// We'll trust the underlying component or use a simpler mock if needed,
// but often just finding the trigger text works.
// However, the `Select` component in this project likely uses Radix.

describe("StoryWizard", () => {
	it("renders all story templates", () => {
		render(<StoryWizard projectId="test-project" onComplete={vi.fn()} />);

		expect(screen.getByText("The Hero's Journey")).toBeInTheDocument();
		expect(screen.getByText("Cyberpunk Noir")).toBeInTheDocument();
		expect(screen.getByText("Whodunit")).toBeInTheDocument();
		expect(screen.getByText("Space Opera")).toBeInTheDocument();
	});

	it("populates prompt and style when a template is clicked", () => {
		render(<StoryWizard projectId="test-project" onComplete={vi.fn()} />);

		const templateLabel = screen.getByText("The Hero's Journey");
		const templateButton = templateLabel.closest("button");

		expect(templateButton).toBeInTheDocument();

		if (templateButton) {
			fireEvent.click(templateButton);
		}

		// Check Prompt
		const promptInput = screen.getByPlaceholderText(
			/e.g. A cyberpunk detective/i,
		) as HTMLTextAreaElement;
		expect(promptInput.value).toContain(
			"A young farm boy discovers he is the heir",
		);

		// Check Style dropdowns.
		// The Select component usually renders the selected value in the trigger.
		// We can search for the text of the expected values.

		// For "The Hero's Journey":
		// Genre: Fantasy
		// POV: Third Person Limited
		// Tone: Epic

		// We look for these texts in the document. Since they might be in the SelectTrigger.
		// Note: Before selection, they might have default values (General Fiction, Third Person, Neutral).

		expect(screen.getByText("Fantasy")).toBeInTheDocument();
		expect(screen.getByText("Third Person Limited")).toBeInTheDocument();
		expect(screen.getByText("Epic")).toBeInTheDocument();
	});

	it("renders and applies custom templates via props", () => {
		const customTemplate = {
			label: "Custom Template",
			description: "A custom template for testing",
			prompt: "Custom prompt text",
			style: {
				genre: "Mystery",
				pov: "First Person",
				tone: "Dark",
			},
			icon: Sparkles,
		};

		render(
			<StoryWizard
				projectId="test-project"
				onComplete={vi.fn()}
				templates={[customTemplate]}
			/>,
		);

		// Assert custom template is rendered
		const customLabel = screen.getByText("Custom Template");
		expect(customLabel).toBeInTheDocument();
		// Assert default templates are NOT rendered
		expect(screen.queryByText("The Hero's Journey")).not.toBeInTheDocument();

		// Click the custom template
		const templateButton = customLabel.closest("button");
		expect(templateButton).toBeInTheDocument();

		if (templateButton) {
			fireEvent.click(templateButton);
		}

		// Check Prompt
		const promptInput = screen.getByPlaceholderText(
			/e.g. A cyberpunk detective/i,
		) as HTMLTextAreaElement;
		expect(promptInput.value).toBe("Custom prompt text");

		// Check Style dropdowns
		expect(screen.getByText("Mystery")).toBeInTheDocument();
		expect(screen.getByText("First Person")).toBeInTheDocument();
		expect(screen.getByText("Dark")).toBeInTheDocument();
	});
});
