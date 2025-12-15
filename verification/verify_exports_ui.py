import os
import sys
from playwright.sync_api import sync_playwright

# Add repo root to path to import utils
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from verification.utils import login_as_new_user, take_screenshot, BASE_URL

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 720})
        page = context.new_page()

        try:
            print("Starting verification...")
            # 1. Login
            creds = login_as_new_user(page)
            print(f"Logged in as {creds['email']}")

            # 2. Check Exports Page (Empty State)
            print("Navigating to Exports Page...")
            page.goto(f"{BASE_URL}/exports")
            page.wait_for_load_state("networkidle")

            # Verify Empty State text
            if page.get_by_text("No exports yet").is_visible():
                print("✅ Found 'No exports yet' empty state")
            else:
                # Unless we somehow have exports on a new user?
                print("❌ 'No exports yet' not found (unexpected for new user)")

            take_screenshot(page, "exports_page_ui")

            # 3. Check Projects Page (Shared Empty State)
            print("Navigating to Projects Page...")
            page.goto(f"{BASE_URL}/projects")
            page.wait_for_load_state("networkidle")

            # Click "Community" tab
            print("Clicking Community tab...")
            page.get_by_role("tab", name="Community").click()
            page.wait_for_timeout(1000)

            # Check if Empty State OR List is visible
            if page.get_by_text("No community projects").is_visible():
                print("✅ Found 'No community projects' empty state")
                if page.get_by_text("Projects shared by the community will appear here").is_visible():
                     print("✅ Found updated description")
            elif page.locator(".grid").count() > 0 or page.locator("a[href^='/projects/']").count() > 0:
                 print("ℹ️ Community projects exist, Empty State not shown (Expected if data exists)")
            else:
                print("❌ Neither Empty State nor Projects List found")

            take_screenshot(page, "projects_community_tab")

        except Exception as e:
            print(f"Error: {e}")
            take_screenshot(page, "error_verification")
            sys.exit(1)
        finally:
            browser.close()

if __name__ == "__main__":
    run_verification()
