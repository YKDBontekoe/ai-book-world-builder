import asyncio
from playwright.async_api import async_playwright
import os

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        # Set viewport to large
        await page.set_viewport_size({"width": 1920, "height": 1080})

        target_url = "http://localhost:3000/projects"
        print(f"Navigating to {target_url}...")

        try:
            await page.goto(target_url, timeout=30000)
            await page.wait_for_load_state("networkidle")
        except Exception as e:
            print(f"Navigation error: {e}")

        # Save screenshot
        screenshot_path = os.path.join(os.getcwd(), "verification/projects_feature_check.png")
        await page.screenshot(path=screenshot_path)
        print(f"Screenshot saved to {screenshot_path}")

        # Basic check for elements (if we are logged in or mocked)
        search_input = page.get_by_placeholder("Search projects...")
        if await search_input.is_visible():
            print("SUCCESS: Search input is visible.")
        else:
            print("INFO: Search input not visible (likely redirected to login).")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
