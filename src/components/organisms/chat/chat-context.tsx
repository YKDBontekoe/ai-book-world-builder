"use client";

import { createContext, useContext, ReactNode, RefObject } from "react";
import { ProjectSummary } from "@/lib/project-context";
import { VisibilityType } from "@/components/organisms/chat/visibility-selector";
import { useProjectSelection } from "@/hooks/use-project-selection";
import { useChatVisibility } from "@/hooks/use-chat-visibility";

interface ChatContextValue {
  selectedProject: ProjectSummary | null;
  selectedProjectId: string | null;
  selectedProjectIdRef: RefObject<string | null>;
  applyProjectSelection: (projectId: string) => void;
  visibilityType: VisibilityType;
  projects: ProjectSummary[];
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
}

interface ChatProviderProps {
  children: ReactNode;
  chatId: string;
  initialProjectId?: string | null;
  initialProjects?: ProjectSummary[];
  initialVisibilityType: VisibilityType;
}

export function ChatProvider({
  children,
  chatId,
  initialProjectId,
  initialProjects = [],
  initialVisibilityType,
}: ChatProviderProps) {
  const {
    applyProjectSelection,
    selectedProject,
    selectedProjectId,
    selectedProjectIdRef,
  } = useProjectSelection({
    initialProjectId,
    projects: initialProjects,
  });

  const { visibilityType } = useChatVisibility({
    chatId,
    initialVisibilityType,
  });

  return (
    <ChatContext.Provider
      value={{
        selectedProject,
        selectedProjectId,
        selectedProjectIdRef,
        applyProjectSelection,
        visibilityType,
        projects: initialProjects,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}
