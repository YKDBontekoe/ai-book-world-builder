import os
import sys
from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    base_url = os.environ.get("BASE_URL", "http://localhost:3000")
    print(f"Navigating to {base_url}/projects")

    try:
        # Wait for server to be ready (rudimentary check or just timeout)
        # We rely on long timeout
        page.goto(f"{base_url}/projects", timeout=60000)

        # Take a screenshot regardless of where we are
        screenshot_path = "verification/projects_tabs.png"
        page.screenshot(path=screenshot_path)
        print(f"Screenshot saved to {screenshot_path}")

        # Check for redirect to login
        if "login" in page.url:
            print("Redirected to login as expected. Tabs UI cannot be verified without auth.")
        else:
            print("On projects page.")

            # Check for tabs
            my_projects_link = page.get_by_role("link", name="My Projects")
            if my_projects_link.is_visible():
                print("Found 'My Projects' tab.")

            community_link = page.get_by_role("link", name="Community")
            if community_link.is_visible():
                print("Found 'Community' tab.")

            # Click Community
            community_link.click()
            page.wait_for_url("*tab=shared")
            print("URL updated to ?tab=shared")

            page.screenshot(path="verification/projects_tabs_shared.png")

    except Exception as e:
        print(f"Error: {e}")
        try:
            page.screenshot(path="verification/error.png")
        except:
            pass
        sys.exit(1)

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
