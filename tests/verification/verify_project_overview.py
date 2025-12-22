import sys
import os
from playwright.sync_api import sync_playwright, expect

# NOTE: This script requires app/api/test-utils/create-project/route.ts to be present.
# It was used for development verification and may fail if the route is removed.

# Add current directory to path to import utils
sys.path.append(os.path.dirname(__file__))
from utils import login_as_new_user, take_screenshot, BASE_URL

def verify_project_overview(page):
    # 1. Login
    creds = login_as_new_user(page)
    print(f"Logged in as {creds['email']}")

    # 2. Create Empty Project via API
    print("Creating empty project via API...")
    # Using page.context.request ensures cookies are shared
    response = page.context.request.post(f"{BASE_URL}/api/test-utils/create-project", data={
        "name": "Empty Project"
    })
    expect(response).to_be_ok()
    project_id = response.json()["projectId"]
    print(f"Created project: {project_id}")

    # 3. Visit Project Overview (Empty State)
    print("Navigating to Project Overview (Empty)...")
    page.goto(f"{BASE_URL}/projects/{project_id}")

    # Wait for page content
    expect(page.get_by_text("Empty Project")).to_be_visible()

    # Take screenshot of Empty State
    take_screenshot(page, "project_overview_empty")

    # 4. Create Populated Project via API
    print("Creating populated project via API...")
    response = page.context.request.post(f"{BASE_URL}/api/test-utils/create-project", data={
        "name": "Populated Project",
        "withChapter": True
    })
    expect(response).to_be_ok()
    project_id_pop = response.json()["projectId"]
    print(f"Created project: {project_id_pop}")

    # 5. Visit Project Overview (Populated)
    print("Navigating to Project Overview (Populated)...")
    page.goto(f"{BASE_URL}/projects/{project_id_pop}")

    # Wait for page content
    expect(page.get_by_text("Populated Project")).to_be_visible()
    expect(page.get_by_text("Chapter 1").first).to_be_visible()

    # Wait for content (The UI selects first chapter by default)
    expect(page.get_by_text("This is a test chapter content.")).to_be_visible()

    # Take screenshot of Populated State
    take_screenshot(page, "project_overview_populated")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()
        try:
            verify_project_overview(page)
        except Exception as e:
            print(f"Error: {e}")
            # Ensure directory exists for error screenshot
            os.makedirs("verification/screenshots", exist_ok=True)
            page.screenshot(path="verification/screenshots/error_project_overview.png")
            raise e
        finally:
            browser.close()
