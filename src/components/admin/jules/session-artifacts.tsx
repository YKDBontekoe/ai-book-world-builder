"use client";

import { FileText } from "lucide-react";
import type { JSX } from "react";
import { Badge } from "@/components/atoms/badge";
import { ScrollArea } from "@/components/atoms/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { JulesActivity } from "@/lib/jules-client";
import { ArtifactRenderer } from "./artifact-renderer";

interface SessionArtifactsProps {
	activities: JulesActivity[];
}

export function SessionArtifacts({
	activities,
}: SessionArtifactsProps): JSX.Element {
	// Aggregate all artifacts
	const allArtifacts = activities.flatMap((a) => a.artifacts || []);

	const changes = allArtifacts.filter((a) => a.changeSet);
	const commands = allArtifacts.filter((a) => a.bashOutput);

	if (allArtifacts.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center">
				<FileText className="h-8 w-8 mb-4 opacity-20" />
				<p>No artifacts generated yet.</p>
			</div>
		);
	}

	return (
		<div className="h-full flex flex-col">
			<div className="p-4 border-b">
				<h3 className="font-semibold text-lg">Artifacts</h3>
				<p className="text-xs text-muted-foreground">
					Generated code, patches, and command outputs.
				</p>
			</div>

			<Tabs defaultValue="changes" className="flex-1 flex flex-col min-h-0">
				<div className="px-4 py-2 border-b bg-muted/30">
					<TabsList className="w-full justify-start h-8 bg-transparent p-0">
						<TabsTrigger
							value="changes"
							className="h-8 px-4 data-[state=active]:bg-background data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none"
						>
							Changes{" "}
							<Badge variant="secondary" className="ml-2 h-5 px-1.5">
								{changes.length}
							</Badge>
						</TabsTrigger>
						<TabsTrigger
							value="commands"
							className="h-8 px-4 data-[state=active]:bg-background data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none"
						>
							Commands{" "}
							<Badge variant="secondary" className="ml-2 h-5 px-1.5">
								{commands.length}
							</Badge>
						</TabsTrigger>
					</TabsList>
				</div>

				<TabsContent value="changes" className="flex-1 min-h-0 m-0">
					<ScrollArea className="h-full">
						<div className="p-4">
							<ArtifactRenderer artifacts={changes} />
						</div>
					</ScrollArea>
				</TabsContent>

				<TabsContent value="commands" className="flex-1 min-h-0 m-0">
					<ScrollArea className="h-full">
						<div className="p-4">
							<ArtifactRenderer artifacts={commands} />
						</div>
					</ScrollArea>
				</TabsContent>
			</Tabs>
		</div>
	);
}
