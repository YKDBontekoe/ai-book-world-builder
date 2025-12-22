"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
	BookOpenIcon,
	CopyIcon,
	DownloadIcon,
	FileTextIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
	getChapterDraft,
	getOutlineData,
	type SerializedChapter,
} from "@/app/actions/project-stats";
import { Button } from "@/components/atoms/button";
import { EmptyState } from "@/components/molecules/empty-state";
import { LoadingSpinner } from "@/components/atoms/loading-spinner";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/atoms/select";
import { api } from "@/lib/api-client";
import { QUERY_KEYS } from "@/lib/query-options";
import { useBookCanvas } from "@/components/organisms/book-canvas/book-canvas-context";

export function DraftPane() {
	const { projectId } = useBookCanvas();
	const [selectedChapterId, setSelectedChapterId] = useState<string | null>(
		null,
	);
	const router = useRouter();

	// Fetch chapters
	const { data: outline } = useQuery({
		queryKey: projectId ? QUERY_KEYS.outline(projectId) : ["outline", "null"],
		queryFn: () => (projectId ? getOutlineData(projectId) : Promise.resolve(null)),
		enabled: !!projectId,
	});

	// Fetch draft content when chapter is selected
	const { data: draftContent, isLoading: isLoadingDraft } = useQuery({
		queryKey: selectedChapterId
			? QUERY_KEYS.draft(selectedChapterId)
			: ["draft", "null"],
		queryFn: () =>
			selectedChapterId
				? getChapterDraft(selectedChapterId)
				: Promise.resolve(null),
		enabled: !!selectedChapterId,
	});

	// Auto-select first chapter if none selected
	useEffect(() => {
		if (outline?.chapters?.length && !selectedChapterId) {
			setSelectedChapterId(outline.chapters[0].id);
		}
	}, [outline, selectedChapterId]);

	const { mutate: exportProject, isPending: isExporting } = useMutation({
		mutationFn: async (format: "pdf" | "epub") => {
			if (!projectId) throw new Error("No project selected");
			return api.post(`/api/projects/${projectId}/export`, { format });
		},
		onSuccess: () => {
			toast.success(`Export started! Check "My Exports" page.`);
			router.push("/exports");
		},
		onError: (error) => {
			toast.error(
				"Export failed: " +
					(error instanceof Error ? error.message : "Unknown error"),
			);
		},
	});

	const copyToClipboard = () => {
		if (draftContent) {
			navigator.clipboard.writeText(draftContent);
			toast.success("Copied to clipboard");
		}
	};

	if (!projectId) {
		return (
			<EmptyState
				icon={FileTextIcon}
				title="No Project Selected"
				className="m-4"
			/>
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
						onClick={() => exportProject("pdf")}
						disabled={isExporting}
					>
						<DownloadIcon className="h-3.5 w-3.5" />
						PDF
					</Button>
					<Button
						variant="outline"
						size="sm"
						className="h-8 text-xs gap-1.5"
						onClick={() => exportProject("epub")}
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
						<LoadingSpinner size="lg" variant="muted" />
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
