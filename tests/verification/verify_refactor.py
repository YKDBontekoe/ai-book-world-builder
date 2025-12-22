import os
import sys
from playwright.sync_api import sync_playwright, expect

# Add current directory to path to allow importing verification.utils
sys.path.append(os.getcwd())

from verification.utils import login_as_new_user, take_screenshot, BASE_URL

def test_refactor_stability(page):
    print(f"Navigating to {BASE_URL}")
    login_as_new_user(page)

    # Wait for dashboard
    # The login helper might leave us at /projects, verify that
    page.wait_for_url(f"{BASE_URL}/projects", timeout=20000)
    expect(page.get_by_role("heading", name="Projects", exact=True)).to_be_visible()

    take_screenshot(page, "dashboard_loaded")

    # Create a project
    # Using 'Create Project' from the header
    page.get_by_role("button", name="Create Project").first.click()

    # Wait for dialog
    page.wait_for_selector("text=Create Project")

    page.get_by_label("Name").fill("Refactor Test")
    page.get_by_label("Description").fill("Testing refactor stability")

    page.get_by_role("button", name="Create Project").click()

    # Expect to be redirected to project page
    # URL pattern: /projects/[uuid]
    page.wait_for_url(r".*/projects/.*", timeout=20000)

    # Check if we can see the writer view elements
    # Maybe "Book Structure" or "Chapter 1"
    take_screenshot(page, "writer_view")

    print("Verification successful!")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_refactor_stability(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
            raise e
        finally:
            browser.close()
