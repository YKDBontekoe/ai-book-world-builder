"use client";

import React, { createContext, useContext } from "react";
import { useWriterState } from "@/hooks/use-writer-state";
import type { ChapterWithScenes } from "@/lib/types";
import type { Project } from "@/lib/db/schema";

type UseWriterStateReturnType = ReturnType<typeof useWriterState>;

type WriterContextType = UseWriterStateReturnType & {
  project: Project;
};

const WriterContext = createContext<WriterContextType | null>(null);

interface WriterProviderProps {
  children: React.ReactNode;
  project: Project;
  initialStructure?: ChapterWithScenes[];
  initialStructureText?: string;
}

export function WriterProvider({
  children,
  project,
  initialStructure,
  initialStructureText
}: WriterProviderProps) {
  const writerState = useWriterState({
    projectId: project.id,
    initialStructure,
    initialStructureText,
  });

  const value = {
    ...writerState,
    project,
  };

  return (
    <WriterContext.Provider value={value}>
      {children}
    </WriterContext.Provider>
  );
}

export function useWriterContext() {
  const context = useContext(WriterContext);
  if (!context) {
    throw new Error("useWriterContext must be used within a WriterProvider");
  }
  return context;
}
