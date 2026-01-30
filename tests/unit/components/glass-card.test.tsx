import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { GlassCard } from "@/components/molecules/glass-card";

describe("GlassCard", () => {
	it("renders correctly with default props", () => {
		const { container } = render(<GlassCard>Test Content</GlassCard>);
		const card = container.firstChild as HTMLElement;
		expect(card.className).toContain("relative");
		expect(card.className).toContain("rounded-2xl");
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

	it("should have no accessibility violations", async () => {
		const { container } = render(<GlassCard>Content</GlassCard>);
		const results = await axe(container);
		expect(results.violations).toEqual([]);
	});

	it("should be accessible when interactive", async () => {
		const { container } = render(
			<GlassCard interactive aria-label="Interactive Card">
				Content
			</GlassCard>,
		);
		const results = await axe(container);
		expect(results.violations).toEqual([]);
	});

	it("should handle keyboard interactions when interactive", () => {
		const handleClick = vi.fn();
		render(
			<GlassCard interactive onClick={handleClick} data-testid="card">
				Content
			</GlassCard>,
		);

		const card = screen.getByTestId("card");

		// Check role and tabIndex
		expect(card.getAttribute("role")).toBe("button");
		expect(card.getAttribute("tabIndex")).toBe("0");

		fireEvent.keyDown(card, { key: "Enter" });
		expect(handleClick).toHaveBeenCalledTimes(1);

		fireEvent.keyDown(card, { key: " " });
		expect(handleClick).toHaveBeenCalledTimes(2);
	});
});
