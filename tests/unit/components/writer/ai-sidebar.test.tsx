import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { AISidebar } from "@/components/writer/tools/ai-sidebar";
import * as writerAI from "@/lib/ai/writer";

// Mock the AI functions
vi.mock("@/lib/ai/writer", () => ({
  continueWriting: vi.fn(),
  generateIdeas: vi.fn(),
}));

describe("AISidebar", () => {
  const mockOnInsertText = vi.fn();

  it("renders correctly", () => {
    render(
      <AISidebar
        context="Chapter 1"
        currentText="Once upon a time..."
        onInsertText={mockOnInsertText}
      />
    );

    expect(screen.getByText("AI Assistant")).toBeDefined();
    expect(screen.getByText("Continue Writing")).toBeDefined();
    expect(screen.getByText("Generate Ideas")).toBeDefined();
  });

  it("calls continueWriting when button is clicked", async () => {
    (writerAI.continueWriting as any).mockResolvedValue({ text: " and they lived happily ever after." });

    render(
      <AISidebar
        context="Chapter 1"
        currentText="Once upon a time..."
        onInsertText={mockOnInsertText}
      />
    );

    const buttons = screen.getAllByText("Continue Writing");
    // Ensure we are clicking the one in Quick Actions, though standard button layout implies uniqueness or specific role
    // Since getByText matches the span/content inside, and there might be tooltips or others, getAll is safer.
    // However, looking at the DOM dump, it seems unique enough. Let's try getAll and pick first.
    fireEvent.click(buttons[0]);

    // Should call the AI function
    expect(writerAI.continueWriting).toHaveBeenCalledWith("Chapter 1", "Once upon a time...");
  });

  it("calls generateIdeas when button is clicked", async () => {
    (writerAI.generateIdeas as any).mockResolvedValue({ ideas: "1. Dragon appears\n2. Hero runs away" });

    render(
      <AISidebar
        context="Chapter 1"
        currentText="Once upon a time..."
        onInsertText={mockOnInsertText}
      />
    );

    const buttons = screen.getAllByText("Generate Ideas");
    fireEvent.click(buttons[0]);

    expect(writerAI.generateIdeas).toHaveBeenCalledWith("Chapter 1", "Once upon a time...");
  });
});
