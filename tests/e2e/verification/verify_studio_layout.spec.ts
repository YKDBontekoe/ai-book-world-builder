import { test, expect } from '@playwright/test';

test('Verify Studio Layout', async ({ page }) => {
  // Login first
  await page.goto('/login');
  // Fill in dummy credentials (mocked auth)
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password');
  await page.click('button[type="submit"]');

  // Wait for redirect to projects
  await page.waitForURL('/projects');

  // Navigate to a project (assuming one exists or we create one)
  // For verification, we might need to seed data or use an existing one.
  // Assuming ID '1' exists or clicking the first project card
  const projectCard = page.locator('article').first();
  if (await projectCard.isVisible()) {
      await projectCard.click();
  } else {
      // Create a project if none exists
      await page.click('button:has-text("New Project")');
      await page.fill('input[name="title"]', 'Studio Test Project');
      await page.click('button[type="submit"]');
  }

  // Wait for the Writer View to load
  await page.waitForSelector('[data-testid="writer-sidebar"]');

  // Verify "Studio" elements
  // 1. Sidebar should be present (Glass Rail)
  await expect(page.locator('[data-testid="writer-sidebar"]')).toBeVisible();

  // 2. Editor should be centered
  // We can check if the editor container has specific classes or max-width
  // But visually checking via screenshot is better.

  // 3. Command Deck should be visible
  await expect(page.locator('button[aria-label="Assistant"]')).toBeVisible();

  // 4. Canvas Toggle should work
  const canvasToggle = page.locator('button[aria-label="Open Canvas"]');
  await canvasToggle.click();
  // Wait for animation
  await page.waitForTimeout(500);

  // Take screenshot
  await page.screenshot({ path: 'tests/e2e/verification/studio-layout.png', fullPage: true });
});
