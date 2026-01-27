import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { Button } from "@/components/atoms/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import { GlassCard } from "@/components/molecules/glass-card";

describe("Design System Accessibility Audit", () => {
	it("Button should have no accessibility violations", async () => {
		const { container } = render(<Button>Click me</Button>);
		const results = await axe(container);
		expect(results.violations).toEqual([]);
	});

	it("Button (Icon only) should have aria-label", async () => {
		const { container } = render(
			<Button size="icon" aria-label="Settings">
				<span className="h-4 w-4" />
			</Button>,
		);
		const results = await axe(container);
		expect(results.violations).toEqual([]);
	});

	it("Card should have no accessibility violations", async () => {
		const { container } = render(
			<Card>
				<CardHeader>
					<CardTitle>Card Title</CardTitle>
				</CardHeader>
				<CardContent>
					<p>Card content goes here.</p>
				</CardContent>
			</Card>,
		);
		const results = await axe(container);
		expect(results.violations).toEqual([]);
	});

	it("GlassCard should have no accessibility violations", async () => {
		const { container } = render(<GlassCard>Glass Card Content</GlassCard>);
		const results = await axe(container);
		expect(results.violations).toEqual([]);
	});
});
