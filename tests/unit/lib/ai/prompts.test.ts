import { describe, expect, it } from "vitest";
import { systemPrompt, RequestHints } from "../../../../lib/ai/prompts";

describe("systemPrompt", () => {
  const mockHints: RequestHints = {
    latitude: 0,
    longitude: 0,
    city: "Test City",
    country: "Test Country",
  };

  it("should generate a regular prompt for non-story mode", () => {
    const prompt = systemPrompt({
      selectedChatModel: "gpt-4o",
      requestHints: mockHints,
      hasProjectContext: false,
      usesStoryTools: false,
    });

    expect(prompt).toContain("You are a friendly assistant");
    expect(prompt).toContain("Test City");
    expect(prompt).toContain("Artifacts is a special user interface");
    expect(prompt).not.toContain("You are a narrative-focused writing assistant");
  });

  it("should generate a storytelling prompt for story mode (hasProjectContext)", () => {
    const prompt = systemPrompt({
      selectedChatModel: "gpt-4o",
      requestHints: mockHints,
      hasProjectContext: true,
      usesStoryTools: false,
    });

    expect(prompt).toContain("You are a narrative-focused writing assistant");
    expect(prompt).toContain("Project lore context is provided below");
  });

  it("should generate a storytelling prompt for story mode (usesStoryTools)", () => {
    const prompt = systemPrompt({
      selectedChatModel: "gpt-4o",
      requestHints: mockHints,
      hasProjectContext: false,
      usesStoryTools: true,
    });

    expect(prompt).toContain("You are a narrative-focused writing assistant");
    expect(prompt).toContain("When lore context is provided, keep continuity");
  });

  it("should exclude artifacts prompt for reasoning models", () => {
    const prompt = systemPrompt({
      selectedChatModel: "chat-model-reasoning",
      requestHints: mockHints,
      hasProjectContext: false,
      usesStoryTools: false,
    });

    expect(prompt).not.toContain("Artifacts is a special user interface");
  });
});
