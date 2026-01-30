import { fn } from "@storybook/test";

export const getProjectStructure = fn().mockResolvedValue({
	success: true,
	data: { structure: [], structureText: "" },
});

export const saveProjectStructure = fn().mockResolvedValue({
	success: true,
});

export const exportProject = fn().mockResolvedValue({
	success: true,
	content: "Mock Export",
});

export const createSceneInChapter = fn().mockResolvedValue({
	success: true,
	sceneId: "new-scene",
});

export const createNewChapter = fn().mockResolvedValue({
	success: true,
	chapterId: "new-chapter",
});

export const updateLastViewedScene = fn().mockResolvedValue({
	success: true,
});

export const getSceneContent = fn().mockResolvedValue({
	success: true,
	data: "Mock Content",
});

export const updateSceneContent = fn().mockResolvedValue({
	success: true,
});

export const updateSceneTitle = fn().mockResolvedValue({ success: true });
export const deleteScene = fn().mockResolvedValue({ success: true });
export const reorderScenes = fn().mockResolvedValue({ success: true });
export const bulkExportScenes = fn().mockResolvedValue({ success: true, content: "" });
export const updateChapterTitle = fn().mockResolvedValue({ success: true });
export const deleteChapter = fn().mockResolvedValue({ success: true });
export const bulkDeleteScenes = fn().mockResolvedValue({ success: true });
export const generateScene = fn().mockResolvedValue({ success: true, sceneId: "gen-scene" });
export const createChapterSnapshot = fn().mockResolvedValue({ success: true });
