import { describe, expect, it } from "vitest";
import { PROJECT_TEMPLATES } from "@/lib/templates";

describe("PROJECT_TEMPLATES", () => {
	it("should have at least the blank template", () => {
		const blank = PROJECT_TEMPLATES.find((t) => t.id === "blank");
		expect(blank).toBeDefined();
		expect(blank?.plan.chapters).toHaveLength(0);
	});

	it("should have the hero's journey template", () => {
		const herosJourney = PROJECT_TEMPLATES.find(
			(t) => t.id === "heros-journey",
		);
		expect(herosJourney).toBeDefined();
		expect(herosJourney?.plan.chapters.length).toBeGreaterThan(0);
	});

	it("all templates should have a valid plan structure", () => {
		PROJECT_TEMPLATES.forEach((template) => {
			expect(template.id).toBeDefined();
			expect(template.name).toBeDefined();
			expect(template.plan).toBeDefined();
			expect(template.plan.title).toBeDefined();
			expect(Array.isArray(template.plan.chapters)).toBe(true);
		});
	});
});
