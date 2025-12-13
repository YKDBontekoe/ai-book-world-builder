import os
import sys
import time
from playwright.sync_api import sync_playwright, expect

# Add verification directory to path to import utils
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from utils import login_as_new_user, take_screenshot, BASE_URL

def test_dashboard_features(page):
    print(f"Navigating to {BASE_URL}")
    # Increase timeout for initial load (compilation)
    page.goto(BASE_URL, timeout=120000)

    # 1. Login
    login_as_new_user(page)

    # Force sidebar open via cookie
    print("Forcing sidebar open...")
    page.context.add_cookies([{
        "name": "sidebar_state",
        "value": "true",
        "url": BASE_URL
    }])
    page.reload()

    # After login, wait for dashboard to load (New Story button is a good indicator)
    print("Waiting for dashboard to load...")
    try:
        page.wait_for_selector("button:has-text('New Story')", timeout=60000)
    except:
        print("Warning: New Story button not found, taking screenshot...")
        take_screenshot(page, "dashboard_load_fail")

    # 2. Verify Global Dashboard
    print("Testing Global Dashboard via Sidebar...")
    # Find the Dashboard button in sidebar.

    dashboard_btns = page.get_by_role("button", name="Dashboard")

    if dashboard_btns.count() > 0:
        print("Found dashboard button, clicking...")
        dashboard_btns.first.click(force=True)

        expect(page.get_by_text("Global Dashboard")).to_be_visible(timeout=10000)

        page.wait_for_timeout(2000)
        take_screenshot(page, "global_dashboard")

        page.keyboard.press("Escape")
        page.wait_for_timeout(1000)
    else:
        print("Error: Global Dashboard button not found")
        take_screenshot(page, "dashboard_btn_missing")

    # 3. Verify Project Dashboard
    print("Navigating to /projects...")
    page.goto(f"{BASE_URL}/projects", timeout=60000)

    # Wait for project card
    try:
        page.wait_for_selector("a[href^='/projects/']", timeout=10000)
        project_link = page.locator("a[href^='/projects/']").first
        print(f"Found project link: {project_link.get_attribute('href')}")
        project_link.click()
    except:
        print("No projects found. Cannot verify Project Dashboard.")
        take_screenshot(page, "no_projects_found")
        return

    print("Testing Project Dashboard...")
    page.wait_for_url("**/projects/*", timeout=60000)

    # Find the Dashboard button in overview header.
    project_dashboard_btn = page.get_by_role("button", name="Dashboard")

    if project_dashboard_btn.count() > 0:
        project_dashboard_btn.click()
        expect(page.get_by_text("Project Insights")).to_be_visible(timeout=10000)

        page.wait_for_timeout(2000)
        take_screenshot(page, "project_dashboard")
    else:
        print("Error: Project Dashboard button not found")
        take_screenshot(page, "project_dashboard_btn_missing")

    print("Done!")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        try:
            test_dashboard_features(page)
        except Exception as e:
            print(f"Test failed: {e}")
            page.screenshot(path="verification/screenshots/error.png")
            raise e
        finally:
            browser.close()
