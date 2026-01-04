import { expect, test } from "@playwright/test";

test.describe("Writer View Improvements", () => {
	// Use a longer timeout
	test.setTimeout(120000);

	test("verify sidebar and header improvements", async ({ page }) => {
		// Attempt registration first
		await page.goto("http://localhost:3000/register");

		// Check if we are on register page
		if (page.url().includes("register")) {
			await page.getByLabel("Email Address").fill("test@example.com");
			await page.getByLabel("Password").fill("password123");
			// Look for sign up button - force strict
			await page.getByRole("button", { name: "Sign Up", exact: true }).click();

			// Might redirect to login or dashboard
			await page.waitForTimeout(2000);
		}

		// Now login (or if already logged in)
		if (!page.url().includes("projects")) {
			await page.goto("http://localhost:3000/sign-in", {
				waitUntil: "networkidle",
			});
			await page.getByLabel("Email Address").fill("test@example.com");
			await page.getByLabel("Password").fill("password123");
			await page.getByRole("button", { name: "Sign in", exact: true }).click();
		}

		// Wait for projects page (or redirection)
		await page.waitForURL(/.*\/projects/);

		// Click "Create Project" button
		await page.getByRole("button", { name: /Create Project/i }).click();

		// Check if dialog is open
		await expect(page.getByRole("dialog")).toBeVisible();

		// From snapshot: Textbox "Name"
		const titleInput = page.getByRole("textbox", { name: "Name" });
		await titleInput.fill("Verification Project " + Date.now());

		// Submit
		await page
			.getByRole("dialog")
			.getByRole("button", { name: /Create Project/i })
			.click();

		// Wait for writer view URL pattern
		await expect(page).toHaveURL(/.*\/projects\/[a-zA-Z0-9-]+$/);

		// Wait for page to settle
		await page.waitForLoadState("domcontentloaded");

		// Create a chapter to see the item styling
		const addFirstChapterBtn = page.getByRole("button", {
			name: "Add First Chapter",
		});
		if (await addFirstChapterBtn.isVisible()) {
			await addFirstChapterBtn.click();
		}

		// Wait for "Chapter 1" to be visible
		await expect(page.getByRole("button", { name: "Chapter 1" })).toBeVisible({
			timeout: 10000,
		});

		// Take screenshot to check sidebar width
		await page.screenshot({ path: "tests/e2e/verification/writer-view.png" });
	});
});
