"use client";

import type { UseChatHelpers } from "@ai-sdk/react";
import { motion } from "framer-motion";
import {
  BookOpenIcon,
  CalendarIcon,
  MapPinIcon,
  UsersIcon,
} from "lucide-react";
import { memo, useMemo } from "react";
import { Button } from "@/components/ui/button";
import type { ProjectSummary } from "@/lib/project-context";
import type { ChatMessage } from "@/lib/types";
import { cn } from "@/lib/utils";
import type { VisibilityType } from "./visibility-selector";

type SuggestedAction = {
  icon: React.ReactNode;
  title: string;
  description: string;
  prompt: string;
  gradient: string;
};

type SuggestedActionsProps = {
  chatId: string;
  sendMessage: UseChatHelpers<ChatMessage>["sendMessage"];
  selectedVisibilityType: VisibilityType;
  selectedProject?: ProjectSummary | null;
};

function PureSuggestedActions({
  sendMessage,
  selectedProject,
}: SuggestedActionsProps) {
  const suggestedActions = useMemo<SuggestedAction[]>(() => {
    const projectName = selectedProject?.name ?? "this world";

    return [
      {
        icon: <BookOpenIcon className="size-5" />,
        title: "Conjure a New World",
        description: "Let the AI build a unique setting from scratch",
        prompt: `I want to create a new book. Act as my creative partner. Ask me a few questions to understand the genre and tone I'm looking for, then generate a comprehensive Story Bible with initial characters, locations, and lore using the createEntity tool.`,
        gradient: "from-indigo-500/20 to-purple-500/20",
      },
      {
        icon: <UsersIcon className="size-5" />,
        title: "Flesh Out a Protagonist",
        description: "Deep dive into a character's soul",
        prompt: `Help me design a complex protagonist for ${projectName}. I need a character with conflicting internal motivations and a dark secret. Use the createEntity tool to save them to the project database once we refine the details.`,
        gradient: "from-pink-500/20 to-rose-500/20",
      },
      {
        icon: <MapPinIcon className="size-5" />,
        title: "Build a Magic System",
        description: "Define the rules of your universe",
        prompt: `I need a magic system (or technology) for ${projectName}. Propose 3 unique concepts that tie into the themes of the world. Once I choose one, create the necessary lore entries using createEntity.`,
        gradient: "from-cyan-500/20 to-blue-500/20",
      },
      {
        icon: <CalendarIcon className="size-5" />,
        title: "Draft Chapter One",
        description: "Start writing the actual prose",
        prompt: `Let's start writing Chapter 1 for ${projectName}. Review the current outline and characters. validte that we are ready to write, then generate the opening scene.`,
        gradient: "from-amber-500/20 to-orange-500/20",
      },
    ];
  }, [selectedProject]);

  return (
    <div
      className="grid w-full gap-3 sm:grid-cols-2"
      data-testid="suggested-actions"
    >
      {suggestedActions.map((action, index) => (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          initial={{ opacity: 0, y: 20 }}
          key={action.title}
          transition={{ delay: 0.05 * index }}
        >
          <Button
            className={cn(
              "group relative h-auto w-full flex-col items-start gap-2 overflow-hidden rounded-xl border bg-gradient-to-br p-4 text-left transition-all duration-300",
              "hover:border-primary/50 hover:shadow-lg",
              action.gradient
            )}
            onClick={() => {
              sendMessage({
                role: "user",
                parts: [{ type: "text", text: action.prompt }],
              });
            }}
            variant="ghost"
          >
            {/* Icon */}
            <div className="flex size-10 items-center justify-center rounded-lg bg-background/80 text-foreground shadow-sm transition-transform group-hover:scale-110">
              {action.icon}
            </div>

            {/* Content */}
            <div className="space-y-1">
              <div className="font-semibold text-sm">{action.title}</div>
              <div className="text-muted-foreground text-xs">
                {action.description}
              </div>
            </div>

            {/* Hover effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          </Button>
        </motion.div>
      ))}
    </div>
  );
}

export const SuggestedActions = memo(
  PureSuggestedActions,
  (prevProps, nextProps) => {
    if (prevProps.chatId !== nextProps.chatId) {
      return false;
    }
    if (prevProps.selectedVisibilityType !== nextProps.selectedVisibilityType) {
      return false;
    }
    if (prevProps.selectedProject?.id !== nextProps.selectedProject?.id) {
      return false;
    }

    return true;
  }
);
