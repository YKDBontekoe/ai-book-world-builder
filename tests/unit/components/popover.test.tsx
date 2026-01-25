import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/atoms/popover";

describe("Popover", () => {
	it("renders content with rounded-lg class", async () => {
		const user = userEvent.setup();
		render(
			<Popover>
				<PopoverTrigger>Open</PopoverTrigger>
				<PopoverContent>Content</PopoverContent>
			</Popover>
		);

		await user.click(screen.getByText("Open"));
		const content = await screen.findByText("Content");

		// Radix UI renders content in a portal.
		// We need to find the element that has the class.
		// The content element returned by findByText is usually the inner text node or span if wrapped.
		// However, in our component definition: <PopoverPrimitive.Content ... className={cn("... rounded-lg ...")}>{children}</PopoverPrimitive.Content>
		// So the element containing "Content" might be the one, or "Content" is a text node inside it.
		// screen.getByText matches the element that *contains* the text.

		expect(content).toHaveClass("rounded-lg");
	});
});
