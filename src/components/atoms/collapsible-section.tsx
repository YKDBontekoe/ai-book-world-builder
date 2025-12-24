"use client";

import { ChevronDown } from "lucide-react";
import type * as React from "react";
import { useState } from "react";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/atoms/card";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/atoms/collapsible";
import { cn } from "@/lib/utils";

const accentColors = {
	primary: "text-primary",
	blue: "text-blue-500",
	violet: "text-violet-500",
	pink: "text-pink-500",
	amber: "text-amber-500",
	emerald: "text-emerald-500",
} as const;

export interface CollapsibleSectionProps {
	/** Section title */
	title: string;
	/** Icon component to display next to title */
	icon: React.ReactNode;
	/** Section content */
	children: React.ReactNode;
	/** Whether section is expanded by default */
	defaultOpen?: boolean;
	/** Accent color for the icon */
	accentColor?: keyof typeof accentColors;
	/** Additional class names for the card */
	className?: string;
}

/**
 * A collapsible section card with glassmorphism styling.
 * Used for organizing configuration panels into expandable groups.
 */
export function CollapsibleSection({
	title,
	icon,
	children,
	defaultOpen = false,
	accentColor = "primary",
	className,
}: CollapsibleSectionProps) {
	const [isOpen, setIsOpen] = useState(defaultOpen);

	return (
		<Collapsible open={isOpen} onOpenChange={setIsOpen}>
			<Card
				className={cn(
					"overflow-hidden border-border/50 bg-background/50 backdrop-blur-sm",
					className,
				)}
			>
				<CollapsibleTrigger asChild>
					<CardHeader className="cursor-pointer transition-colors hover:bg-muted/30">
						<CardTitle className="flex items-center justify-between text-base">
							<div className="flex items-center gap-2">
								<span className={accentColors[accentColor]}>{icon}</span>
								{title}
							</div>
							<ChevronDown
								className={cn(
									"h-4 w-4 text-muted-foreground transition-transform",
									isOpen && "rotate-180",
								)}
							/>
						</CardTitle>
					</CardHeader>
				</CollapsibleTrigger>
				<CollapsibleContent>
					<CardContent className="space-y-4 pt-0">{children}</CardContent>
				</CollapsibleContent>
			</Card>
		</Collapsible>
	);
}
