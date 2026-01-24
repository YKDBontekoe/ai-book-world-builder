import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { useState } from "react";
import { Toaster } from "sonner";
import { Button } from "@/components/atoms/button";
import { useSceneOperations } from "@/features/writer/hooks/use-scene-operations";
import type { ChapterWithScenes } from "@/lib/types";

// Mock Data
const MOCK_CHAPTER_ID = "chapter-1";
const MOCK_PROJECT_ID = "project-1";
const MOCK_SCENE_ID = "scene-1";

const mockStructure: ChapterWithScenes[] = [
	{
		id: MOCK_CHAPTER_ID,
		projectId: MOCK_PROJECT_ID,
		title: "Chapter 1",
		sequence: 1,
		createdAt: new Date(),
		updatedAt: new Date(),
		notes: null,
		status: "draft",
		outlineId: "outline-1",
		volumeId: "volume-1",
		scenes: [
			{
				id: MOCK_SCENE_ID,
				chapterId: MOCK_CHAPTER_ID,
				projectId: MOCK_PROJECT_ID,
				title: "Scene 1",
				sequence: 1,
				content: "Content...",
				status: "drafted",
				prevSceneId: null,
				createdAt: new Date(),
				updatedAt: new Date(),
				wordCount: 0,
			},
		],
	},
];

// Demo Component
const SceneOperationsDemo = () => {
	const [activeSceneId, setActiveSceneId] = useState<string | null>(null);
	const [structure] = useState(mockStructure);

	const {
		isGenerating,
		isCreatingChapter,
		deletedSceneIds,
		handleGenerateNextScene,
		handleCreateSceneManually,
		handleDeleteScene,
		handleCreateChapter,
	} = useSceneOperations({
		projectId: MOCK_PROJECT_ID,
		activeSceneId,
		onSceneSelect: setActiveSceneId,
		onStructureUpdate: () => console.log("Structure updated"),
		structure,
	});

	return (
		<div className="p-8 space-y-6 max-w-2xl mx-auto border rounded-xl bg-card text-card-foreground">
			<div className="space-y-2">
				<h2 className="text-2xl font-bold">Scene Operations Demo</h2>
				<p className="text-muted-foreground">
					Interact with the buttons to trigger hook actions. Watch for Toasts.
				</p>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<div className="p-4 border rounded-lg space-y-2">
					<h3 className="font-semibold">Generation</h3>
					<Button
						onClick={() => handleGenerateNextScene(MOCK_CHAPTER_ID)}
						disabled={isGenerating}
						className="w-full"
					>
						{isGenerating ? "Generating..." : "Generate Next Scene"}
					</Button>
				</div>

				<div className="p-4 border rounded-lg space-y-2">
					<h3 className="font-semibold">Manual Creation</h3>
					<Button
						onClick={() => handleCreateSceneManually(MOCK_CHAPTER_ID)}
						className="w-full"
						variant="secondary"
					>
						Create Scene Manually
					</Button>
				</div>

				<div className="p-4 border rounded-lg space-y-2">
					<h3 className="font-semibold">Chapter</h3>
					<Button
						onClick={() => handleCreateChapter()}
						disabled={isCreatingChapter}
						className="w-full"
						variant="outline"
					>
						{isCreatingChapter ? "Creating..." : "Create Chapter"}
					</Button>
				</div>

				<div className="p-4 border rounded-lg space-y-2">
					<h3 className="font-semibold">Deletion</h3>
					<Button
						onClick={() => handleDeleteScene(MOCK_SCENE_ID)}
						className="w-full"
						variant="destructive"
						disabled={deletedSceneIds.has(MOCK_SCENE_ID)}
					>
						{deletedSceneIds.has(MOCK_SCENE_ID)
							? "Deleted (Undo available)"
							: "Delete Scene 1"}
					</Button>
				</div>
			</div>

			<div className="p-4 bg-muted rounded-lg">
				<h3 className="font-mono text-sm font-bold mb-2">Internal State</h3>
				<pre className="text-xs overflow-auto">
					{JSON.stringify(
						{
							isGenerating,
							isCreatingChapter,
							deletedSceneIds: Array.from(deletedSceneIds),
							activeSceneId,
						},
						null,
						2,
					)}
				</pre>
			</div>

			<Toaster />
		</div>
	);
};

const meta: Meta<typeof SceneOperationsDemo> = {
	title: "Features/Writer/Hooks/UseSceneOperations",
	component: SceneOperationsDemo,
	parameters: {
		layout: "centered",
	},
};

export default meta;
type Story = StoryObj<typeof SceneOperationsDemo>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		// Find the Generate button
		const generateButton = canvas.getByRole("button", {
			name: /Generate Next Scene/i,
		});

		// Click it
		await userEvent.click(generateButton);

		// Verify it changes text to "Generating..."
		// Note: The hook state update happens immediately
		await expect(
			canvas.getByRole("button", { name: /Generating.../i }),
		).toBeInTheDocument();
	},
};
