import type { Chapter } from "@/lib/db/schema";

const LEADING_MARKER_REGEX = /^[-*()\d.\s]+/;
const CHAPTER_SPLIT_REGEX = /[-–—:]/;

function cleanLine(line: string): string {
  return line.replace(LEADING_MARKER_REGEX, "").trim();
}

export type ChapterPlan = {
  sequence: number;
  title: string;
  notes?: string;
};

export function extractChaptersFromText(text: string): ChapterPlan[] {
  return text
    .split("\n")
    .map((line) => cleanLine(line))
    .filter((line) => line.length > 0)
    .map((line, index) => {
      const [title, ...noteParts] = line.split(CHAPTER_SPLIT_REGEX);
      const joinedNotes = noteParts.join(":").trim();

      return {
        sequence: index + 1,
        title: title.trim(),
        notes: joinedNotes.length > 0 ? joinedNotes : undefined,
      } satisfies ChapterPlan;
    });
}

export function describeChapterStatus(chapter: Chapter): string {
  const noteSuffix = chapter.notes ? ` (${chapter.notes})` : "";

  if (chapter.status === "drafted") {
    return `Drafted: ${chapter.title}${noteSuffix}`;
  }

  if (chapter.status === "drafting") {
    return `Drafting: ${chapter.title}${noteSuffix}`;
  }

  return `Planned: ${chapter.title}${noteSuffix}`;
}

export function calculateProgress(chapters: Chapter[]): number {
  if (chapters.length === 0) {
    return 0;
  }

  const completed = chapters.filter((chapterItem) =>
    ["drafted", "review"].includes(chapterItem.status)
  ).length;

  return Math.round((completed / chapters.length) * 100);
}
