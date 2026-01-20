import { render, screen, fireEvent } from "@testing-library/react";
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
    ScrollArea: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe("StoryWizard", () => {
    it("renders story templates", () => {
        render(<StoryWizard projectId="test-project" onComplete={vi.fn()} />);

        expect(screen.getByText("The Hero's Journey")).toBeInTheDocument();
        expect(screen.getByText("Cyberpunk Noir")).toBeInTheDocument();
    });

    it("populates prompt and style when a template is clicked", () => {
        render(<StoryWizard projectId="test-project" onComplete={vi.fn()} />);

        // Find the button by part of its text content.
        // Note: The button contains multiple text nodes (Label, Description),
        // so getByRole with name might be tricky if the name includes all text.
        // We can find by text "The Hero's Journey" and find the closest button.
        const templateLabel = screen.getByText("The Hero's Journey");
        const templateButton = templateLabel.closest("button");

        expect(templateButton).toBeInTheDocument();

        if (templateButton) {
            fireEvent.click(templateButton);
        }

        const promptInput = screen.getByPlaceholderText(/e.g. A cyberpunk detective/i) as HTMLTextAreaElement;
        expect(promptInput.value).toContain("A young farm boy discovers he is the heir");
    });
});
