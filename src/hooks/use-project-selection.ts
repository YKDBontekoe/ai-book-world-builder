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
      if (typeof window === "undefined") {
        return;
      }
      const currentUrl = new URL(window.location.href);
      const currentProjectId = currentUrl.searchParams.get("projectId");
      const normalizedCurrent = currentProjectId ?? null;
      const normalizedTarget = projectId ?? null;

      if (normalizedCurrent === normalizedTarget) {
        return;
      }

      if (normalizedTarget) {
        currentUrl.searchParams.set("projectId", normalizedTarget);
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

  const cookieStore = useMemo(() => {
    if (typeof window === "undefined") {
      return null;
    }

    const store = (window as unknown as { cookieStore?: unknown }).cookieStore;

    if (!store || typeof store !== "object") {
      return null;
    }

    if (
      !("set" in store) ||
      typeof (store as { set?: unknown }).set !== "function" ||
      !("delete" in store) ||
      typeof (store as { delete?: unknown }).delete !== "function"
    ) {
      return null;
    }

    return store as {
      delete: (name: string) => Promise<unknown>;
      set: (options: {
        expires: Date;
        name: string;
        path: string;
        value: string;
      }) => Promise<unknown>;
    };
  }, []);

  useEffect(() => {
    if (initialProjectId && initialProjectId !== selectedProjectId) {
      applyProjectSelection(initialProjectId);
    }
  }, [applyProjectSelection, initialProjectId, selectedProjectId]);

  useEffect(() => {
    if (selectedProjectId === null && projectFromSearch) {
      return;
    }

    selectedProjectIdRef.current = selectedProjectId;

    if (selectedProjectId && cookieStore) {
      const expires = new Date(Date.now() + 60 * 60 * 24 * 30 * 1000);

      cookieStore
        .set({
          name: "chat-project",
          value: selectedProjectId,
          expires,
          path: "/",
        })
        .catch(() => null);
    } else if (!selectedProjectId && cookieStore) {
      cookieStore.delete("chat-project").catch(() => null);
    }

    updateProjectInUrl(selectedProjectId);
  }, [cookieStore, projectFromSearch, selectedProjectId, updateProjectInUrl]);

  useEffect(() => {
    if (!projectFromSearch) {
      return;
    }
    if (selectedProjectId === projectFromSearch) {
      return;
    }

    const matchingProject = projects.find(
      (project) => project.id === projectFromSearch
    );

    if (matchingProject) {
      applyProjectSelection(matchingProject.id);
    }
  }, [applyProjectSelection, projectFromSearch, projects, selectedProjectId]);

  useEffect(() => {
    if (selectedProjectId) {
      return;
    }
    if (projectFromSearch) {
      return;
    }
    if (projects.length === 0) {
      return;
    }

    applyProjectSelection(projects[0].id);
  }, [applyProjectSelection, projectFromSearch, projects, selectedProjectId]);

  return {
    applyProjectSelection,
    projectFromSearch,
    selectedProject,
    selectedProjectId,
    selectedProjectIdRef,
  };
}
