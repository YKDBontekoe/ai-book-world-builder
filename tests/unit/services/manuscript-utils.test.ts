import { describe, expect, it } from "vitest";
import {
	normalizeQueryTokens,
	rankScenesByQuery,
	scoreTextForTokens,
} from "@/lib/services/ai/manuscript-utils";

describe("manuscript-utils", () => {
	it("normalizes query tokens and removes short fragments", () => {
		expect(normalizeQueryTokens("A tale of two cities!")).toEqual([
			"tale",
			"two",
			"cities",
		]);
	});

	it("scores text based on token matches", () => {
		const tokens = ["storm", "harbor"];
		expect(scoreTextForTokens("The storm hit the harbor.", tokens)).toBe(2);
	});

	it("ranks scenes by query relevance and recency", () => {
		const scenes = [
			{
				id: "scene-1",
				title: "Quiet Morning",
				content: "A calm breakfast with no tension.",
				updatedAt: new Date("2024-01-01"),
			},
			{
				id: "scene-2",
				title: "Storm at the Harbor",
				content: "A storm hits the harbor and the crew panics.",
				updatedAt: new Date("2024-01-02"),
			},
		];

		const ranked = rankScenesByQuery(scenes, "storm harbor");
		expect(ranked[0].id).toBe("scene-2");
	});
});
