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
        className="mb-8 flex items-center justify-center gap-4"
        initial={{ opacity: 0, scale: 0.95 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <div className="relative flex items-center justify-center">
             <div className="absolute inset-0 animate-pulse rounded-full bg-primary/20 blur-xl" />
             <div className="relative flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/80 to-primary text-primary-foreground shadow-xl ring-1 ring-white/20 backdrop-blur-md">
                <SparklesIcon className="size-8" />
             </div>
        </div>
      </motion.div>

      {/* Main greeting */}
      <div className="text-center">
        <motion.h1
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text font-bold text-3xl text-transparent md:text-4xl tracking-tight"
            exit={{ opacity: 0, y: 10 }}
            initial={{ opacity: 0, y: 10 }}
            transition={{ delay: 0.3 }}
        >
            {selectedProject
            ? `Welcome to ${selectedProject.name}`
            : "Build Your World"}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto mt-4 max-w-lg text-lg text-muted-foreground md:text-xl font-light"
            exit={{ opacity: 0, y: 10 }}
            initial={{ opacity: 0, y: 10 }}
            transition={{ delay: 0.4 }}
        >
            {selectedProject
            ? "Ready to expand your universe? I can help you draft scenes, develop characters, or brainstorm plot twists."
            : "Start by selecting a project or create a new universe to begin your journey."}
        </motion.p>
      </div>

      {/* Feature Pills */}
      <motion.div
        className="mt-8 flex flex-wrap justify-center gap-2 px-2"
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.5 }}
      >
          <div className="flex items-center gap-1.5 rounded-full border bg-background/50 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm shadow-sm whitespace-nowrap">
            <UsersIcon className="size-3.5 shrink-0" /> Characters
          </div>
          <div className="flex items-center gap-1.5 rounded-full border bg-background/50 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm shadow-sm whitespace-nowrap">
            <MapPinIcon className="size-3.5 shrink-0" /> Locations
          </div>
          <div className="flex items-center gap-1.5 rounded-full border bg-background/50 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm shadow-sm whitespace-nowrap">
            <BookOpenIcon className="size-3.5 shrink-0" /> Lore
          </div>
      </motion.div>
    </div>
  );
};
