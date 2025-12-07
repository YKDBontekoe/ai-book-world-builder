"use client";

import { BookOpen, Calendar, MapPin, Package, User, Users } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface EntityPreviewProps {
  result: {
    message?: string;
    entity?: {
      id?: string;
      name: string;
      kind: string;
      summary?: string | null;
    };
    error?: string;
  };
  projectId?: string;
}

const entityIcons = {
  character: User,
  location: MapPin,
  item: Package,
  organization: Users,
  event: Calendar,
  other: BookOpen,
};

const entityColors = {
  character:
    "text-violet-700 bg-violet-100 dark:text-violet-300 dark:bg-violet-900/40",
  location:
    "text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-900/40",
  item: "text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-900/40",
  organization:
    "text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/40",
  event:
    "text-orange-700 bg-orange-100 dark:text-orange-300 dark:bg-orange-900/40",
  other: "text-zinc-700 bg-zinc-100 dark:text-zinc-300 dark:bg-zinc-800/40",
};

export function EntityPreview({ result, projectId }: EntityPreviewProps) {
  if (result.error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-500 text-sm dark:border-red-900 dark:bg-red-950/50">
        Error creating entity: {result.error}
      </div>
    );
  }

  if (!result.entity) return null;

  const Icon =
    entityIcons[result.entity.kind as keyof typeof entityIcons] || BookOpen;
  const colorClass =
    entityColors[result.entity.kind as keyof typeof entityColors] ||
    entityColors.other;

  return (
    <div className="group relative flex w-full max-w-sm flex-col overflow-hidden rounded-2xl border bg-white/50 text-card-foreground shadow-sm backdrop-blur-sm transition-all hover:shadow-md dark:bg-black/20">
      <div className="flex flex-row items-center gap-3 border-b bg-muted/20 px-4 py-3">
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-xl ring-1 ring-black/5 dark:ring-white/10",
            colorClass.replace("bg-", "bg- bg-opacity-20") // Make backgrounds more subtle
          )}
        >
          <Icon size={18} />
        </div>
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="truncate font-medium text-sm">
            {result.entity.name}
          </div>
          <div className="truncate font-medium text-muted-foreground text-xs uppercase tracking-wider opacity-70">
            {result.entity.kind}
          </div>
        </div>
      </div>
      {result.entity.summary && (
        <div className="px-4 py-3 text-muted-foreground text-sm leading-relaxed">
          {result.entity.summary}
        </div>
      )}
      {projectId && result.entity.id && (
        <div className="border-t bg-muted/20 px-4 py-2">
          <Link
            className="text-primary text-xs hover:underline"
            href={`/projects/${projectId}/entities/${result.entity.id}`}
          >
            View details →
          </Link>
        </div>
      )}
    </div>
  );
}
