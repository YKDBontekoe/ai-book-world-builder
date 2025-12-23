import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Navigate to login page which we know uses AuthForm -> Input
    await page.goto('http://localhost:3000/login');

    // We expect the Input fields to be present.
    // They won't have the clear button by default because it's only shown if onClear is passed,
    // and AuthForm uses standard props.
    // However, we can verified that the layout is not broken by the new CSS classes (pr-10 etc).

    // Wait for email input
    const emailInput = page.locator('input#email');
    await emailInput.waitFor();
    await emailInput.fill('test@example.com');

    // Take screenshot of login page to verify Input styling is intact
    await page.screenshot({ path: 'verification/login-inputs.png' });
    console.log("Screenshot taken: verification/login-inputs.png");

  } catch (error) {
    console.error(error);
  } finally {
    await browser.close();
  }
})();
