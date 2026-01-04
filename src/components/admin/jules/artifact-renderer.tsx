"use client";

import { ChevronDown, ChevronRight, Terminal } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/atoms/collapsible";
import { ScrollArea } from "@/components/atoms/scroll-area";
import type { JulesArtifact } from "@/lib/jules-client";

interface ArtifactRendererProps {
	artifacts: JulesArtifact[];
}

import type { JSX } from "react";

/**
 * Renders a list of artifacts (patches, command outputs, etc.) produced by Jules.
 * @param artifacts List of artifacts to display.
 * @returns The ArtifactRenderer component or null if no artifacts.
 */
export function ArtifactRenderer({
	artifacts,
}: ArtifactRendererProps): JSX.Element | null {
	if (!artifacts || artifacts.length === 0) return null;

	return (
		<div className="flex flex-col gap-2 w-full mt-2">
			{artifacts.map((artifact, i) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: no stable id for artifacts
				<ArtifactItem key={i} artifact={artifact} />
			))}
		</div>
	);
}

function ArtifactItem({ artifact }: { artifact: JulesArtifact }) {
	const [isOpen, setIsOpen] = useState(false);

	if (artifact.bashOutput) {
		const { command, output, exitCode } = artifact.bashOutput;
		return (
			<div className="rounded-md border bg-black text-green-400 font-mono text-xs overflow-hidden w-full">
				<div className="flex items-center justify-between px-3 py-2 bg-zinc-900 border-b border-zinc-800">
					<div className="flex items-center gap-2">
						<Terminal className="h-3 w-3" />
						<span className="truncate max-w-[300px]">{command}</span>
					</div>
					<Badge
						variant={exitCode === 0 ? "outline" : "destructive"}
						className="text-[10px] h-5"
					>
						Exit: {exitCode}
					</Badge>
				</div>
				<Collapsible open={isOpen} onOpenChange={setIsOpen}>
					<div className="relative">
						<ScrollArea className={`w-full ${isOpen ? "h-64" : "h-24"}`}>
							<div className="p-3 whitespace-pre-wrap break-all">{output}</div>
						</ScrollArea>
						{!isOpen && output.length > 200 && (
							<div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black to-transparent pointer-events-none" />
						)}
					</div>
					{output.length > 200 && (
						<div className="flex justify-center p-1 bg-zinc-900 border-t border-zinc-800">
							<CollapsibleTrigger asChild>
								<Button
									variant="ghost"
									size="sm"
									className="h-6 text-[10px] text-zinc-400 hover:text-white"
								>
									{isOpen ? (
										<span className="flex items-center gap-1">
											Collapse <ChevronDown className="h-3 w-3" />
										</span>
									) : (
										<span className="flex items-center gap-1">
											Show All <ChevronDown className="h-3 w-3" />
										</span>
									)}
								</Button>
							</CollapsibleTrigger>
						</div>
					)}
				</Collapsible>
			</div>
		);
	}

	if (artifact.changeSet) {
		const { source, gitPatch } = artifact.changeSet;
		return (
			<div className="rounded-md border bg-muted/50 w-full font-mono text-xs">
				<Collapsible open={isOpen} onOpenChange={setIsOpen}>
					<div className="flex items-center justify-between px-3 py-2 border-b">
						<div className="flex items-center gap-2 truncate">
							<span className="text-muted-foreground">Patch:</span>
							<span className="font-medium truncate">
								{source.split("/").pop()}
							</span>
						</div>
						<CollapsibleTrigger asChild>
							<Button
								variant="ghost"
								size="sm"
								className="h-6 w-6 p-0"
								aria-label={isOpen ? "Collapse details" : "Expand details"}
							>
								{isOpen ? (
									<ChevronDown className="h-4 w-4" />
								) : (
									<ChevronRight className="h-4 w-4" />
								)}
							</Button>
						</CollapsibleTrigger>
					</div>
					<CollapsibleContent>
						<ScrollArea className="h-64 w-full bg-background">
							<div className="p-3">
								<div className="text-muted-foreground mb-2">
									{"// "}{gitPatch.suggestedCommitMessage}
								</div>
								<pre className="whitespace-pre-wrap text-[10px] leading-relaxed">
									{gitPatch.unidiffPatch}
								</pre>
							</div>
						</ScrollArea>
					</CollapsibleContent>
				</Collapsible>
			</div>
		);
	}

	return null;
}
