import os
import time
from playwright.sync_api import sync_playwright

def verify_settings():
    print("Starting Settings verification...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 800})
        page = context.new_page()

        try:
            # Skip login, go straight to page
            print("Navigating to verification page...")
            page.goto("http://localhost:3000/verification-settings")

            if "/login" in page.url:
                 print("Redirected to login! Middleware bypass failed?")
                 # Try to login if forced, but we shouldn't be

            page.wait_for_selector('div[role="dialog"]', timeout=20000)
            print("Dialog visible.")
            time.sleep(2) # Wait for animations

            page.screenshot(path="verification/settings_modal_account.png")
            print("Screenshot account saved.")

            # Click AI Models tab
            page.click('button:text("AI Models")')
            time.sleep(2)
            page.screenshot(path="verification/settings_modal_models.png")
            print("Screenshot models saved.")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/settings_error_standalone.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_settings()
