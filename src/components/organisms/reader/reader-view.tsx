"use client";

import { useState, useEffect, useRef } from "react";
import { ReaderControls, type ReaderSettings } from "@/components/organisms/reader/reader-controls";
import type { Project } from "@/lib/db/schema";
import { useQuery } from "@tanstack/react-query";

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
}

export function ReaderView({ project, chapters, userId }: ReaderViewProps) {
  // --- Data Persistence ---
  // We use useQuery to cache the chapters. Even though we have initialData,
  // this ensures that the data is added to the persisted cache for offline use.
  const { data: cachedChapters } = useQuery({
    queryKey: ['project-chapters', project.id],
    queryFn: async () => chapters, // We already have them, this is just to seed cache
    initialData: chapters,
    staleTime: Infinity,
  });

  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [settings, setSettings] = useState<ReaderSettings>({
    fontSize: 18,
    fontFamily: 'font-serif',
    theme: 'light',
    lineHeight: 1.6
  });
  const [showControls, setShowControls] = useState(false);

  // Pagination State
  // We simulate pages by calculating how far to scroll horizontally
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const contentRef = useRef<HTMLDivElement>(null); // We need to access the inner div of ReaderContent... which is tricky across components.
  // Let's integrate the content rendering here or pass ref.

  // Actually, ReaderContent needs to handle the layout.
  // Let's rethink: The best way to do paginated text on web is:
  // Container: overflow: hidden; width: 100vw; height: 100vh;
  // Inner: columns: 100vw; height: 100vh; transform: translateX(-100vw * page);

  // We need to measure the scrollWidth of the inner container to know total pages.

  const activeChapter = cachedChapters?.[currentChapterIndex];

  // Load saved settings from local storage
  useEffect(() => {
    const saved = localStorage.getItem('reader-settings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  // Save settings
  useEffect(() => {
    localStorage.setItem('reader-settings', JSON.stringify(settings));
  }, [settings]);

  const handleNextChapter = () => {
    if (currentChapterIndex < (cachedChapters?.length || 0) - 1) {
      setCurrentChapterIndex(prev => prev + 1);
      setCurrentPage(0);
      window.scrollTo(0,0);
    }
  };

  const handlePrevChapter = () => {
    if (currentChapterIndex > 0) {
      setCurrentChapterIndex(prev => prev - 1);
      setCurrentPage(0);
       window.scrollTo(0,0);
    }
  };

  if (!activeChapter) {
      return <div className="flex items-center justify-center h-screen">No content available.</div>;
  }

  return (
    <>
      <div className="relative h-screen w-screen overflow-hidden">
        {/* We pass a key to force re-render on chapter change to reset scroll/layout */}
        <PaginatedContent
           key={activeChapter.id}
           content={activeChapter.content || "No content."}
           settings={settings}
           onTap={() => setShowControls(!showControls)}
           onNextChapter={handleNextChapter}
           onPrevChapter={handlePrevChapter}
           hasNextChapter={currentChapterIndex < (cachedChapters?.length || 0) - 1}
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
    content,
    settings,
    onTap,
    onNextChapter,
    onPrevChapter,
    hasNextChapter,
    hasPrevChapter
}: {
    content: string,
    settings: ReaderSettings,
    onTap: () => void,
    onNextChapter: () => void,
    onPrevChapter: () => void,
    hasNextChapter: boolean,
    hasPrevChapter: boolean
}) {
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    // Measure pages
    useEffect(() => {
        if (!containerRef.current) return;

        // Wait for layout
        const measure = () => {
            const scrollW = containerRef.current?.scrollWidth || 0;
            const clientW = containerRef.current?.clientWidth || window.innerWidth;
            // The logic: scrollWidth will be multiple of clientWidth (approx) if columns are working
            const pages = Math.ceil(scrollW / clientW);
            setTotalPages(pages);
        };

        // Small timeout to allow font rendering/layout
        const timer = setTimeout(measure, 100);
        window.addEventListener('resize', measure);
        return () => {
            window.removeEventListener('resize', measure);
            clearTimeout(timer);
        };
    }, [content, settings]); // Re-measure when content or settings change

    const handlePageTurn = (direction: 'next' | 'prev') => {
        if (direction === 'next') {
            if (page < totalPages - 1) {
                setPage(p => p + 1);
            } else if (hasNextChapter) {
                onNextChapter();
            }
        } else {
            if (page > 0) {
                setPage(p => p - 1);
            } else if (hasPrevChapter) {
                 // We don't jump to end of previous chapter automatically as that's complex state,
                 // we just go to start of previous chapter for now.
                onPrevChapter();
            }
        }
    };

    const getThemeStyles = () => {
        switch (settings.theme) {
          case "dark": return "bg-zinc-900 text-zinc-300";
          case "sepia": return "bg-[#f4ecd8] text-[#5b4636]";
          default: return "bg-white text-zinc-800";
        }
    };

    // Interaction Zones
    const handleClick = (e: React.MouseEvent) => {
        const width = window.innerWidth;
        const x = e.clientX;

        if (x > width * 0.3 && x < width * 0.7) {
            onTap();
        } else if (x < width * 0.3) {
            handlePageTurn('prev');
        } else {
            handlePageTurn('next');
        }
    };

    return (
        <div
          className={`h-full w-full ${getThemeStyles()} transition-colors duration-300 select-none`}
          onClick={handleClick}
        >
             {/* The Sliding Container */}
            <div
               ref={containerRef}
               className={`h-full ${settings.fontFamily}`}
               style={{
                   // The Magic of CSS Columns for Pagination
                   columnWidth: '100vw',
                   columnGap: '40px', // Gap between pages
                   height: '100vh',
                   width: '100vw',

                   // Typography
                   fontSize: `${settings.fontSize}px`,
                   lineHeight: settings.lineHeight,
                   textAlign: 'justify',

                   // Layout
                   padding: '40px 20px 60px 20px', // Top/Bottom padding for UI space
                   boxSizing: 'border-box',

                   // The sliding mechanism
                   transform: `translateX(calc(-${page} * (100vw + 40px)))`, // +40px for the gap
                   transition: 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
               }}
            >
               {content.split('\n').map((para, i) => (
                 para.trim() ? <p key={i} className="mb-4 indent-6">{para}</p> : <br key={i} />
               ))}
                {/* End of Chapter Marker */}
                <div className="break-before-column h-[50vh] flex items-center justify-center text-muted-foreground opacity-50">
                    <span className="text-sm">End of Chapter</span>
                </div>
            </div>

            {/* Page Number Indicator */}
            <div className={`fixed bottom-4 right-6 text-xs font-mono opacity-50 pointer-events-none ${settings.theme === 'dark' ? 'text-white' : 'text-black'}`}>
                Page {page + 1} of {totalPages}
            </div>
        </div>
    );
}
