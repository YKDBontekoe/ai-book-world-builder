"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useDebounceCallback } from "usehooks-ts";
import { saveReadingProgress } from "@/app/actions/reader";
import {
	ReaderControls,
	type ReaderSettings,
} from "@/components/organisms/reader/reader-controls";
import type { Project } from "@/lib/db/schema";

interface ChapterWithContent {
	id: string;
	title: string;
	sequence: number;
	content: string | null;
}

interface ReaderViewProps {
	project: Project;
	chapters: ChapterWithContent[];
	userId?: string;
	initialProgress?: { chapterId: string; progress: number } | null;
}

export function ReaderView({
	project,
	chapters,
	userId,
	initialProgress,
}: ReaderViewProps) {
	// --- Data Persistence ---
	const { data: cachedChapters } = useQuery({
		queryKey: ["project-chapters", project.id],
		queryFn: async () => chapters,
		initialData: chapters,
		staleTime: Infinity,
	});

	// Determine initial chapter index
	const getInitialIndex = () => {
		if (!initialProgress) return 0;
		const idx = chapters.findIndex((c) => c.id === initialProgress.chapterId);
		return idx >= 0 ? idx : 0;
	};

	const [currentChapterIndex, setCurrentChapterIndex] =
		useState(getInitialIndex);
	const [settings, setSettings] = useState<ReaderSettings>({
		fontSize: 18,
		fontFamily: "font-serif",
		theme: "light",
		lineHeight: 1.6,
	});
	const [showControls, setShowControls] = useState(false);

	const activeChapter = cachedChapters?.[currentChapterIndex];

	// Load saved settings from local storage
	useEffect(() => {
		const saved = localStorage.getItem("reader-settings");
		if (saved) {
			try {
				setSettings(JSON.parse(saved));
			} catch (e) {}
		}
	}, []);

	// Save settings
	useEffect(() => {
		localStorage.setItem("reader-settings", JSON.stringify(settings));
	}, [settings]);

	// Save Progress Debounced
	const debouncedSave = useDebounceCallback(
		async (chapterId: string, progress: number) => {
			if (!userId) return; // Don't save for guests
			await saveReadingProgress(project.id, chapterId, progress);
		},
		1000,
	);

	const handleProgressUpdate = (progress: number) => {
		if (activeChapter) {
			debouncedSave(activeChapter.id, progress);
		}
	};

	// When chapter changes, we might want to reset the progress to 0 for the new chapter
	// UNLESS it matches the initialProgress chapter (handled by passing explicit initialProgress to PaginatedContent)
	// But PaginatedContent is keyed by chapterId, so it remounts.
	// We need to pass the initialProgress ONLY if the current chapter matches the initial one.

	const chapterInitialProgress =
		activeChapter?.id === initialProgress?.chapterId
			? initialProgress.progress
			: 0;

	const handleNextChapter = () => {
		if (currentChapterIndex < (cachedChapters?.length || 0) - 1) {
			setCurrentChapterIndex((prev) => prev + 1);
			// Window scroll reset handled by PaginatedContent mount
		}
	};

	const handlePrevChapter = () => {
		if (currentChapterIndex > 0) {
			setCurrentChapterIndex((prev) => prev - 1);
		}
	};

	if (!activeChapter) {
		return (
			<div className="flex items-center justify-center h-screen">
				No content available.
			</div>
		);
	}

	return (
		<>
			<div className="relative h-screen w-screen overflow-hidden">
				<PaginatedContent
					key={activeChapter.id}
					chapterId={activeChapter.id}
					content={activeChapter.content || "No content."}
					settings={settings}
					initialProgress={chapterInitialProgress}
					onTap={() => setShowControls(!showControls)}
					onNextChapter={handleNextChapter}
					onPrevChapter={handlePrevChapter}
					onProgressChange={handleProgressUpdate}
					hasNextChapter={
						currentChapterIndex < (cachedChapters?.length || 0) - 1
					}
					hasPrevChapter={currentChapterIndex > 0}
				/>
			</div>

			<ReaderControls
				isVisible={showControls}
				onClose={() => setShowControls(false)}
				settings={settings}
				onSettingsChange={setSettings}
				currentChapterTitle={activeChapter.title}
				onPreviousChapter={handlePrevChapter}
				onNextChapter={handleNextChapter}
				hasPreviousChapter={currentChapterIndex > 0}
				hasNextChapter={currentChapterIndex < (cachedChapters?.length || 0) - 1}
			/>
		</>
	);
}

// Inner component to handle the complex CSS column pagination logic
function PaginatedContent({
	chapterId,
	content,
	settings,
	initialProgress,
	onTap,
	onNextChapter,
	onPrevChapter,
	onProgressChange,
	hasNextChapter,
	hasPrevChapter,
}: {
	chapterId: string;
	content: string;
	settings: ReaderSettings;
	initialProgress: number;
	onTap: () => void;
	onNextChapter: () => void;
	onPrevChapter: () => void;
	onProgressChange: (p: number) => void;
	hasNextChapter: boolean;
	hasPrevChapter: boolean;
}) {
	const [page, setPage] = useState(0);
	const [totalPages, setTotalPages] = useState(1);
	const containerRef = useRef<HTMLDivElement>(null);
	const hasRestoredRef = useRef(false);

	// Measure pages
	// biome-ignore lint/correctness/useExhaustiveDependencies: `content` and `settings` affect the component's dimensions, which this effect measures.
	useEffect(() => {
		if (!containerRef.current) return;

		const measure = () => {
			const scrollW = containerRef.current?.scrollWidth || 0;
			const clientW = containerRef.current?.clientWidth || window.innerWidth;
			const pages = Math.ceil(scrollW / clientW) || 1;
			setTotalPages(pages);

			// Restore position if first measurement
			if (!hasRestoredRef.current && initialProgress > 0) {
				const target = Math.floor(pages * initialProgress);
				setPage(Math.min(target, pages - 1));
				hasRestoredRef.current = true;
			}
		};

		const timer = setTimeout(measure, 100);
		window.addEventListener("resize", measure);
		return () => {
			window.removeEventListener("resize", measure);
			clearTimeout(timer);
		};
	}, [content, settings, initialProgress]);

	// Report progress whenever page changes
	useEffect(() => {
		if (totalPages > 0) {
			// Calculate progress (0.0 to 1.0)
			const p = page / totalPages;
			onProgressChange(p);
		}
	}, [page, totalPages, onProgressChange]);

	const handlePageTurn = (direction: "next" | "prev") => {
		if (direction === "next") {
			if (page < totalPages - 1) {
				setPage((p) => p + 1);
			} else if (hasNextChapter) {
				onNextChapter();
			}
		} else {
			if (page > 0) {
				setPage((p) => p - 1);
			} else if (hasPrevChapter) {
				onPrevChapter();
			}
		}
	};

	const getThemeStyles = () => {
		switch (settings.theme) {
			case "dark":
				return "bg-zinc-900 text-zinc-300";
			case "sepia":
				return "bg-[#f4ecd8] text-[#5b4636]";
			default:
				return "bg-white text-zinc-800";
		}
	};

	const handleClick = (e: React.MouseEvent) => {
		const width = window.innerWidth;
		const x = e.clientX;

		if (x > width * 0.3 && x < width * 0.7) {
			onTap();
		} else if (x < width * 0.3) {
			handlePageTurn("prev");
		} else {
			handlePageTurn("next");
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" || e.key === " ") {
			onTap();
		} else if (e.key === "ArrowRight") {
			handlePageTurn("next");
		} else if (e.key === "ArrowLeft") {
			handlePageTurn("prev");
		}
	};

	return (
		<div
			role="button"
			tabIndex={0}
			className={`h-full w-full ${getThemeStyles()} transition-colors duration-300 select-none focus:outline-none`}
			onClick={handleClick}
			onKeyDown={handleKeyDown}
		>
			<div
				ref={containerRef}
				className={`h-full ${settings.fontFamily}`}
				style={{
					columnWidth: "100vw",
					columnGap: "40px",
					height: "100vh",
					width: "100vw",
					fontSize: `${settings.fontSize}px`,
					lineHeight: settings.lineHeight,
					textAlign: "justify",
					padding: "40px 20px 60px 20px",
					boxSizing: "border-box",
					transform: `translateX(calc(-${page} * (100vw + 40px)))`,
					transition: "transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)",
				}}
			>
				{content.split("\n").map((para, i) =>
					para.trim() ? (
						// biome-ignore lint/suspicious/noArrayIndexKey: Static content, order will not change
						<p key={i} className="mb-4 indent-6">
							{para}
						</p>
					) : (
						// biome-ignore lint/suspicious/noArrayIndexKey: Static content, order will not change
						<br key={i} />
					),
				)}
				<div className="break-before-column h-[50vh] flex items-center justify-center text-muted-foreground opacity-50">
					<span className="text-sm">End of Chapter</span>
				</div>
			</div>

			<div
				className={`fixed bottom-4 right-6 text-xs font-mono opacity-50 pointer-events-none ${settings.theme === "dark" ? "text-white" : "text-black"}`}
			>
				Page {page + 1} of {totalPages}
			</div>
		</div>
	);
}
