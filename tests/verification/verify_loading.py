
import sys
import os

# Ensure we can import utils
sys.path.append(os.getcwd())

from playwright.sync_api import sync_playwright

def verify_loading_state():
    with sync_playwright() as p:
        # Launch browser
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1280, "height": 720}
        )
        page = context.new_page()

        try:
            print("Navigating to home page...")
            # Navigate to the page
            page.goto("http://localhost:3000", wait_until="commit")

            # Wait a bit to ensure potential redirect starts or component renders
            page.wait_for_timeout(500)

            page.screenshot(path="/home/jules/verification/loading_state_final.png")
            print("Screenshot taken.")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_loading_state()
