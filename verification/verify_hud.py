from playwright.sync_api import sync_playwright, expect
import os

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(viewport={'width': 1280, 'height': 720})
    page = context.new_page()

    # Navigate to Factory Tycoon
    try:
        print("Navigating to http://localhost:3000/factory-tycoon")
        page.goto("http://localhost:3000/factory-tycoon", timeout=30000)

        # Wait for the HUD to load
        print("Waiting for Control Panel...")
        expect(page.get_by_text("Control Panel")).to_be_visible(timeout=20000)

        # Check for other elements
        # Use exact=True to avoid matching "+1/tick" text in descriptions
        expect(page.get_by_text("Tick", exact=True)).to_be_visible()
        expect(page.get_by_text("Finances")).to_be_visible()

        # Take screenshot
        os.makedirs("verification", exist_ok=True)
        screenshot_path = "verification/hud_refactor.png"
        page.screenshot(path=screenshot_path)
        print(f"Screenshot saved to {screenshot_path}")

    except Exception as e:
        print(f"Error: {e}")
        os.makedirs("verification", exist_ok=True)
        page.screenshot(path="verification/error.png")
        raise e
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
