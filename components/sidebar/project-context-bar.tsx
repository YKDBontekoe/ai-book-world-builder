"use client";

import { ChevronDownIcon, FolderIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ProjectSummary } from "@/lib/project-context";
import { cn } from "@/lib/utils";

type ProjectContextBarProps = {
  projects: ProjectSummary[];
  selectedProject?: ProjectSummary | null;
  selectedProjectId?: string | null;
  onProjectSelect: (projectId: string) => void;
  className?: string;
};

function PureProjectContextBar({
  projects,
  selectedProject,
  selectedProjectId,
  onProjectSelect,
  className,
}: ProjectContextBarProps) {
  const router = useRouter();

  return (
    <div
      className={cn(
        "flex items-center gap-3 border-b bg-gradient-to-r from-muted/30 to-muted/10 px-4 py-2",
        className
      )}
    >
      {/* Project Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className="h-8 gap-2 bg-background/50 backdrop-blur-sm"
            size="sm"
            variant="outline"
          >
            <FolderIcon className="size-4" />
            <span className="max-w-[200px] truncate font-medium">
              {selectedProject?.name ?? "Select project"}
            </span>
            <ChevronDownIcon className="size-3 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          {projects.length === 0 ? (
            <div className="px-2 py-4 text-center text-muted-foreground text-sm">
              No projects yet
            </div>
          ) : (
            <>
              {projects.map((project) => (
                <DropdownMenuItem
                  className={cn(
                    "cursor-pointer gap-2",
                    project.id === selectedProjectId && "bg-accent"
                  )}
                  key={project.id}
                  onClick={() => onProjectSelect(project.id)}
                >
                  <FolderIcon className="size-4" />
                  <span className="truncate">{project.name}</span>
                  {project.id === selectedProjectId && (
                    <Badge className="ml-auto" variant="secondary">
                      Active
                    </Badge>
                  )}
                </DropdownMenuItem>
              ))}
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer gap-2 text-primary"
            onClick={() => router.push("/projects/new")}
          >
            <PlusIcon className="size-4" />
            Create new project
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Project Info */}
      {selectedProject && (
        <div className="hidden items-center gap-2 md:flex">
          <span className="text-muted-foreground text-xs">
            Project context active
          </span>
          <Link
            className="text-primary text-xs underline-offset-4 hover:underline"
            href={`/projects/${selectedProject.id}`}
          >
            View details →
          </Link>
        </div>
      )}

      {/* Quick Actions */}
      <div className="ml-auto flex items-center gap-2">
        {selectedProject && (
          <div className="hidden items-center gap-1 lg:flex">
            <Button
              asChild
              className="h-7 gap-1 text-xs"
              size="sm"
              variant="ghost"
            >
              <Link href={`/projects/${selectedProject.id}/entities/new`}>
                <PlusIcon className="size-3" />
                Entity
              </Link>
            </Button>
            <Button
              asChild
              className="h-7 gap-1 text-xs"
              size="sm"
              variant="ghost"
            >
              <Link href={`/projects/${selectedProject.id}/drafts`}>
                <PlusIcon className="size-3" />
                Draft
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export const ProjectContextBar = memo(PureProjectContextBar);
