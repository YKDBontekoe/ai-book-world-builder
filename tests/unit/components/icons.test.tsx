import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { BotIcon, LoaderIcon, WarningIcon } from "@/components/atoms/icons";

describe("icon registry", () => {
	it("renders default attributes", () => {
		const markup = renderToStaticMarkup(<BotIcon />);

		expect(markup).toContain('width="16"');
		expect(markup).toContain('height="16"');
		expect(markup).toContain('viewBox="0 0 16 16"');
		expect(markup).toContain('aria-hidden="true"');
	});

	it("supports custom sizing, title, and className", () => {
		const markup = renderToStaticMarkup(
			<LoaderIcon className="text-primary" size={20} title="loading" />,
		);

		expect(markup).toContain('width="20"');
		expect(markup).toContain('height="20"');
		expect(markup).toContain('class="text-primary"');
		expect(markup).toContain("<title>loading</title>");
		expect(markup).not.toContain('aria-hidden="true"');
	});

	it("keeps view box definitions for individual icons", () => {
		const markup = renderToStaticMarkup(<WarningIcon size={18} />);

		expect(markup).toContain('viewBox="0 0 16 16"');
		expect(markup).toContain('width="18"');
	});
});
