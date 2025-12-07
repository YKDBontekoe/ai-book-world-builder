"use client";

import { motion } from "framer-motion";
import {
  BookOpenIcon,
  MapPinIcon,
  SparklesIcon,
  UsersIcon,
} from "lucide-react";
import type { ProjectSummary } from "@/lib/project-context";

type GreetingProps = {
  selectedProject?: ProjectSummary | null;
};

export const Greeting = ({ selectedProject }: GreetingProps) => {
  return (
    <div
      className="mx-auto mt-8 flex size-full max-w-3xl flex-col justify-center px-4 md:mt-16 md:px-8"
      key="overview"
    >
      {/* Animated icon cluster */}
      <motion.div
        animate={{ opacity: 1, scale: 1 }}
        className="mb-6 flex items-center gap-3"
        initial={{ opacity: 0, scale: 0.95 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <div className="-space-x-2 flex">
          <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg">
            <SparklesIcon className="size-5" />
          </div>
          <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-lg">
            <BookOpenIcon className="size-5" />
          </div>
          <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-lg">
            <UsersIcon className="size-5" />
          </div>
          <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg">
            <MapPinIcon className="size-5" />
          </div>
        </div>
      </motion.div>

      {/* Main greeting */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="font-semibold text-2xl md:text-3xl"
        exit={{ opacity: 0, y: 10 }}
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.3 }}
      >
        {selectedProject
          ? `Welcome to ${selectedProject.name}`
          : "Build Your World"}
      </motion.div>

      {/* Subtitle */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="mt-2 text-lg text-zinc-500 md:text-xl"
        exit={{ opacity: 0, y: 10 }}
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.4 }}
      >
        {selectedProject
          ? "Let's continue crafting your story together"
          : "Create characters, locations, and narratives with AI assistance"}
      </motion.div>

      {/* Context hint */}
      {selectedProject && (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-muted/50 px-4 py-2 text-muted-foreground text-sm"
          initial={{ opacity: 0, y: 10 }}
          transition={{ delay: 0.5 }}
        >
          <div className="size-2 animate-pulse rounded-full bg-green-500" />
          AI is context-aware of your project's entities and lore
        </motion.div>
      )}

      {!selectedProject && (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-muted-foreground text-sm"
          initial={{ opacity: 0, y: 10 }}
          transition={{ delay: 0.5 }}
        >
          Select a project above to ground AI responses in your world
        </motion.div>
      )}
    </div>
  );
};
