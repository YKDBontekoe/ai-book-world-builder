import { useEffect } from "react";
import { useBookCanvasActions } from "@/components/organisms/book-canvas/book-canvas-context";

/**
 * Synchronizes the Writer View state (projectId, isReadOnly) with the BookCanvas context.
 * This ensures the embedded canvas respects the permissions and scope of the writer.
 */
export function useCanvasSync(projectId: string, isReadOnly: boolean) {
	const { setProjectId, setIsReadOnly } = useBookCanvasActions();

	useEffect(() => {
		setProjectId(projectId);
		setIsReadOnly(isReadOnly);
		// Reset when unmounting (optional, but good for cleanup)
		return () => {
			setProjectId(null);
			setIsReadOnly(false);
		};
	}, [projectId, isReadOnly, setProjectId, setIsReadOnly]);
}
