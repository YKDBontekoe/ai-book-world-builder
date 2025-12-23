import { test, expect } from '@playwright/test';

test('Verify Export List and Bulk Actions', async ({ page }) => {
  // Mock authentication and exports data
  await page.route('/api/exports', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          id: 'export-1',
          projectId: 'project-1',
          projectName: 'My First Book',
          userId: 'user-1',
          format: 'pdf',
          status: 'completed',
          blobUrl: 'http://example.com/book.pdf',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'export-2',
          projectId: 'project-2',
          projectName: 'My Second Book',
          userId: 'user-1',
          format: 'epub',
          status: 'pending',
          createdAt: new Date().toISOString(),
        },
      ]),
    });
  });

  // Navigate to the exports page
  await page.goto('http://localhost:3000/exports');

  // Wait for the exports to load
  await expect(page.getByText('My First Book')).toBeVisible();
  await expect(page.getByText('My Second Book')).toBeVisible();

  // Verify "Select All" checkbox exists
  const selectAllCheckbox = page.getByLabel('Select All');
  await expect(selectAllCheckbox).toBeVisible();

  // Click "Select All"
  await selectAllCheckbox.check();

  // Verify bulk action bar appears
  const bulkActionBar = page.getByText('2 items selected');
  await expect(bulkActionBar).toBeVisible();

  // Take screenshot
  await page.screenshot({ path: 'verification/exports-page.png' });
});
