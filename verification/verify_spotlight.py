import time
from playwright.sync_api import sync_playwright

def verify_spotlight():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 720})
        page = context.new_page()

        print("Navigating to home...")
        # Assuming dev server is running on 3000
        page.goto("http://localhost:3000")

        # We need to bypass auth or login.
        # If the app redirects to login, we might need to handle that.
        # However, checking the codebase, there is an auth system.
        # For verification, we might need to mock auth or login.
        # Let's try to see if we can reach the writer page directly if we mock cookies?
        # Or just login.

        # If we are redirected to /login (or /), let's try to fill the form if it exists.
        if "sign-in" in page.url or "login" in page.url:
             print("Handling login...")
             # Look for a simple credential login or skip
             # Actually, checking 'tests/e2e/walkthrough.test.ts' might reveal how to login.
             # But for now, let's try to just dump the HTML to see where we are.
             pass

        # Wait for page load
        page.wait_for_load_state("networkidle")

        # Try to open spotlight with Cmd+K (Meta+K)
        print("Triggering Spotlight...")
        page.keyboard.press("Meta+K")
        time.sleep(1) # Animation

        # Take screenshot
        screenshot_path = "verification/spotlight.png"
        page.screenshot(path=screenshot_path)
        print(f"Screenshot saved to {screenshot_path}")

        browser.close()

if __name__ == "__main__":
    verify_spotlight()
