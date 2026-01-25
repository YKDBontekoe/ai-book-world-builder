import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
	observe() {}
	unobserve() {}
	disconnect() {}
};

import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetTitle,
} from "@/components/atoms/sheet";

describe("Sheet Accessibility", () => {
	it("should have no violations when open", async () => {
		const { baseElement } = render(
			<Sheet open>
				<SheetContent>
					<SheetTitle>Test Sheet</SheetTitle>
					<SheetDescription>Description</SheetDescription>
					<p>Content</p>
				</SheetContent>
			</Sheet>,
		);

		const results = await axe(baseElement);
		if (results.violations.length > 0) {
			console.log(
				"Sheet Violations:",
				JSON.stringify(results.violations, null, 2),
			);
		}
		expect(results.violations).toEqual([]);
	});
});
