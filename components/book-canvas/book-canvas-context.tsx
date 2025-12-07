"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { GenerationStatus } from "@/lib/db/schema";

export type CanvasPane =
  | "outline"
  | "scenes"
  | "draft"
  | "diagnostics"
  | "bible"
  | "changes";

type BookCanvasContextType = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  togglePanel: () => void;
  activePane: CanvasPane;
  setActivePane: (pane: CanvasPane) => void;
  overallStatus: GenerationStatus;
  setOverallStatus: (status: GenerationStatus) => void;
  projectId: string | null;
  setProjectId: (id: string | null) => void;
  generationId: string | null;
  setGenerationId: (id: string | null) => void;
};

const BookCanvasContext = createContext<BookCanvasContextType | null>(null);

export function useBookCanvas() {
  const context = useContext(BookCanvasContext);
  if (!context) {
    throw new Error("useBookCanvas must be used within a BookCanvasProvider");
  }
  return context;
}

export function BookCanvasProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);
  const [activePane, setActivePane] = useState<CanvasPane>("outline");
  const [overallStatus, setOverallStatus] = useState<GenerationStatus>("idle");
  const [projectId, setProjectId] = useState<string | null>(null);
  const [generationId, setGenerationId] = useState<string | null>(null);

  const togglePanel = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const value = useMemo(
    () => ({
      isOpen,
      setIsOpen,
      togglePanel,
      activePane,
      setActivePane,
      overallStatus,
      setOverallStatus,
      projectId,
      setProjectId,
      generationId,
      setGenerationId,
    }),
    [isOpen, activePane, overallStatus, projectId, generationId, togglePanel]
  );

  return (
    <BookCanvasContext.Provider value={value}>
      {children}
    </BookCanvasContext.Provider>
  );
}
