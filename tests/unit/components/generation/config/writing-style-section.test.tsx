import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/components/ui/select", () => {
  const extractLabel = (node: any): string => {
    if (Array.isArray(node)) return node.map(extractLabel).join(" ").trim();
    if (typeof node === "string") return node;
    if (node?.props?.children) return extractLabel(node.props.children);
    return "";
  };

  const Select = ({ value, onValueChange, id, children, ...props }: any) => (
    <select
      id={id}
      aria-label={props["aria-label"]}
      value={value ?? ""}
      onChange={(event) => onValueChange?.(event.target.value)}
    >
      {children}
    </select>
  );

  const SelectTrigger = ({ children }: any) => <>{children}</>;
  const SelectContent = ({ children }: any) => <>{children}</>;
  const SelectItem = ({ children, value }: any) => {
    return <option value={value}>{extractLabel(children)}</option>;
  };
  const SelectValue = ({ placeholder }: any) => (
    <option value="" disabled hidden>
      {placeholder}
    </option>
  );

  return { Select, SelectTrigger, SelectContent, SelectItem, SelectValue };
});

import { WritingStyleSection } from "@/components/generation/config/writing-style-section";
import { TooltipProvider } from "@/components/ui/tooltip";

describe("WritingStyleSection", () => {
  afterEach(() => cleanup());

  const renderWithState = (
    initialSettings: Record<string, unknown>,
    onSettingChange: ReturnType<typeof vi.fn>,
    tip?: string,
  ) => {
    const Wrapper = () => {
      const [currentSettings, setCurrentSettings] = useState(initialSettings);

      const handleChange = (key: string, value: unknown) => {
        const nextSettings = { ...currentSettings, [key]: value };
        setCurrentSettings(nextSettings);
        onSettingChange(key, value);
      };

      return (
        <TooltipProvider>
          <WritingStyleSection settings={currentSettings} onSettingChange={handleChange} tip={tip} />
        </TooltipProvider>
      );
    };

    render(<Wrapper />);
  };

  it("exposes preset selection changes", async () => {
    const onSettingChange = vi.fn();
    const user = userEvent.setup();

    renderWithState({ writingStylePreset: "hemingway" }, onSettingChange);

    await user.selectOptions(screen.getByLabelText("Style Preset"), "custom");

    expect(onSettingChange).toHaveBeenCalledWith("writingStylePreset", "custom");
  });

  it("renders custom inputs and forwards updates", async () => {
    const onSettingChange = vi.fn();
    const user = userEvent.setup();

    renderWithState(
      { writingStylePreset: "custom", customStyleDescription: "Moody", authorInspirations: ["A"] },
      onSettingChange,
      "Describe the tone you want",
    );

    const [customDescription] = screen.getAllByLabelText("Custom Style Description");

    await user.type(customDescription, " and atmospheric");
    expect(onSettingChange).toHaveBeenLastCalledWith("customStyleDescription", "Moody and atmospheric");

    await user.clear(screen.getByLabelText("Author Inspirations"));
    await user.type(screen.getByLabelText("Author Inspirations"), "Le Guin, Butler");
    expect(onSettingChange).toHaveBeenLastCalledWith("authorInspirations", ["LeGuin", "Butler"]);
  });
});
