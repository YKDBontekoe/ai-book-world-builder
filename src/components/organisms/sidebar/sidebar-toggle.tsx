import { PanelLeftIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { Button } from "@/components/atoms/button";
import { type SidebarTrigger, useSidebar } from "@/components/atoms/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/atoms/tooltip";
import { cn } from "@/lib/utils";

export function SidebarToggle({
  className,
}: ComponentProps<typeof SidebarTrigger>) {
  const { toggleSidebar } = useSidebar();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          className={cn("h-8 px-2 md:h-fit md:px-2", className)}
          data-testid="sidebar-toggle-button"
          onClick={toggleSidebar}
          variant="outline"
          aria-label="Toggle Sidebar"
        >
          <PanelLeftIcon size={16} />
        </Button>
      </TooltipTrigger>
      <TooltipContent align="start" className="hidden md:block">
        Toggle Sidebar
      </TooltipContent>
    </Tooltip>
  );
}
