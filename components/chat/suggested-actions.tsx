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
  chatId,
  sendMessage,
  selectedProject,
}: SuggestedActionsProps) {
  const suggestedActions = useMemo<SuggestedAction[]>(() => {
    const projectName = selectedProject?.name ?? "this world";

    return [
      {
        icon: <UsersIcon className="size-5" />,
        title: "Create a Character",
        description: "Design a memorable character with rich backstory",
        prompt: `Create a detailed character for ${projectName}. Include their appearance, personality traits, motivations, secrets, and how they connect to existing elements in the world.`,
        gradient: "from-violet-500/20 to-purple-500/20",
      },
      {
        icon: <MapPinIcon className="size-5" />,
        title: "Design a Location",
        description: "Craft an immersive setting with sensory details",
        prompt: `Design a compelling location for ${projectName}. Describe its atmosphere, notable landmarks, inhabitants, history, and hidden secrets that could drive story hooks.`,
        gradient: "from-emerald-500/20 to-green-500/20",
      },
      {
        icon: <BookOpenIcon className="size-5" />,
        title: "Outline a Chapter",
        description: "Structure a chapter with key beats and tension",
        prompt: `Help me outline a chapter for ${projectName}. Include the opening hook, rising action, key character moments, climax, and how it advances the overall narrative.`,
        gradient: "from-blue-500/20 to-cyan-500/20",
      },
      {
        icon: <CalendarIcon className="size-5" />,
        title: "Generate Timeline",
        description: "Map out events and their connections",
        prompt: `Create a timeline of significant events for ${projectName}. Include historical moments, character-defining events, and how they shape the current state of the world.`,
        gradient: "from-orange-500/20 to-amber-500/20",
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
              window.history.pushState({}, "", `/chat/${chatId}`);
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
