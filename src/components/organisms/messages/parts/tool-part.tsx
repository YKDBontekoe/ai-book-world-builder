"use client";

import { ToolRenderer } from "@/components/organisms/messages/tool-renderer";

interface ToolPartProps {
  part: any; // Using any to match existing flexibility, or precise type from ai SDK
  isReadonly: boolean;
}

export function ToolPart({ part, isReadonly }: ToolPartProps) {
  return <ToolRenderer part={part} isReadonly={isReadonly} />;
}
