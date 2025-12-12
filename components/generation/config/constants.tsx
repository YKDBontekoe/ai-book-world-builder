import type { JSX } from "react";

import { BookOpen, FileText, Image, PenTool, RefreshCw, User } from "lucide-react";

import { type GenerationSettings } from "@/lib/db/schema";

export type ImageModelOption = {
  id: string;
  name: string;
  provider: string;
  pricing: string;
  description: string;
};

export const imageModels: ImageModelOption[] = [
  {
    id: "dall-e-3",
    name: "DALL-E 3",
    provider: "OpenAI",
    pricing: "$0.04/image",
    description: "High quality, artistic",
  },
  {
    id: "midjourney",
    name: "Midjourney",
    provider: "Midjourney",
    pricing: "$0.02/image",
    description: "Stylized, creative",
  },
  {
    id: "stable-diffusion",
    name: "Stable Diffusion XL",
    provider: "Stability",
    pricing: "$0.002/image",
    description: "Fast, customizable",
  },
];

export const genreOptions = [
  { value: "fantasy", label: "Fantasy" },
  { value: "scifi", label: "Science Fiction" },
  { value: "mystery", label: "Mystery" },
  { value: "romance", label: "Romance" },
  { value: "thriller", label: "Thriller" },
  { value: "literary", label: "Literary Fiction" },
  { value: "horror", label: "Horror" },
  { value: "historical", label: "Historical Fiction" },
];

export type SettingsChangeHandler = <K extends keyof GenerationSettings>(
  key: K,
  value: GenerationSettings[K],
) => void;

export type BooleanSettingKey =
  | "includePrologue"
  | "includeEpilogue"
  | "generateBackCoverBlurb"
  | "generateFrontCover"
  | "generateCharacterSheets"
  | "generateChapterSummaries"
  | "generateTableOfContents"
  | "runConsistencyCheck";

export const additionalOptions: {
  key: BooleanSettingKey;
  label: string;
  desc: string;
  icon: JSX.Element;
}[] = [
  {
    key: "includePrologue",
    label: "Prologue",
    desc: "Opening scene",
    icon: <BookOpen className="h-4 w-4" />,
  },
  {
    key: "includeEpilogue",
    label: "Epilogue",
    desc: "Closing scene",
    icon: <BookOpen className="h-4 w-4" />,
  },
  {
    key: "generateBackCoverBlurb",
    label: "Back Cover Blurb",
    desc: "Marketing text",
    icon: <PenTool className="h-4 w-4" />,
  },
  {
    key: "generateFrontCover",
    label: "Front Cover Art",
    desc: "AI cover image",
    icon: <Image className="h-4 w-4" />,
  },
  {
    key: "generateCharacterSheets",
    label: "Character Sheets",
    desc: "Character profiles",
    icon: <User className="h-4 w-4" />,
  },
  {
    key: "generateChapterSummaries",
    label: "Chapter Summaries",
    desc: "Chapter synopses",
    icon: <FileText className="h-4 w-4" />,
  },
  {
    key: "generateTableOfContents",
    label: "Table of Contents",
    desc: "Auto TOC",
    icon: <FileText className="h-4 w-4" />,
  },
  {
    key: "runConsistencyCheck",
    label: "Consistency Check",
    desc: "Quality analysis",
    icon: <RefreshCw className="h-4 w-4" />,
  },
];
