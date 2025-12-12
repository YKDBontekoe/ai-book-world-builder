import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ModelSelection } from "@/components/generation/config/model-selection";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { ChatModel } from "@/lib/ai/models";

const models: ChatModel[] = [
  {
    id: "model-1",
    name: "Model One",
    provider: "Test",
    gatewayId: "test/model-one",
    description: "First model",
    supportsImages: true,
    pricing: { input: "1", output: "2" },
  },
  {
    id: "model-2",
    name: "Model Two",
    provider: "Test",
    gatewayId: "test/model-two",
    description: "Second model",
    supportsImages: false,
    pricing: { input: "0.5", output: "1" },
  },
];

describe("ModelSelection", () => {
  it("renders options and triggers callback on selection", async () => {
    const onModelChange = vi.fn();
    const user = userEvent.setup();

    render(
      <TooltipProvider>
        <ModelSelection
          label="Writer Model"
          task="writing"
          models={models}
          selectedModelId="model-1"
          onModelChange={onModelChange}
        />
      </TooltipProvider>,
    );

    expect(screen.getByRole("button", { name: /Model One/ })).toHaveAttribute("aria-pressed", "true");

    await user.click(screen.getByRole("button", { name: /Model Two/ }));

    expect(onModelChange).toHaveBeenCalledWith("model-2");
  });
});
