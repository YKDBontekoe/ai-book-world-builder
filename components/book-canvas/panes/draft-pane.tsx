"use client";

import {
	BookOpenIcon,
	CopyIcon,
	DownloadIcon,
	FileTextIcon,
	Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import {
	getChapterDraft,
	getOutlineData,
	type SerializedChapter,
} from "@/app/actions/project-stats";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useBookCanvas } from "../book-canvas-context";

export function DraftPane() {
	const { projectId } = useBookCanvas();
	const [selectedChapterId, setSelectedChapterId] = useState<string | null>(
		null,
	);
	const [isExporting, setIsExporting] = useState(false);
	const router = useRouter();

	// Fetch chapters
	const { data: outline } = useSWR(
		projectId ? ["outline", projectId] : null,
		([_, id]) => getOutlineData(id),
	);

	// Fetch draft content when chapter is selected
	const { data: draftContent, isLoading: isLoadingDraft } = useSWR(
		selectedChapterId ? ["draft", selectedChapterId] : null,
		([_, id]) => getChapterDraft(id),
	);

	// Auto-select first chapter if none selected
	if (outline?.chapters?.length && !selectedChapterId) {
		setSelectedChapterId(outline.chapters[0].id);
	}

	const handleExport = async (format: "pdf" | "epub") => {
		if (!projectId) return;
		setIsExporting(true);
		try {
			const res = await fetch(`/api/projects/${projectId}/export`, {
				method: "POST",
				body: JSON.stringify({ format }),
				headers: { "Content-Type": "application/json" },
			});

			if (!res.ok) {
				throw new Error(await res.text());
			}

			await res.json();
			toast.success(`Export started! Check "My Exports" page.`);
			router.push("/exports");
		} catch (error) {
			toast.error(
				"Export failed: " +
					(error instanceof Error ? error.message : "Unknown error"),
			);
		} finally {
			setIsExporting(false);
		}
	};

	const copyToClipboard = () => {
		if (draftContent) {
			navigator.clipboard.writeText(draftContent);
			toast.success("Copied to clipboard");
		}
	};

	if (!projectId) {
		return (
			<div className="flex h-full flex-col items-center justify-center p-8 text-center bg-muted/5 rounded-xl border border-dashed m-4">
				<FileTextIcon className="h-10 w-10 text-muted-foreground/50 mb-3" />
				<p className="font-medium text-sm">No Project Selected</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-full">
			{/* Header / Toolbar */}
			<div className="flex items-center justify-between p-4 border-b bg-muted/10">
				<div className="flex items-center gap-3 flex-1">
					<FileTextIcon className="h-5 w-5 text-muted-foreground" />
					<Select
						value={selectedChapterId || ""}
						onValueChange={setSelectedChapterId}
						disabled={!outline?.chapters?.length}
					>
						<SelectTrigger className="w-[240px] h-8 text-sm">
							<SelectValue placeholder="Select Chapter" />
						</SelectTrigger>
						<SelectContent>
							{outline?.chapters?.map((ch: SerializedChapter) => (
								<SelectItem key={ch.id} value={ch.id}>
									{ch.sequence}. {ch.title}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="flex items-center gap-2">
					<Button
						variant="ghost"
						size="sm"
						className="h-8 w-8 p-0"
						onClick={copyToClipboard}
						disabled={!draftContent}
						title="Copy to Clipboard"
					>
						<CopyIcon className="h-4 w-4" />
					</Button>
					<div className="h-4 w-px bg-border mx-1" />
					<Button
						variant="outline"
						size="sm"
						className="h-8 text-xs gap-1.5"
						onClick={() => handleExport("pdf")}
						disabled={isExporting}
					>
						<DownloadIcon className="h-3.5 w-3.5" />
						PDF
					</Button>
					<Button
						variant="outline"
						size="sm"
						className="h-8 text-xs gap-1.5"
						onClick={() => handleExport("epub")}
						disabled={isExporting}
					>
						<BookOpenIcon className="h-3.5 w-3.5" />
						EPUB
					</Button>
				</div>
			</div>

			{/* Content Area */}
			<div className="flex-1 overflow-auto p-6 md:p-8 bg-background">
				{isLoadingDraft ? (
					<div className="flex h-full items-center justify-center">
						<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
					</div>
				) : draftContent ? (
					<div className="prose prose-sm dark:prose-invert max-w-none">
						{/* Simple pre-wrap display for now, ideally Markdown renderer */}
						<div className="whitespace-pre-wrap font-serif text-base leading-relaxed">
							{draftContent}
						</div>
					</div>
				) : selectedChapterId ? (
					<div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
						<p>No draft content for this chapter yet.</p>
						<p className="text-xs mt-1">Ask the AI to "Draft this chapter".</p>
					</div>
				) : (
					<div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
						<p>Select a chapter to view its draft.</p>
					</div>
				)}
			</div>
		</div>
	);
}
