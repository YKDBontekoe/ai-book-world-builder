// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  SIDEBAR_COOKIE_NAME,
  SidebarProvider,
  useSidebar,
} from "@/components/atoms/sidebar";

const useIsMobileMock = vi.fn<boolean, []>().mockReturnValue(false);

vi.mock("@/hooks/use-mobile", () => ({
  useIsMobile: () => useIsMobileMock(),
}));

function SidebarConsumer() {
  const { open, openMobile, setOpen, toggleSidebar } = useSidebar();

  return (
    <div>
      <span data-testid="open-state">{open ? "open" : "closed"}</span>
      <span data-testid="mobile-state">{openMobile ? "open" : "closed"}</span>
      <button onClick={() => setOpen((current) => !current)} type="button">
        set-open
      </button>
      <button onClick={toggleSidebar} type="button">
        toggle
      </button>
    </div>
  );
}

describe("SidebarProvider", () => {
  afterEach(() => {
    cleanup();
    document.cookie = "";
    vi.restoreAllMocks();
    useIsMobileMock.mockReturnValue(false);
  });

  it("persists sidebar state to a cookie when the open state changes", () => {
    const { getByText } = render(
      <SidebarProvider defaultOpen>
        <SidebarConsumer />
      </SidebarProvider>
    );

    getByText("set-open").click();

    expect(document.cookie).toContain(`${SIDEBAR_COOKIE_NAME}=false`);
  });

  it("toggles desktop sidebar visibility through the shortcut handler", () => {
    render(
      <SidebarProvider defaultOpen>
        <SidebarConsumer />
      </SidebarProvider>
    );

    const openState = screen.getByTestId("open-state");
    expect(openState.textContent).toBe("open");

    fireEvent.keyDown(window, { key: "b", ctrlKey: true });

    expect(openState.textContent).toBe("closed");
  });

  it("toggles the mobile sheet without altering the desktop state", () => {
    useIsMobileMock.mockReturnValue(true);

    render(
      <SidebarProvider defaultOpen>
        <SidebarConsumer />
      </SidebarProvider>
    );

    const openState = screen.getByTestId("open-state");
    const mobileState = screen.getByTestId("mobile-state");

    expect(openState.textContent).toBe("open");
    expect(mobileState.textContent).toBe("closed");

    fireEvent.click(screen.getByText("toggle"));

    expect(openState.textContent).toBe("open");
    return waitFor(() => expect(mobileState.textContent).toBe("open"));
  });
});
