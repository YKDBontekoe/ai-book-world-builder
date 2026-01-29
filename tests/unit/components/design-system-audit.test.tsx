import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { Button } from "@/components/atoms/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import { GlassCard } from "@/components/molecules/glass-card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/atoms/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/atoms/alert-dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/atoms/sheet";

// Mock ResizeObserver for Radix UI
class ResizeObserver {
	observe() {}
	unobserve() {}
	disconnect() {}
}
global.ResizeObserver = ResizeObserver;

describe("Design System Accessibility Audit", () => {
	it("Button should have no accessibility violations", async () => {
		const { container } = render(<Button>Click me</Button>);
		const results = await axe(container);
		expect(results.violations).toEqual([]);
	});

	it("Button (Icon only) should have aria-label", async () => {
		const { container } = render(
			<Button size="icon" aria-label="Settings">
				<span className="h-4 w-4" />
			</Button>,
		);
		const results = await axe(container);
		expect(results.violations).toEqual([]);
	});

	it("Card should have no accessibility violations", async () => {
		const { container } = render(
			<Card>
				<CardHeader>
					<CardTitle>Card Title</CardTitle>
				</CardHeader>
				<CardContent>
					<p>Card content goes here.</p>
				</CardContent>
			</Card>,
		);
		const results = await axe(container);
		expect(results.violations).toEqual([]);
	});

	it("GlassCard should have no accessibility violations", async () => {
		const { container } = render(<GlassCard>Glass Card Content</GlassCard>);
		const results = await axe(container);
		expect(results.violations).toEqual([]);
	});

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
		// Check the entire document because Dialog renders in a Portal
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
});
