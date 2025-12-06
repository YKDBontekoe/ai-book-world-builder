"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  type MutableRefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { ProjectSummary } from "@/lib/project-context";

type UseProjectSelectionOptions = {
  initialProjectId?: string | null;
  projects: ProjectSummary[];
};

type UseProjectSelectionResult = {
  applyProjectSelection: (projectId: string) => void;
  projectFromSearch: string | null;
  selectedProject: ProjectSummary | null;
  selectedProjectId: string | null;
  selectedProjectIdRef: MutableRefObject<string | null>;
};

export function useProjectSelection({
  initialProjectId,
  projects,
}: UseProjectSelectionOptions): UseProjectSelectionResult {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectFromSearch = searchParams.get("projectId");

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    initialProjectId ?? null
  );
  const selectedProjectIdRef = useRef<string | null>(initialProjectId ?? null);

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) ?? null,
    [projects, selectedProjectId]
  );

  const updateProjectInUrl = useCallback(
    (projectId: string | null) => {
      if (typeof window === "undefined") return;
      const currentUrl = new URL(window.location.href);
      if (projectId) {
        currentUrl.searchParams.set("projectId", projectId);
      } else {
        currentUrl.searchParams.delete("projectId");
      }

      router.replace(currentUrl.pathname + currentUrl.search);
    },
    [router]
  );

  const applyProjectSelection = useCallback((projectId: string) => {
    selectedProjectIdRef.current = projectId;
    setSelectedProjectId(projectId);
  }, []);

  useEffect(() => {
    if (selectedProjectId === null && projectFromSearch) {
      return;
    }

    selectedProjectIdRef.current = selectedProjectId;

    if (selectedProjectId) {
      document.cookie = `chat-project=${selectedProjectId}; path=/; max-age=${
        60 * 60 * 24 * 30
      }`;
    }

    updateProjectInUrl(selectedProjectId);
  }, [projectFromSearch, selectedProjectId, updateProjectInUrl]);

  useEffect(() => {
    if (!projectFromSearch) return;

    const matchingProject = projects.find(
      (project) => project.id === projectFromSearch
    );

    if (matchingProject) {
      applyProjectSelection(matchingProject.id);
    }
  }, [applyProjectSelection, projectFromSearch, projects]);

  useEffect(() => {
    if (!selectedProjectId && projects.length > 0) {
      applyProjectSelection(projects[0].id);
    }
  }, [applyProjectSelection, projects, selectedProjectId]);

  return {
    applyProjectSelection,
    projectFromSearch,
    selectedProject,
    selectedProjectId,
    selectedProjectIdRef,
  };
}
