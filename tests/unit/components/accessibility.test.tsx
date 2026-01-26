import * as React from "react";
import { render, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeAll } from "vitest";
import { axe } from "vitest-axe";
import * as matchers from "vitest-axe/matchers";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "@/components/atoms/dialog";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "@/components/atoms/sheet";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/atoms/alert-dialog";

expect.extend(matchers);

// Mock ResizeObserver
beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

describe("Accessibility Checks", () => {
  it("Dialog should have no accessibility violations", async () => {
    const { container } = render(
      <Dialog open>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>Dialog Description</DialogDescription>
          <p>Dialog content</p>
        </DialogContent>
      </Dialog>
    );

    // Radix Dialog renders content in a portal, so we check the document body or specific elements
    // However, axe needs to check the rendered output.
    // For portals, render might not contain the portal content directly in container.
    // But accessibility checks usually run on the whole document or the relevant part.
    // Let's check the document.body since Radix portals render there.
    const results = await axe(document.body);
    expect(results).toHaveNoViolations();
  });

  it("Sheet should have no accessibility violations", async () => {
    const { container } = render(
      <Sheet open>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent>
          <SheetTitle>Sheet Title</SheetTitle>
          <SheetDescription>Sheet Description</SheetDescription>
          <p>Sheet content</p>
        </SheetContent>
      </Sheet>
    );

    const results = await axe(document.body);
    expect(results).toHaveNoViolations();
  });

  it("AlertDialog should have no accessibility violations", async () => {
    const { container } = render(
      <AlertDialog open>
        <AlertDialogTrigger>Open</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Alert Title</AlertDialogTitle>
          <AlertDialogDescription>Alert Description</AlertDialogDescription>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Action</AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    );

    const results = await axe(document.body);
    expect(results).toHaveNoViolations();
  });
});
