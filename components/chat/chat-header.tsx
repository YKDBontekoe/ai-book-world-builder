"use client";

import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { memo } from "react";
import { useWindowSize } from "usehooks-ts";
import {
  VisibilitySelector,
  type VisibilityType,
} from "@/components/chat/visibility-selector";
import { SidebarToggle } from "@/components/sidebar/sidebar-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";

function PureChatHeader({
  chatId,
  projectLabel,
  selectedVisibilityType,
  isReadonly,
}: {
  chatId: string;
  projectLabel?: string | null;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
}) {
  const router = useRouter();
  const { open } = useSidebar();

  const { width: windowWidth } = useWindowSize();

  return (
    <header className="sticky top-0 flex items-center gap-2 bg-background px-2 py-1.5 md:px-2">
      <SidebarToggle />
      {projectLabel && (
        <Badge
          className="inline-flex max-w-[50%] truncate"
          title={projectLabel ?? undefined}
          variant="secondary"
        >
          <span className="truncate">Project: {projectLabel}</span>
        </Badge>
      )}

      <div className="ml-auto flex items-center gap-2">
        {(!open || windowWidth < 768) && (
          <Button
            className="h-8 px-2 md:h-fit md:px-2"
            onClick={() => {
              router.push("/");
              router.refresh();
            }}
            variant="outline"
          >
            <PlusIcon size={16} />
            <span className="md:sr-only">New Chat</span>
          </Button>
        )}

        {!isReadonly && (
          <VisibilitySelector
            chatId={chatId}
            className="flex"
            selectedVisibilityType={selectedVisibilityType}
          />
        )}
      </div>
    </header>
  );
}

export const ChatHeader = memo(PureChatHeader, (prevProps, nextProps) => {
  return (
    prevProps.chatId === nextProps.chatId &&
    prevProps.selectedVisibilityType === nextProps.selectedVisibilityType &&
    prevProps.isReadonly === nextProps.isReadonly &&
    prevProps.projectLabel === nextProps.projectLabel
  );
});
