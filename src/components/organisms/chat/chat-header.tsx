"use client";

import { BookOpenIcon, PlusIcon, KeyboardIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { memo } from "react";
import { useWindowSize } from "usehooks-ts";
import { useBookCanvas } from "@/components/organisms/book-canvas";
import {
  VisibilitySelector,
  type VisibilityType,
} from "@/components/organisms/chat/visibility-selector";
import { SidebarToggle } from "@/components/organisms/sidebar/sidebar-toggle";
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import { useSidebar } from "@/components/atoms/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/atoms/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/atoms/dialog";

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
  const { togglePanel, isOpen: isPanelOpen } = useBookCanvas();

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
        {/* Book Progress Toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="h-8 px-2"
              onClick={togglePanel}
              size="sm"
              variant={isPanelOpen ? "default" : "outline"}
            >
              <BookOpenIcon size={16} />
              <span className="sr-only md:not-sr-only md:ml-1">Book</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isPanelOpen ? "Hide Book Progress" : "Show Book Progress"}
          </TooltipContent>
        </Tooltip>

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

        <Dialog>
          <Tooltip>
            <TooltipTrigger asChild>
              <DialogTrigger asChild>
                <Button className="h-8 px-2" size="sm" variant="outline">
                  <KeyboardIcon size={16} />
                </Button>
              </DialogTrigger>
            </TooltipTrigger>
            <TooltipContent>Keyboard Shortcuts</TooltipContent>
          </Tooltip>
          <DialogContent className="sm:max-w-[425px] rounded-2xl glass-panel">
            <DialogHeader>
              <DialogTitle>Keyboard Shortcuts</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Send Message</span>
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded-lg border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  <span className="text-xs">⌘</span>Enter
                </kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">New Line</span>
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded-lg border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  <span className="text-xs">⇧</span>Enter
                </kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Toggle Sidebar</span>
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded-lg border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  <span className="text-xs">⌘</span>B
                </kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">New Chat</span>
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded-lg border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  <span className="text-xs">⌘</span>N
                </kbd>
              </div>
            </div>
          </DialogContent>
        </Dialog>

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
