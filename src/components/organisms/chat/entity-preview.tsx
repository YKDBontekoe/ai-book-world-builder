"use client";

import {
  BookOpen,
  Calendar,
  LinkIcon,
  MapPin,
  Package,
  User,
  Users,
  TagIcon,
} from "lucide-react";
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
      startDate?: string | null;
      endDate?: string | null;
      attributes?: Array<{ name: string; value: string }>;
      relationships?: Array<{ type: string; targetEntityId: string }>;
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
        Error creating/updating entity: {result.error}
      </div>
    );
  }

  if (!result.entity) return null;

  const Icon =
    entityIcons[result.entity.kind as keyof typeof entityIcons] || BookOpen;
  const colorClass =
    entityColors[result.entity.kind as keyof typeof entityColors] ||
    entityColors.other;

  const hasAttributes =
    result.entity.attributes && result.entity.attributes.length > 0;
  const hasRelationships =
    result.entity.relationships && result.entity.relationships.length > 0;

  return (
    <div className="group relative flex w-full max-w-sm flex-col overflow-hidden rounded-2xl border bg-white/50 text-card-foreground shadow-sm backdrop-blur-sm transition-all hover:shadow-md dark:bg-black/20">
      <div className="flex flex-row items-center gap-3 border-b bg-muted/20 px-4 py-3">
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-xl ring-1 ring-black/5 dark:ring-white/10",
            colorClass.replace("bg-", "bg- bg-opacity-20")
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
      
      <div className="flex flex-col gap-3 px-4 py-3">
        {result.entity.summary && (
          <div className="text-muted-foreground text-sm leading-relaxed">
            {result.entity.summary}
          </div>
        )}

        {/* Dates */}
        {(result.entity.startDate || result.entity.endDate) && (
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                {result.entity.startDate && (
                    <span className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded">
                        Start: {new Date(result.entity.startDate).toLocaleDateString()}
                    </span>
                )}
                {result.entity.endDate && (
                    <span className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded">
                         End: {new Date(result.entity.endDate).toLocaleDateString()}
                    </span>
                )}
            </div>
        )}

        {/* Attributes */}
        {hasAttributes && (
          <div className="grid grid-cols-2 gap-2">
            {result.entity.attributes?.slice(0, 4).map((attr, i) => (
              <div
                key={i}
                className="flex flex-col rounded-md border bg-muted/30 p-2"
              >
                <span className="text-[10px] uppercase text-muted-foreground font-semibold">
                  {attr.name}
                </span>
                <span className="text-xs font-medium truncate" title={attr.value}>
                  {attr.value}
                </span>
              </div>
            ))}
            {(result.entity.attributes?.length || 0) > 4 && (
                <div className="text-[10px] text-muted-foreground self-center">
                    +{result.entity.attributes!.length - 4} more
                </div>
            )}
          </div>
        )}
      </div>

      {projectId && result.entity.id && (
        <div className="border-t bg-muted/20 px-4 py-2">
          <Link
            className="text-primary text-xs hover:underline"
            href={`/projects/${projectId}/entities/${result.entity.id}`}
          >
            View details & edit →
          </Link>
        </div>
      )}
    </div>
  );
}
