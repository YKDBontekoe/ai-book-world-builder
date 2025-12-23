import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // 1. Visit the projects page (root redirects to /projects usually, but we go direct)
    // We might need to mock auth or use a public route.
    // The previous tests suggest we need to login or bypass auth.
    // For simplicity, let's try to visit /projects and see if we get redirected to login
    // If so, we can try to inspect the components in isolation if possible, but integration is better.

    // Wait for server to be up
    await page.waitForTimeout(5000);

    await page.goto('http://localhost:3000/projects');

    // If redirected to login, we can't easily test without credentials or mocking.
    // However, the instructions mentioned using `tests/e2e/walkthrough.test.ts` as a reference.
    // Let's assume for this "small QoL" verification, we can try to see the login page
    // and maybe check if any inputs there use our new component?
    // Actually, let's just create a test page that uses our components if possible,
    // OR just try to verify the changes if we can access the app.

    // Check if we are on login page
    if (page.url().includes('sign-in')) {
       console.log("Redirected to sign-in. Creating a screenshot of login page.");
       // Login page might use Input.
       await page.screenshot({ path: 'verification/login-page.png' });
    } else {
       // We are on projects page (maybe auth is mocked or not required in dev mode?)
       console.log("On projects page.");

       // Test 1: Project Browser Search Input Clear Button
       const searchInput = page.getByPlaceholder('Search projects...');
       if (await searchInput.isVisible()) {
         await searchInput.fill('test search');
         // Check if clear button appears
         const clearBtn = page.getByLabel('Clear input');
         if (await clearBtn.isVisible()) {
             console.log("Clear button visible!");
         } else {
             console.error("Clear button NOT visible!");
         }
         await page.screenshot({ path: 'verification/search-input.png' });
       }

       // Test 2: Tooltips
       // Hover over grid view button
       const gridBtn = page.getByRole('button').filter({ has: page.locator('svg.lucide-layout-grid') });
       if (await gridBtn.isVisible()) {
          await gridBtn.hover();
          await page.waitForTimeout(500); // wait for tooltip
          await page.screenshot({ path: 'verification/tooltip.png' });
       }
    }

  } catch (error) {
    console.error(error);
  } finally {
    await browser.close();
  }
})();
