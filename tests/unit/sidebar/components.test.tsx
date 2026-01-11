// @vitest-environment jsdom

import { cleanup, render, waitFor } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
	Sidebar,
	SidebarProvider,
	useSidebar,
} from "@/components/atoms/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

vi.mock("@/hooks/use-mobile", () => ({
	useIsMobile: vi.fn().mockReturnValue(false),
}));

const mockedUseIsMobile = useIsMobile as any;

describe("Sidebar components", () => {
	afterEach(() => {
		cleanup();
		vi.restoreAllMocks();
		mockedUseIsMobile.mockReturnValue(false);
	});

	it.skip("renders the mobile sheet variant when on a mobile viewport", () => {
		mockedUseIsMobile.mockReturnValue(true);

		const OpenMobileSidebar = () => {
			const { toggleSidebar } = useSidebar();

			React.useEffect(() => {
				toggleSidebar();
			}, [toggleSidebar]);

			return <Sidebar>Content</Sidebar>;
		};

		const { container } = render(
			<SidebarProvider>
				<OpenMobileSidebar />
			</SidebarProvider>,
		);

		return waitFor(() =>
			expect(
				container.ownerDocument.querySelector(
					'[data-mobile="true"][data-sidebar="sidebar"]',
				),
			).not.toBeNull(),
		);
	});

	it("exposes desktop data attributes for styling and layout control", () => {
		const { container } = render(
			<SidebarProvider defaultOpen={false}>
				<Sidebar collapsible="icon" side="right" variant="inset">
					Content
				</Sidebar>
			</SidebarProvider>,
		);

		const desktopSidebar =
			container.querySelector<HTMLElement>("[data-variant]");

		expect(desktopSidebar?.dataset.side).toBe("right");
		expect(desktopSidebar?.dataset.variant).toBe("inset");
		expect(desktopSidebar?.dataset.state).toBe("collapsed");
		expect(desktopSidebar?.dataset.collapsible).toBe("icon");
	});

	it("renders a static non-collapsible sidebar when collapsible is disabled", () => {
		const { container } = render(
			<SidebarProvider>
				<Sidebar collapsible="none">
					<div data-testid="static-sidebar" />
				</Sidebar>
			</SidebarProvider>,
		);

		const staticSidebar = container.querySelector(
			"[data-testid='static-sidebar']",
		);

		expect(
			staticSidebar?.closest("div")?.getAttribute("data-variant"),
		).toBeNull();
		expect(staticSidebar?.closest("[data-sidebar='sidebar']")).toBeNull();
	});
});
