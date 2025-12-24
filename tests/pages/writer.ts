import { expect, type Page } from "@playwright/test";

export class WriterPage {
	private readonly page: Page;
	readonly projectId: string;

	constructor(page: Page, projectId: string = "") {
		this.page = page;
		this.projectId = projectId;
	}

	async goto() {
		if (!this.projectId) throw new Error("ProjectId required for navigation");
		await this.page.goto(`/projects/${this.projectId}`);
	}

	// --- Sidebar Elements ---
	get sidebar() {
		return this.page.getByTestId("writer-sidebar");
	}

	// --- Editor Elements ---
	get editor() {
		return this.page.locator(".ProseMirror");
	}

	async createChapter(expectedTitle: string) {
		// Wait for sidebar to be fully loaded
		await expect(this.sidebar.getByText("Book Structure")).toBeVisible();

		const addChapterBtn = this.page
			.getByRole("button", { name: "Add Chapter" })
			.first();
		await addChapterBtn.click();

		// Default naming "Chapter 1"
		await expect(this.page.getByText(expectedTitle)).toBeVisible();
	}

	async createScene(chapterTitle: string, sceneTitle: string) {
		// Find the Chapter row
		const chapterItem = this.page
			.getByRole("button", { name: chapterTitle })
			.first();
		await expect(chapterItem).toBeVisible();

		// Trigger "Generate Scenes" via Chapter Actions
		// Chapter Actions is a button inside the chapter row.
		// It is often hidden until hover, or has aria-label/icon.
		// Based on `ChapterActions` code:
		// <Button variant="ghost" size="icon" ...> <Sparkles ... /> </Button>
		// It has `group-hover:opacity-100`.

		// We need to locate the button relative to the chapter item.
		// The chapter item is a button. The container is a div.
		// Let's assume the button with <Sparkles> is next to it.

		// We can search for the Sparkles icon or assume it's the button inside the same group.
		// Or just force click the generic "Generate Scenes (AI)" if we can find the menu trigger.

		// Try to find the Sparkles button inside the chapter container.
		// We can use the text locator to find the chapter, then go to parent.
		const chapterContainer = this.page
			.locator("div.group", { has: this.page.getByText(chapterTitle) })
			.first();

		// Find the dropdown trigger inside this container.
		// It's a button with "ghost" variant and size "icon".
		// We can try getting by role button.
		const actionsTrigger = chapterContainer.getByRole("button").nth(1); // 0 is expand/collapse? No, expand is separate?
		// `writer-sidebar.tsx`:
		// <button onClick={toggleChapter} ...> <Chevron> <Folder> Title </button>
		// <ChapterActions ... />

		// So index 0 is the toggle/title button.
		// Index 1 is the ChapterActions button.

		// Hover container to ensure visibility
		await chapterContainer.hover();
		await actionsTrigger.click();

		// Now select "Generate Scenes (AI)" from dropdown
		await this.page
			.getByRole("menuitem", { name: "Generate Scenes (AI)" })
			.click();

		// It should trigger generation.
		// "Planning scenes..." toast.
		// Then scenes appear.
		// Mock returns "Scene 1", "Scene 2".

		await expect(this.page.getByText("Scene 1")).toBeVisible({
			timeout: 10000,
		});
	}

	async typeInEditor(text: string) {
		await expect(this.editor).toBeVisible();
		await this.editor.click();
		await this.editor.fill(text);
	}
}
