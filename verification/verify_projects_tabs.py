import os
import sys
from playwright.sync_api import sync_playwright, expect

# Add current directory to path to import utils
sys.path.append(os.getcwd())

from verification.utils import login_as_new_user

def verify_projects_tabs(page):
    print("Logging in...")
    # Login
    user_email = login_as_new_user(page)
    print(f"Logged in as {user_email}")

    # Go to projects page
    print("Navigating to /projects")
    page.goto("http://localhost:3000/projects")

    # Check "My Projects" tab is active by default
    print("Checking default tab...")
    mine_tab = page.get_by_role("tab", name="My Projects")
    expect(mine_tab).to_have_attribute("data-state", "active")

    # Click "Community" tab
    print("Clicking Community tab...")
    community_tab = page.get_by_role("tab", name="Community")
    community_tab.click()

    # Check URL updates
    print("Checking URL update...")
    expect(page).to_have_url("http://localhost:3000/projects?tab=shared")

    # Check "Community" tab is active
    expect(community_tab).to_have_attribute("data-state", "active")

    # Take screenshot
    page.screenshot(path="verification_projects_tabs.png")
    print("Screenshot saved to verification_projects_tabs.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            verify_projects_tabs(page)
        except Exception as e:
            print(f"Test failed: {e}")
            page.screenshot(path="verification_failed.png")
            raise e
        finally:
            browser.close()
