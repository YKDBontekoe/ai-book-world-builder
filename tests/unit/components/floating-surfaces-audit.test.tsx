import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/atoms/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/atoms/alert-dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/atoms/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/atoms/popover";

// Mock ResizeObserver for Radix UI
class ResizeObserver {
	observe() {}
	unobserve() {}
	disconnect() {}
}
global.ResizeObserver = ResizeObserver;

describe("Floating Surfaces Accessibility Audit", () => {
	it("Dialog should have no accessibility violations", async () => {
		const { baseElement } = render(
			<Dialog defaultOpen>
				<DialogTrigger>Open</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Dialog Title</DialogTitle>
						<DialogDescription>Dialog description.</DialogDescription>
					</DialogHeader>
					<p>Dialog content.</p>
				</DialogContent>
			</Dialog>
		);
		const results = await axe(baseElement);
		expect(results.violations).toEqual([]);
	});

	it("AlertDialog should have no accessibility violations", async () => {
		const { baseElement } = render(
			<AlertDialog defaultOpen>
				<AlertDialogTrigger>Open</AlertDialogTrigger>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Alert Dialog Title</AlertDialogTitle>
						<AlertDialogDescription>Alert description.</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction>Action</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		);
		const results = await axe(baseElement);
		expect(results.violations).toEqual([]);
	});

	it("Sheet should have no accessibility violations", async () => {
		const { baseElement } = render(
			<Sheet defaultOpen>
				<SheetTrigger>Open</SheetTrigger>
				<SheetContent side="right">
					<SheetHeader>
						<SheetTitle>Sheet Title</SheetTitle>
						<SheetDescription>Sheet description.</SheetDescription>
					</SheetHeader>
					<p>Sheet content.</p>
				</SheetContent>
			</Sheet>
		);
		const results = await axe(baseElement);
		expect(results.violations).toEqual([]);
	});

	it("Popover should have no accessibility violations", async () => {
		const { baseElement } = render(
			<Popover defaultOpen>
				<PopoverTrigger>Open</PopoverTrigger>
				<PopoverContent aria-label="Popover Content">
					<p>Popover content.</p>
				</PopoverContent>
			</Popover>
		);
		const results = await axe(baseElement);
		expect(results.violations).toEqual([]);
	});
});
