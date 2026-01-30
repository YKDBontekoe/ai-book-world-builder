import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import * as matchers from "vitest-axe/matchers";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogTitle,
} from "@/components/atoms/alert-dialog";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "@/components/atoms/dialog";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/atoms/popover";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetTitle,
} from "@/components/atoms/sheet";
import { GlassCard } from "@/components/molecules/glass-card";

expect.extend(matchers);

// Mock framer-motion to avoid animation issues in tests
vi.mock("framer-motion", () => ({
	motion: {
		div: ({ children, ...props }: import("react").ComponentProps<"div">) => (
			<div {...props}>{children}</div>
		),
	},
	AnimatePresence: ({ children }: { children: import("react").ReactNode }) => (
		<>{children}</>
	),
}));

// ResizeObserver mock
global.ResizeObserver = class ResizeObserver {
	observe() {}
	unobserve() {}
	disconnect() {}
} as any;

// Mock PointerEvent for Radix UI
class MockPointerEvent extends Event {
	button: number;
	ctrlKey: boolean;
	pointerType: string;

	constructor(type: string, props: PointerEventInit) {
		super(type, props);
		this.button = props.button || 0;
		this.ctrlKey = props.ctrlKey || false;
		this.pointerType = props.pointerType || "mouse";
	}
}

// Polyfill PointerEvent
window.PointerEvent = MockPointerEvent as any;
if (window.HTMLElement) {
	window.HTMLElement.prototype.scrollIntoView = vi.fn();
	window.HTMLElement.prototype.releasePointerCapture = vi.fn();
	window.HTMLElement.prototype.hasPointerCapture = vi.fn();
}

describe("UI Components Accessibility Audit", () => {
	it("Dialog should be accessible", async () => {
		const { container } = render(
			<Dialog open>
				<DialogContent>
					<DialogTitle>Dialog Title</DialogTitle>
					<DialogDescription>Dialog Description</DialogDescription>
				</DialogContent>
			</Dialog>,
		);
		const results = await axe(container);
		expect(results).toHaveNoViolations();
	});

	it("AlertDialog should be accessible", async () => {
		const { container } = render(
			<AlertDialog open>
				<AlertDialogContent>
					<AlertDialogTitle>Alert Title</AlertDialogTitle>
					<AlertDialogDescription>Alert Description</AlertDialogDescription>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction>Continue</AlertDialogAction>
				</AlertDialogContent>
			</AlertDialog>,
		);
		const results = await axe(container);
		expect(results).toHaveNoViolations();
	});

	it("Sheet should be accessible", async () => {
		const { container } = render(
			<Sheet open>
				<SheetContent>
					<SheetTitle>Sheet Title</SheetTitle>
					<SheetDescription>Sheet Description</SheetDescription>
				</SheetContent>
			</Sheet>,
		);
		const results = await axe(container);
		expect(results).toHaveNoViolations();
	});

	it("Popover should be accessible", async () => {
		const { container } = render(
			<Popover open>
				<PopoverTrigger>Open</PopoverTrigger>
				<PopoverContent>Popover Content</PopoverContent>
			</Popover>,
		);
		const results = await axe(container);
		expect(results).toHaveNoViolations();
	});

	it("GlassCard should be accessible and handle keyboard interaction", async () => {
		const handleClick = vi.fn();
		const { container, getByRole } = render(
			<GlassCard interactive onClick={handleClick}>
				Content
			</GlassCard>,
		);

		const results = await axe(container);
		expect(results).toHaveNoViolations();

		const card = getByRole("button");
		fireEvent.keyDown(card, { key: "Enter" });
		expect(handleClick).toHaveBeenCalled();
	});
});
