import { useState, useEffect, useCallback } from "react";
import { useDebounceCallback } from "usehooks-ts";
import { toast } from "sonner";
import { useBookCanvasActions, useBookCanvasValue } from "../components/book-canvas/book-canvas-context";
import { getProjectStructure, updateSceneContent, createChapterSnapshot } from "../app/actions/writer";
import { type ChapterWithScenes } from "@/lib/types";

interface UseWriterStateProps {
  projectId: string;
  initialStructure?: ChapterWithScenes[];
  initialStructureText?: string;
}

export function useWriterState({ projectId, initialStructure, initialStructureText }: UseWriterStateProps) {
  const [structure, setStructure] = useState<ChapterWithScenes[] | null>(initialStructure ?? null);
  const [structureText, setStructureText] = useState(initialStructureText ?? "");
  const [loading, setLoading] = useState(!initialStructure);

  // Use context for active scene to sync with Book Canvas
  const { activeSceneId } = useBookCanvasValue();
  const { setActiveSceneId, setProjectId } = useBookCanvasActions();

  const [sceneContent, setSceneContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSnapshotting, setIsSnapshotting] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Sync project ID to Book Canvas context
  useEffect(() => {
    if (projectId) {
      setProjectId(projectId);
    }
  }, [projectId, setProjectId]);

  // Update state if initial props change (e.g. navigation)
  useEffect(() => {
    if (initialStructure) {
      setStructure(initialStructure);
      setStructureText(initialStructureText || "");
      setLoading(false);
    }
  }, [initialStructure, initialStructureText]);

  // Find the active scene object
  const activeScene = structure
    ?.flatMap((c) => c.scenes)
    .find((s) => s.id === activeSceneId);

  // Load content when active scene changes
  useEffect(() => {
    if (activeScene) {
      setSceneContent(activeScene.content || "");
    }
  }, [activeSceneId, activeScene]);

  const fetchStructure = useCallback(async () => {
    setLoading(true);
    const result = await getProjectStructure(projectId);
    if (result.structure) {
      // Cast the result to our extended type for now
      setStructure(result.structure as unknown as ChapterWithScenes[]);
      if (result.structureText) {
        setStructureText(result.structureText);
      }
      if (
        !activeSceneId &&
        result.structure.length > 0 &&
        result.structure[0].scenes.length > 0
      ) {
        setActiveSceneId(result.structure[0].scenes[0].id);
      }
    }
    setLoading(false);
  }, [projectId, activeSceneId, setActiveSceneId]);

  useEffect(() => {
    // Only fetch if no structure or if we are supposed to (though logic above handles initialStructure updates)
    // But if we navigate to a new project and initialStructure is NOT provided for some reason, we fetch.
    if (!initialStructure) {
        fetchStructure();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, fetchStructure]); // Removed initialStructure from dep array to avoid loops if reference unstable, but typically safe.
  // Actually, if initialStructure changes, the other useEffect handles it. This one handles missing initialStructure.

  const debouncedSave = useDebounceCallback(async (content: string, id: string) => {
    setIsSaving(true);
    const result = await updateSceneContent(id, content);
    setIsSaving(false);
    if (result.success) {
      setLastSaved(new Date());
      setStructure((prev) =>
        prev
          ? prev.map((c) => ({
              ...c,
              scenes: c.scenes.map((s) =>
                s.id === id ? { ...s, content } : s
              ),
            }))
          : null
      );
    } else {
      toast.error("Failed to save changes");
    }
  }, 1000);

  const handleContentChange = (newContent: string) => {
    setSceneContent(newContent);
    if (activeSceneId) {
      debouncedSave(newContent, activeSceneId);
    }
  };

  const handleSnapshot = async () => {
    if (!activeScene?.chapterId) return;
    setIsSnapshotting(true);
    const result = await createChapterSnapshot(activeScene.chapterId);
    setIsSnapshotting(false);
    if (result.success) {
      toast.success("Chapter version saved");
    } else {
      toast.error("Failed to create version");
    }
  };

  return {
    structure,
    structureText,
    loading,
    activeSceneId,
    setActiveSceneId,
    sceneContent,
    activeScene,
    isSaving,
    lastSaved,
    isSnapshotting,
    handleContentChange,
    handleSnapshot,
    fetchStructure,
  };
}
