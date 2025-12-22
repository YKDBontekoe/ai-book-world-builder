"use client";

import {
	BookOpenIcon,
	BookTextIcon,
	ChevronDownIcon,
	LinkIcon,
	UsersIcon,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/atoms/button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/atoms/collapsible";
import { cn } from "@/lib/utils";

export type SourceCitation = {
	type: "entity" | "outline" | "chapter" | "relationship";
	id: string;
	name: string;
	kind?: string;
};

interface MessageSourcesProps {
	sources: SourceCitation[];
	className?: string;
}

function getIconForType(type: SourceCitation["type"]) {
	switch (type) {
		case "entity":
			return UsersIcon;
		case "outline":
			return BookOpenIcon;
		case "chapter":
			return BookTextIcon;
		case "relationship":
			return LinkIcon;
		default:
			return BookOpenIcon;
	}
}

function getColorForType(type: SourceCitation["type"]) {
	switch (type) {
		case "entity":
			return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
		case "outline":
			return "bg-purple-500/10 text-purple-600 dark:text-purple-400";
		case "chapter":
			return "bg-green-500/10 text-green-600 dark:text-green-400";
		case "relationship":
			return "bg-orange-500/10 text-orange-600 dark:text-orange-400";
		default:
			return "bg-muted text-muted-foreground";
	}
}

export function MessageSources({ sources, className }: MessageSourcesProps) {
	const [isOpen, setIsOpen] = useState(false);

	if (!sources || sources.length === 0) {
		return null;
	}

	const entities = sources.filter((s) => s.type === "entity");
	const outlines = sources.filter((s) => s.type === "outline");
	const chapters = sources.filter((s) => s.type === "chapter");
	const relationships = sources.filter((s) => s.type === "relationship");

	const groupedSources = [
		{ label: "Entities", items: entities, type: "entity" as const },
		{ label: "Outline", items: outlines, type: "outline" as const },
		{ label: "Chapters", items: chapters, type: "chapter" as const },
		{
			label: "Relationships",
			items: relationships,
			type: "relationship" as const,
		},
	].filter((group) => group.items.length > 0);

	return (
		<Collapsible
			className={cn("mt-2", className)}
			onOpenChange={setIsOpen}
			open={isOpen}
		>
			<CollapsibleTrigger asChild>
				<Button
					className="h-auto gap-1.5 px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
					size="sm"
					variant="ghost"
				>
					<BookOpenIcon className="size-3" />
					<span>{sources.length} sources referenced</span>
					<ChevronDownIcon
						className={cn(
							"size-3 transition-transform duration-200",
							isOpen && "rotate-180",
						)}
					/>
				</Button>
			</CollapsibleTrigger>
			<CollapsibleContent className="mt-2 space-y-2">
				{groupedSources.map((group) => (
					<div key={group.type}>
						<div className="mb-1 text-muted-foreground text-xs font-medium">
							{group.label}
						</div>
						<div className="flex flex-wrap gap-1.5">
							{group.items.map((source) => {
								const Icon = getIconForType(source.type);
								return (
									<span
										className={cn(
											"inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
											getColorForType(source.type),
										)}
										key={source.id}
									>
										<Icon className="size-3" />
										<span className="max-w-[150px] truncate">
											{source.name}
										</span>
										{source.kind && (
											<span className="opacity-60">({source.kind})</span>
										)}
									</span>
								);
							})}
						</div>
					</div>
				))}
			</CollapsibleContent>
		</Collapsible>
	);
}
