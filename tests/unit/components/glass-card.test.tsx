import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GlassCard } from "@/components/molecules/glass-card";

describe("GlassCard", () => {
	it("renders correctly with default props", () => {
		const { container } = render(<GlassCard>Test Content</GlassCard>);
		const card = container.firstChild as HTMLElement;
		expect(card.className).toContain("relative");
		expect(card.className).toContain("rounded-lg");
	});

	it("renders correctly with liquid variant", () => {
		const { container } = render(
			<GlassCard variant="liquid">Liquid Content</GlassCard>,
		);
		const card = container.firstChild as HTMLElement;
		expect(card.className).toContain("bg-glass/50");
	});

	it("renders correctly with interactive prop", () => {
		const { container } = render(
			<GlassCard interactive>Interactive Content</GlassCard>,
		);
		const card = container.firstChild as HTMLElement;
		expect(card.className).toContain("cursor-pointer");
	});

	it("renders correctly with rounded 2xl", () => {
		const { container } = render(
			<GlassCard rounded="2xl">Rounded Content</GlassCard>,
		);
		const card = container.firstChild as HTMLElement;
		expect(card.className).toContain("rounded-2xl");
	});
});
