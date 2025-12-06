import { expect, test } from "@playwright/test";

import { systemPrompt } from "@/lib/ai/prompts";

const requestHints = {
  latitude: 37.7749,
  longitude: -122.4194,
  city: "San Francisco",
  country: "USA",
};

test.describe("system prompt persona", () => {
  test("uses storytelling persona when project context is available", () => {
    const prompt = systemPrompt({
      selectedChatModel: "chat-model",
      requestHints,
      hasProjectContext: true,
    });

    expect(prompt).toContain("narrative-focused writing assistant");
    expect(prompt).toContain("Project lore context is provided below");
    expect(prompt).toContain("Artifacts is a special user interface mode");
  });

  test("keeps story persona for reasoning models without artifact guidance", () => {
    const prompt = systemPrompt({
      selectedChatModel: "chat-model-reasoning",
      requestHints,
      usesStoryTools: true,
    });

    expect(prompt).toContain("narrative-focused writing assistant");
    expect(prompt).toContain("When lore context is provided");
    expect(prompt).not.toContain("Artifacts is a special user interface mode");
  });
});
