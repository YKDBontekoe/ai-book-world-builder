import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
	PowerDockSuggestions,
	type SuggestionItem,
} from "@/features/writer/components/power-dock/power-dock-suggestions";

// Mock GlassCard
vi.mock("@/components/molecules/glass-card", () => ({
	GlassCard: ({
		children,
		className,
	}: {
		children: React.ReactNode;
		className?: string;
	}) => (
		<div className={className} data-testid="glass-card">
			{children}
		</div>
	),
}));

describe("PowerDockSuggestions", () => {
	const items: SuggestionItem[] = [
		{ id: "1", label: "Item 1", value: "val1" },
		{ id: "2", label: "Item 2", value: "val2", description: "Desc 2" },
	];
	const onSelect = vi.fn();

	it("renders nothing if items empty", () => {
		const { container } = render(
			<PowerDockSuggestions items={[]} selectedIndex={0} onSelect={onSelect} />,
		);
		expect(container).toBeEmptyDOMElement();
	});

	it("renders items", () => {
		render(
			<PowerDockSuggestions
				items={items}
				selectedIndex={0}
				onSelect={onSelect}
			/>,
		);
		expect(screen.getByText("Item 1")).toBeInTheDocument();
		expect(screen.getByText("Item 2")).toBeInTheDocument();
		expect(screen.getByText("Desc 2")).toBeInTheDocument();
	});

	it("highlights selected item", () => {
		render(
			<PowerDockSuggestions
				items={items}
				selectedIndex={1}
				onSelect={onSelect}
			/>,
		);
		// In the component, the "↵" indicator is only shown for selected items.
		expect(screen.getByText("↵")).toBeInTheDocument();
	});

	it("calls onSelect when clicked", () => {
		render(
			<PowerDockSuggestions
				items={items}
				selectedIndex={0}
				onSelect={onSelect}
			/>,
		);
		fireEvent.click(screen.getByText("Item 1"));
		expect(onSelect).toHaveBeenCalledWith(items[0]);
	});
});
