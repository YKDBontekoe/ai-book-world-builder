"use client";

import { Clock, History, RotateCcw, Sparkles } from "lucide-react";
import { useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ChapterVersion {
	id: string;
	chapterId: string;
	version: number;
	content: string;
	wordCount: number;
	createdAt: string;
	createdBy: string;
}

interface VersionHistoryPanelProps {
	chapterId: string;
	chapterTitle: string;
	currentContent: string;
	onRestore: (content: string, versionId: string) => void;
}

async function fetchVersions(chapterId: string): Promise<ChapterVersion[]> {
	const res = await fetch(`/api/chapters/${chapterId}/versions`);
	if (!res.ok) return [];
	return res.json();
}

export function VersionHistoryPanel({
	chapterId,
	chapterTitle,
	currentContent,
	onRestore,
}: VersionHistoryPanelProps) {
	const { data: versions = [], isLoading } = useSWR(
		["chapter-versions", chapterId],
		() => fetchVersions(chapterId),
		{ fallbackData: [] },
	);

	const [selectedVersion, setSelectedVersion] = useState<ChapterVersion | null>(
		null,
	);
	const [showPreview, setShowPreview] = useState(false);
	const [isRestoring, setIsRestoring] = useState(false);

	const handleRestore = async () => {
		if (!selectedVersion) return;

		setIsRestoring(true);
		try {
			onRestore(selectedVersion.content, selectedVersion.id);
			setShowPreview(false);
		} catch (error) {
			console.error("Failed to restore version:", error);
		} finally {
			setIsRestoring(false);
		}
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return new Intl.DateTimeFormat("en-US", {
			month: "short",
			day: "numeric",
			hour: "numeric",
			minute: "2-digit",
		}).format(date);
	};

	const getTimeDiff = (dateString: string) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);

		if (diffMins < 1) return "Just now";
		if (diffMins < 60) return `${diffMins}m ago`;
		if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
		return `${Math.floor(diffMins / 1440)}d ago`;
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-8 text-muted-foreground">
				<Sparkles className="h-4 w-4 animate-pulse mr-2" />
				Loading versions...
			</div>
		);
	}

	if (versions.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
				<History className="h-8 w-8 mb-2 opacity-50" />
				<p className="text-sm">No previous versions</p>
				<p className="text-xs mt-1">Versions are saved during generation</p>
			</div>
		);
	}

	return (
		<div className="space-y-3">
			<div className="flex items-center gap-2 px-1">
				<History className="h-4 w-4 text-muted-foreground" />
				<h4 className="text-sm font-medium">Version History</h4>
				<span className="text-xs text-muted-foreground">
					({versions.length} versions)
				</span>
			</div>

			<ScrollArea className="h-[200px]">
				<div className="space-y-2 pr-3">
					{/* Current version indicator */}
					<div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 p-3">
						<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
							Now
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-sm font-medium">Current Version</p>
							<p className="text-xs text-muted-foreground">
								{currentContent.split(/\s+/).length} words
							</p>
						</div>
					</div>

					{/* Previous versions */}
					{versions.map((version, index) => (
						<button
							key={version.id}
							type="button"
							onClick={() => {
								setSelectedVersion(version);
								setShowPreview(true);
							}}
							className={cn(
								"w-full flex items-center gap-3 rounded-lg border p-3 text-left transition-all hover:bg-muted/50",
								selectedVersion?.id === version.id && "border-primary/50",
							)}
						>
							<div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-semibold">
								v{versions.length - index}
							</div>
							<div className="flex-1 min-w-0">
								<div className="flex items-center gap-2">
									<p className="text-sm font-medium truncate">
										{formatDate(version.createdAt)}
									</p>
									<span className="text-xs text-muted-foreground">
										{getTimeDiff(version.createdAt)}
									</span>
								</div>
								<div className="flex items-center gap-2 text-xs text-muted-foreground">
									<Clock className="h-3 w-3" />
									<span>{version.wordCount} words</span>
									<span>•</span>
									<span className="capitalize">{version.createdBy}</span>
								</div>
							</div>
							<RotateCcw className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
						</button>
					))}
				</div>
			</ScrollArea>

			{/* Preview/Restore Dialog */}
			<Dialog open={showPreview} onOpenChange={setShowPreview}>
				<DialogContent className="max-w-3xl max-h-[80vh]">
					<DialogHeader>
						<DialogTitle>Restore Version - {chapterTitle}</DialogTitle>
						<DialogDescription>
							{selectedVersion && (
								<span>
									Version from {formatDate(selectedVersion.createdAt)} •{" "}
									{selectedVersion.wordCount} words
								</span>
							)}
						</DialogDescription>
					</DialogHeader>

					<ScrollArea className="max-h-[50vh] rounded-lg border bg-muted/30 p-4">
						<div className="prose prose-sm dark:prose-invert max-w-none">
							{selectedVersion?.content.split("\n\n").map((paragraph, i) => (
								<p key={i}>{paragraph}</p>
							))}
						</div>
					</ScrollArea>

					<DialogFooter>
						<Button variant="outline" onClick={() => setShowPreview(false)}>
							Cancel
						</Button>
						<Button onClick={handleRestore} disabled={isRestoring}>
							{isRestoring ? (
								"Restoring..."
							) : (
								<>
									<RotateCcw className="h-4 w-4 mr-2" />
									Restore This Version
								</>
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
