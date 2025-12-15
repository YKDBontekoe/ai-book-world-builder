import time
import re
from playwright.sync_api import sync_playwright, expect
from utils import login_as_new_user, take_screenshot, BASE_URL

def verify_multiverse(page):
    page.set_default_timeout(60000)

    # 1. Login
    try:
        login_as_new_user(page)
    except Exception as e:
        print(f"Login failed: {e}")
        take_screenshot(page, "login_failure")
        raise e

    # 2. Navigate to Project Overview
    page.goto(f"{BASE_URL}/", timeout=60000)

    print("Looking for navigation to Project Overview...")

    # Check current URL for projectId
    url = page.url
    if "projectId=" in url:
        match = re.search(r"projectId=([a-f0-9\-]+)", url)
        if match:
            project_id = match.group(1)
            print(f"Found project ID in URL: {project_id}. Navigating directly.")
            page.goto(f"{BASE_URL}/projects/{project_id}")
            # Skip interaction logic
            return check_map(page)

    try:
        # Check if we are in the Workspace view (Book Canvas)
        if page.get_by_text("Book Canvas").is_visible():
            print("Detected Workspace view. Clicking 'Book' button to go to Overview.")
            # The purple "Book" button in the header
            page.get_by_role("button", name="Book").first.click()

        elif page.get_by_text("Conjure a New World").is_visible():
             print("Empty state detected. Creating new project.")
             page.get_by_text("Conjure a New World").first.click()

             # Fill modal
             page.wait_for_selector("dialog, [role='dialog']", timeout=5000)
             page.get_by_label("Name").fill("Multiverse Test")
             page.get_by_role("button", name="Create").click()

             # Wait for redirect
             page.wait_for_url(f"{BASE_URL}/projects/.*", timeout=30000)

        else:
            # Try sidebar
            print("Trying sidebar to find project or new story...")
            # Click top left button (sidebar toggle)
            page.locator("button").first.click()
            page.wait_for_timeout(1000)
            page.get_by_role("button", name="New Story").click()

    except Exception as e:
        print(f"Navigation failed: {e}")
        take_screenshot(page, "nav_fail")
        raise e

    check_map(page)

def check_map(page):
    # 3. Switch to Multiverse Map
    print("Waiting for Project Overview...")
    # Overview should have "Chapters" and "Multiverse Map" tabs
    # Check if we are on the right page
    page.wait_for_load_state("networkidle")

    if "/generate" in page.url:
         print(f"Still in generate: {page.url}. Trying to go to overview via URL manipulation.")
         overview_url = page.url.replace("/generate", "")
         page.goto(overview_url)
    elif "projectId=" in page.url:
         match = re.search(r"projectId=([a-f0-9\-]+)", page.url)
         if match:
             project_id = match.group(1)
             page.goto(f"{BASE_URL}/projects/{project_id}")

    # Now look for the tab
    try:
        page.wait_for_selector("text=Multiverse Map", timeout=10000)
        page.get_by_text("Multiverse Map").click()
    except Exception as e:
        print(f"Could not find Multiverse Map tab. We might be on wrong page. URL: {page.url}")
        take_screenshot(page, "wrong_page")
        raise e

    # Wait for graph to load
    try:
        page.wait_for_selector(".react-flow", timeout=30000)
    except:
        print("React Flow didn't load.")
        take_screenshot(page, "map_load_failure")
        raise

    # 4. Screenshot
    take_screenshot(page, "multiverse_map_view")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 800})
        try:
            verify_multiverse(page)
        except Exception as e:
            print(f"Detailed Error: {e}")
        finally:
            browser.close()
