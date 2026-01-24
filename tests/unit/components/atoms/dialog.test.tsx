import { render } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { axe } from "vitest-axe";
import React from "react";

// Mock resize observer for Framer Motion
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/atoms/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/atoms/alert-dialog";
import { SettingsDialog } from "@/components/organisms/settings-dialog";

// Mock ScrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn();

// Mock dependencies for SettingsDialog
vi.mock("@/components/providers/appearance-provider", () => ({
  useAppearance: () => ({
    theme: "violet",
    editorFont: "sans",
    editorFontSize: 16,
    editorLineHeight: 1.6,
    updatePreferences: vi.fn(),
    isLoading: false,
  }),
}));

vi.mock("@/app/actions/user", () => ({
  getConnectedAccounts: vi.fn().mockResolvedValue({ success: true, data: [] }),
}));

vi.mock("next-auth/react", () => ({
  signIn: vi.fn(),
  useSession: () => ({ data: null, status: "unauthenticated" }),
}));

describe("Dialog Accessibility", () => {
  it("should have no violations when open", async () => {
    const { baseElement } = render(
      <Dialog open>
        <DialogContent>
          <DialogTitle>Test Dialog</DialogTitle>
          <DialogDescription>Description</DialogDescription>
          <p>Content</p>
        </DialogContent>
      </Dialog>
    );

    const results = await axe(baseElement);
    if (results.violations.length > 0) {
      console.log("Dialog Violations:", JSON.stringify(results.violations, null, 2));
    }
    expect(results.violations).toEqual([]);
  });
});

describe("AlertDialog Accessibility", () => {
  it("should have no violations when open", async () => {
    const { baseElement } = render(
      <AlertDialog open>
        <AlertDialogContent>
          <AlertDialogTitle>Test Alert</AlertDialogTitle>
          <AlertDialogDescription>Description</AlertDialogDescription>
          <AlertDialogAction>Action</AlertDialogAction>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
        </AlertDialogContent>
      </AlertDialog>
    );

    const results = await axe(baseElement);
    if (results.violations.length > 0) {
      console.log("AlertDialog Violations:", JSON.stringify(results.violations, null, 2));
    }
    expect(results.violations).toEqual([]);
  });
});

describe("SettingsDialog Accessibility", () => {
  it("should have no violations when open", async () => {
    const { baseElement } = render(
      <SettingsDialog open={true} onOpenChange={() => {}} />
    );

    const results = await axe(baseElement);
    if (results.violations.length > 0) {
      console.log("SettingsDialog Violations:", JSON.stringify(results.violations, null, 2));
    }
    expect(results.violations).toEqual([]);
  });
});
