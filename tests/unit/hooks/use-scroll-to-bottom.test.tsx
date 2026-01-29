import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useScrollToBottom } from "@/hooks/use-scroll-to-bottom";

function TestComponent() {
	const { containerRef, isAtBottom } = useScrollToBottom();
	return (
		<div
			ref={containerRef}
			data-testid="container"
			style={{ height: "100px", overflow: "auto" }}
		>
			<div style={{ height: "1000px" }}>Content</div>
			<div data-testid="status">
				{isAtBottom ? "At Bottom" : "Not At Bottom"}
			</div>
		</div>
	);
}

describe("useScrollToBottom", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		global.ResizeObserver = vi.fn().mockImplementation(function () {
			return {
				observe: vi.fn(),
				unobserve: vi.fn(),
				disconnect: vi.fn(),
			};
		});
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.restoreAllMocks();
	});

	it("throttles calls to scroll check", async () => {
		render(<TestComponent />);
		const container = screen.getByTestId("container");

		// Mock scroll properties
		Object.defineProperty(container, "scrollHeight", {
			configurable: true,
			writable: true,
			value: 1000,
		});
		Object.defineProperty(container, "clientHeight", {
			configurable: true,
			writable: true,
			value: 100,
		});

		// Spy on scrollTop getter and allow setter
		let scrollTopValue = 0;
		const scrollTopSpy = vi.fn(() => scrollTopValue);
		Object.defineProperty(container, "scrollTop", {
			configurable: true,
			get: scrollTopSpy,
			set: (val) => {
				scrollTopValue = val;
			},
		});

		// Initial check might happen
		scrollTopSpy.mockClear();

		// Trigger multiple scroll events
		fireEvent.scroll(container, { target: { scrollTop: 10 } });
		fireEvent.scroll(container, { target: { scrollTop: 20 } });
		fireEvent.scroll(container, { target: { scrollTop: 30 } });

		// lodash throttle (leading=true, trailing=true by default)
		// It should call once immediately (leading)
		// And schedule a trailing call.

		// With 3 events in sync (virtually same time), expect 1 call.
		expect(scrollTopSpy).toHaveBeenCalledTimes(1);

		// Advance timers to trigger trailing edge
		act(() => {
			vi.advanceTimersByTime(200);
		});

		// Should have been called again (trailing)
		// Total calls: 2 (1 leading + 1 trailing)
		expect(scrollTopSpy).toHaveBeenCalledTimes(2);
	});
});
