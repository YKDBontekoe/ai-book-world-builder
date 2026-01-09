import { expect, test } from "../../fixtures";

test("Verify Studio Layout", async ({ adaContext }) => {
	const { page } = adaContext;
	const projectName = `Studio Test Project ${Date.now()}`;

	// 1. Setup: Create a project to ensure we land on the Writer View
	await page.goto("/projects");

	// Click New Project if list is empty or just to be sure
	await page.getByRole("button", { name: "New Project" }).click();

	// Fill dialog
	// Assuming dialog has an input for title.
	// Wait for dialog to be visible
	await expect(page.getByRole("dialog")).toBeVisible();
	await page.getByLabel("Title").fill(projectName);
	await page.getByRole("button", { name: "Create" }).click();

	// Wait for redirection to the writer view
	await page.waitForURL(/\/projects\/.+/);

	// 2. Wait for the Writer View to load
	// The sidebar is a good indicator of the studio layout loading
	await expect(page.locator('[data-testid="writer-sidebar"]')).toBeVisible();

	// 3. Verify Studio Elements
	// Command Deck should be visible
	await expect(page.locator('button[aria-label="Assistant"]')).toBeVisible();

	// 4. Verify Canvas Toggle
	// Use stable data-testid for toggle
	const canvasToggle = page.locator('[data-testid="canvas-toggle"]');

	// Initial state: Canvas panel should NOT be visible (width 0 or hidden)
	// We check for the panel using the data-testid we added
	const canvasPanel = page.locator('[data-testid="book-canvas-panel"]');
	// It might exist in DOM but be collapsed.
	// ResizablePanel usually renders but with size 0 if collapsed.
	// Let's check if it's visible. If collapsedSize=0, it might be hidden or 0xH.
	// We can check bounding box or just visibility if the library handles it well.
	// If it's collapsed, it might not be "visible" to user.
	// But let's act first.

	await canvasToggle.click();

	// Wait for the panel to become visible/expanded
	await expect(canvasPanel).toBeVisible();

	// Take screenshot
	await page.screenshot({
		path: "tests/e2e/verification/studio-layout.png",
		fullPage: true,
	});
});
