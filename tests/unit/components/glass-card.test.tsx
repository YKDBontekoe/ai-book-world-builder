import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { GlassCard } from "../../../components/ui/glass-card";

describe("GlassCard", () => {
  it("renders correctly with default props", () => {
    const { container } = render(<GlassCard>Test Content</GlassCard>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain("relative");
    expect(card.className).toContain("rounded-xl");
  });

  it("renders correctly with liquid variant", () => {
    const { container } = render(<GlassCard variant="liquid">Liquid Content</GlassCard>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain("bg-glass/50");
  });

  it("renders correctly with interactive prop", () => {
    const { container } = render(<GlassCard interactive>Interactive Content</GlassCard>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain("cursor-pointer");
  });
});
