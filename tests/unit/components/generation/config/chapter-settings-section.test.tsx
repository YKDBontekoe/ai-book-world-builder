import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/components/ui/slider", () => ({
  Slider: ({ value, onValueChange, min, max, step, id, ...props }: any) => (
    <input
      type="range"
      id={id}
      aria-label={props["aria-label"]}
      min={min}
      max={max}
      step={step}
      value={value?.[0] ?? 0}
      onChange={(event) => onValueChange?.([Number(event.target.value)])}
    />
  ),
}));

import { ChapterSettingsSection } from "@/components/generation/config/chapter-settings-section";
import { TooltipProvider } from "@/components/ui/tooltip";

const renderSection = (onSettingChange = vi.fn()) => {
  const Wrapper = () => {
    const [settings, setSettings] = useState({
      totalChapters: 5,
      pagesPerChapter: 8,
      revisionRounds: 1,
    });

    const handleChange = (key: string, value: number) => {
      const nextSettings = { ...settings, [key]: value };
      setSettings(nextSettings);
      onSettingChange(key, value);
    };

    return (
      <TooltipProvider>
        <ChapterSettingsSection settings={settings} onSettingChange={handleChange} />
      </TooltipProvider>
    );
  };

  render(<Wrapper />);
};

describe("ChapterSettingsSection", () => {
  afterEach(() => cleanup());

  it("calls change handler when sliders move", async () => {
    const onSettingChange = vi.fn();
    const user = userEvent.setup();

    renderSection(onSettingChange);

    const chaptersSlider = screen.getByRole("slider", { name: "Number of Chapters" });
    fireEvent.change(chaptersSlider, { target: { value: 6 } });
    expect(onSettingChange).toHaveBeenCalledWith("totalChapters", 6);

    const pagesSlider = screen.getByRole("slider", { name: "Pages per Chapter" });
    fireEvent.change(pagesSlider, { target: { value: 9 } });
    expect(onSettingChange).toHaveBeenCalledWith("pagesPerChapter", 9);

    const revisionsSlider = screen.getByRole("slider", { name: "Revision Rounds" });
    fireEvent.change(revisionsSlider, { target: { value: 2 } });
    expect(onSettingChange).toHaveBeenCalledWith("revisionRounds", 2);
  });
});
