"use client";

import { FileText } from "lucide-react";
import { useId } from "react";

import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type GenerationSettings } from "@/lib/db/schema";

import { genreOptions, type SettingsChangeHandler } from "./constants";

interface MetadataSectionProps {
  settings: Partial<GenerationSettings>;
  onSettingChange: SettingsChangeHandler;
}

export function MetadataSection({ settings, onSettingChange }: MetadataSectionProps) {
  const titleId = useId();
  const authorId = useId();
  const genreId = useId();

  return (
    <CollapsibleSection
      title="Book Metadata"
      icon={<FileText className="h-5 w-5" />}
      accentColor="amber"
      defaultOpen
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={titleId}>Book Title</Label>
          <input
            id={titleId}
            type="text"
            className="flex h-10 w-full rounded-xl border border-border/50 bg-background/50 px-3 py-2 text-sm backdrop-blur-sm transition-colors focus:ring-2 focus:ring-primary/20"
            placeholder="Enter book title..."
            value={settings.bookTitle ?? ""}
            onChange={(e) => onSettingChange("bookTitle", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={authorId}>Author Name</Label>
          <input
            id={authorId}
            type="text"
            className="flex h-10 w-full rounded-xl border border-border/50 bg-background/50 px-3 py-2 text-sm backdrop-blur-sm transition-colors focus:ring-2 focus:ring-primary/20"
            placeholder="Enter author name..."
            value={settings.authorName ?? ""}
            onChange={(e) => onSettingChange("authorName", e.target.value)}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor={genreId}>Genre</Label>
          <Select id={genreId} aria-label="Genre" value={settings.genre} onValueChange={(v) => onSettingChange("genre", v)}>
            <SelectTrigger
              id={genreId}
              aria-label="Genre"
              className="rounded-xl border-border/50 bg-background/50"
            >
              <SelectValue placeholder="Select genre..." />
            </SelectTrigger>
            <SelectContent>
              {genreOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </CollapsibleSection>
  );
}
