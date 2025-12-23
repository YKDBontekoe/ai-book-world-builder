import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Visit projects page to check Search Input (which uses onClear)
    await page.goto('http://localhost:3000/projects');

    // We expect the Search input to be visible.
    // Assuming auth redirect might happen, we might end up on login.
    // But if we are on login, we can verify standard inputs are NOT broken (no wrapper).

    // Wait for network idle
    await page.waitForLoadState('networkidle');

    if (page.url().includes('login')) {
        console.log("On Login Page");
        await page.screenshot({ path: 'verification/login-standard-input.png' });
    } else {
        console.log("On Projects Page");
        const searchInput = page.getByPlaceholder('Search projects...');
        if (await searchInput.isVisible()) {
            await searchInput.fill('Test search');
            await page.screenshot({ path: 'verification/projects-search-input.png' });
        }
    }

  } catch (error) {
    console.error(error);
  } finally {
    await browser.close();
  }
})();
