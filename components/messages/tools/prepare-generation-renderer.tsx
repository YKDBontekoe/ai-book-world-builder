'use client';

import { GenerationPreview } from '@/components/chat/widgets/generation-preview';
import type { ToolRendererProps } from './types';

export function PrepareGenerationRenderer({ part }: ToolRendererProps) {
  // We expect the tool result to contain the confirmation or details
  // But typically the tool args are what we want to display for the preview

  // If the tool has run, we might want to show the widget based on args
  const args = part.args as any;

  // We need the projectId. Often it's in the args or we need to infer it.
  // Ideally the tool args should include projectId or we get it from context.
  // However, the tool definition I wrote didn't include projectId.
  // Let's assume the args *might* have it or we need to get it from somewhere else.
  // Actually, for now, let's assume the user is in a project context so the
  // `GenerationPreview` might need to be smart or we pass projectId in the tool.

  // Let's update the tool definition to include projectId for safety,
  // or use the current URL context if available (but this is inside a message history).
  // Safest is to have projectId in args.

  return (
    <GenerationPreview
      title={args.title}
      focus={args.focus}
      projectId={args.projectId} // We need to add this to the tool!
      suggestedEntityIds={args.suggestedEntityIds}
      suggestedSceneIds={args.suggestedSceneIds}
    />
  );
}
