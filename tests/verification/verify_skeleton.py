import sys
import os
import time
from playwright.sync_api import sync_playwright

# Add repo root to path
sys.path.append(os.getcwd())

from verification.utils import login_as_new_user, BASE_URL

def verify_skeleton():
    with sync_playwright() as p:
        print("Launching browser...")
        browser = p.chromium.launch(headless=True)
        # 1600x900 is good for 3-pane layout
        context = browser.new_context(viewport={'width': 1600, 'height': 900})
        page = context.new_page()

        print("Logging in...")
        login_as_new_user(page)

        print("Navigating to Projects...")
        page.goto(f"{BASE_URL}/projects")

        # Wait for either
        time.sleep(2)

        print("Creating project...")
        # Click Create Story.
        # On Empty State it is "Create Story" inside Button.
        # On List, it is "Create Project" inside Button (or icon).
        # Let's try flexible locator
        try:
             page.get_by_role("button", name="Create Story").first.click(timeout=3000)
        except:
             page.get_by_role("button", name="Create Project").first.click()

        print("Filling dialog...")
        # Placeholder is "The Great Adventure"
        page.get_by_placeholder("The Great Adventure").fill("Skeleton Test Project")

        # Click "Create Project" (submit button)
        # There are two "Create Project" texts: Title and Button.
        # get_by_role("button") is safer.
        page.get_by_role("button", name="Create Project").click()

        print("Waiting for redirection to Writer...")
        # The redirection happens after server action.
        page.wait_for_url("**/projects/*")

        print("Taking screenshot of skeleton...")
        # Capture immediately as we added 5s delay
        # Wait just a bit for hydration of the loading state shell
        page.wait_for_timeout(500)

        # Ensure we are NOT seeing the final content yet (should be blocked by delay)
        # Maybe check for skeleton element?
        # But simple screenshot is enough for visual check.

        page.screenshot(path="verification/skeleton_verification.png", full_page=True)
        print("Screenshot saved to verification/skeleton_verification.png")

        browser.close()

if __name__ == "__main__":
    verify_skeleton()
