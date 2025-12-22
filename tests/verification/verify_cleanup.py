import sys
import os
from playwright.sync_api import sync_playwright, expect

# Add current directory to path so we can import utils
sys.path.append(os.getcwd())
from verification.utils import login_as_new_user, take_screenshot, BASE_URL

def verify_cleanup(page):
    print("Starting verification...")
    # 1. Login
    login_as_new_user(page)

    # 2. Create Project
    print("Creating project...")
    page.goto(f"{BASE_URL}/projects")

    # Handle empty state or list
    try:
        # Try finding the "Create Story" button first (Empty State)
        page.get_by_role("button", name="Create Story").click(timeout=2000)
    except:
        # Fallback to "Create Project" (Toolbar/List)
        page.get_by_role("button", name="Create Project").click()

    # Fill dialog - use "Name" instead of "Title" based on screenshot
    page.get_by_label("Name").fill("Cleanup Test")
    page.get_by_label("Description").fill("Testing removed features")

    # Click submit in dialog
    # There might be two "Create Project" buttons (one that opened it, one to submit)
    # The submit one is usually in the dialog. Use specific locator if needed.
    page.get_by_role("button", name="Create Project").last.click()

    # Wait for navigation to /projects/[id]
    print("Waiting for project page...")
    # Wait for Book Canvas to appear instead of strict URL load event
    page.wait_for_selector("text=Book Canvas", timeout=60000)

    # 3. Open Book Canvas (if not open) - it is open by default usually.
    # Check for Tabs.
    # "Timeline" should NOT be visible.

    print("Checking for Timeline tab...")
    # Wait for "Outline" tab to be visible (ensure canvas loaded)
    expect(page.get_by_role("button", name="Outline")).to_be_visible()

    # Check Timeline absence
    is_timeline_visible = page.get_by_role("button", name="Timeline").is_visible()

    if is_timeline_visible:
        print("FAILURE: Timeline tab is visible!")
        take_screenshot(page, "book_canvas_cleanup_fail")
        sys.exit(1)
    else:
        print("SUCCESS: Timeline tab is missing.")

    take_screenshot(page, "book_canvas_cleanup")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_cleanup(page)
        except Exception as e:
            print(f"Error: {e}")
            take_screenshot(page, "error_state")
            sys.exit(1)
        finally:
            browser.close()
