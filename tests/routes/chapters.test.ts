import { expect, test } from "@playwright/test";

import {
  calculateProgress,
  describeChapterStatus,
  extractChaptersFromText,
} from "@/lib/story/chapters";

const baseDate = new Date("2024-01-01T00:00:00.000Z");

const chapterTemplate = {
  id: "chapter-1",
  createdAt: baseDate,
  updatedAt: baseDate,
  title: "",
  notes: "",
  status: "planned",
  sequence: 1,
  outlineId: "outline-1",
  volumeId: "volume-1",
  projectId: "project-1",
};

test("extractChaptersFromText parses titles and notes with order", () => {
  const chapters = extractChaptersFromText(
    "1. Arrival at the gates - Introduce stakes\n2) Crossing the bridge: tension rises"
  );

  expect(chapters).toEqual([
    { sequence: 1, title: "Arrival at the gates", notes: "Introduce stakes" },
    { sequence: 2, title: "Crossing the bridge", notes: "tension rises" },
  ]);
});

test("calculateProgress counts drafted chapters", () => {
  const progress = calculateProgress([
    { ...chapterTemplate, id: "chapter-a", status: "drafted" },
    { ...chapterTemplate, id: "chapter-b", status: "planned", sequence: 2 },
  ]);

  expect(progress).toBe(50);
});

test("describeChapterStatus annotates notes", () => {
  const description = describeChapterStatus({
    ...chapterTemplate,
    title: "Council Meeting",
    status: "drafting",
    notes: "Set up rival factions",
  });

  expect(description).toContain("Drafting: Council Meeting");
  expect(description).toContain("Set up rival factions");
});
