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

import { MetadataSection } from "@/components/generation/config/metadata-section";
import { TooltipProvider } from "@/components/ui/tooltip";

describe("MetadataSection", () => {
  afterEach(() => cleanup());

  const renderWithState = (initialSettings: Record<string, unknown>, onSettingChange: ReturnType<typeof vi.fn>) => {
    const Wrapper = () => {
      const [currentSettings, setCurrentSettings] = useState(initialSettings);

      const handleChange = (key: string, value: unknown) => {
        const nextSettings = { ...currentSettings, [key]: value };
        setCurrentSettings(nextSettings);
        onSettingChange(key, value);
      };

      return (
        <TooltipProvider>
          <MetadataSection settings={currentSettings} onSettingChange={handleChange} />
        </TooltipProvider>
      );
    };

    render(<Wrapper />);
  };

  it("updates metadata fields through callbacks", async () => {
    const onSettingChange = vi.fn();
    const user = userEvent.setup();

    renderWithState({ bookTitle: "Draft", authorName: "Test" }, onSettingChange);

    await user.type(screen.getByLabelText("Book Title"), " Title");
    expect(onSettingChange).toHaveBeenLastCalledWith("bookTitle", "Draft Title");

    await user.clear(screen.getByLabelText("Author Name"));
    await user.type(screen.getByLabelText("Author Name"), "Alex Writer");
    expect(onSettingChange).toHaveBeenLastCalledWith("authorName", "Alex Writer");

    await user.selectOptions(screen.getByLabelText("Genre"), "fantasy");
    expect(onSettingChange).toHaveBeenLastCalledWith("genre", "fantasy");
  });
});
