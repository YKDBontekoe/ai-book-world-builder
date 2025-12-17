import sys
import os
from playwright.sync_api import sync_playwright

# Add repo root to path to import utils
sys.path.append(os.getcwd())

from verification.utils import login_as_new_user, take_screenshot, BASE_URL

def verify_exports_ui():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Set a larger viewport to see full layout
        context = browser.new_context(viewport={"width": 1280, "height": 800})
        page = context.new_page()

        print(f"Connecting to {BASE_URL}")

        # Login
        login_as_new_user(page)

        # Navigate to Exports
        print("Navigating to /exports")
        page.goto(f"{BASE_URL}/exports")

        # Wait for content
        try:
            page.wait_for_selector("text=My Exports", timeout=10000)
        except:
            print("Timed out waiting for page title")

        # Screenshot Empty State
        take_screenshot(page, "exports_page_empty_after")

        browser.close()

if __name__ == "__main__":
    verify_exports_ui()
