'use client';

import { useQuery } from '@tanstack/react-query';
import { ArrowRight, BookOpen, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';

interface GenerationPreviewProps {
  title: string;
  focus: string;
  projectId: string;
  suggestedEntityIds?: string[];
  suggestedSceneIds?: string[];
}

export function GenerationPreview({
  title,
  focus,
  projectId,
  suggestedEntityIds,
  suggestedSceneIds,
}: GenerationPreviewProps) {
  // Construct the URL with query params to pre-fill the generator
  const params = new URLSearchParams();
  if (focus) params.set('focus', focus);
  if (suggestedEntityIds?.length) params.set('entities', suggestedEntityIds.join(','));
  if (suggestedSceneIds?.length) params.set('scenes', suggestedSceneIds.join(','));

  const generationUrl = `/projects/${projectId}/generate?${params.toString()}`;

  return (
    <GlassCard className="my-4 border-primary/20 bg-primary/5" padding="md">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-foreground">{title}</h3>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-3">
            {focus}
          </p>
          <div className="flex gap-2 text-xs text-muted-foreground mt-2">
            {suggestedEntityIds?.length ? (
              <span className="flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                {suggestedEntityIds.length} Entities
              </span>
            ) : null}
          </div>
        </div>

        <Button asChild className="shrink-0 gap-2">
          <Link href={generationUrl}>
            Start Drafting
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>
    </GlassCard>
  );
}
