import sys
import os

# Add the repository root to sys.path to allow imports from verification/
sys.path.append(os.getcwd())

from playwright.sync_api import sync_playwright
from verification.utils import login_as_new_user, take_screenshot

def verify_projects_empty_state():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use a larger viewport to ensure sidebar doesn't collapse and we can see everything
        page = browser.new_page(viewport={"width": 1280, "height": 720})

        try:
            print("Logging in as a new user...")
            user_email, user_password = login_as_new_user(page)
            print(f"Logged in as {user_email}")

            # Go to projects page
            print("Navigating to /projects...")
            page.goto("http://localhost:3000/projects")
            page.wait_for_load_state("networkidle")

            # Verify Empty State
            print("Verifying Empty State...")
            empty_state = page.locator("text=No projects found")
            if not empty_state.is_visible():
                print("Error: Empty state not found.")
                # It might be loading?
                page.screenshot(path="error_no_empty_state.png")
                sys.exit(1)

            take_screenshot(page, "projects_empty_state")
            print("Empty state verified.")

            # Click "Create Story" button
            print("Clicking 'Create Story' button...")
            create_button = page.locator("button:has-text('Create Story')")
            if not create_button.is_visible():
                print("Error: 'Create Story' button not found.")
                sys.exit(1)

            create_button.click()

            # Verify Dialog Opens
            print("Verifying Create Project Dialog...")
            dialog_title = page.locator("h2:has-text('Create Project')")
            dialog_title.wait_for(state="visible", timeout=5000)

            take_screenshot(page, "create_project_dialog")
            print("Dialog verified.")

            # Fill Form
            print("Filling Create Project form...")
            page.fill("input#name", "Test Project")
            page.fill("textarea#description", "This is a test project created via verification script.")

            # Submit
            print("Submitting form...")
            submit_button = page.locator("button:has-text('Create Project')").last
            submit_button.click()

            # Wait for navigation to /projects/[id]
            print("Waiting for navigation...")
            # Increase timeout for first-time compilation
            page.wait_for_url(r"**/projects/*", timeout=60000)

            current_url = page.url
            print(f"Redirected to: {current_url}")

            if "/projects/" not in current_url:
                print("Error: Did not redirect to project page.")
                sys.exit(1)

            print("Project creation verified successfully!")
            take_screenshot(page, "project_created")

        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="verification_failure.png")
            sys.exit(1)
        finally:
            browser.close()

if __name__ == "__main__":
    verify_projects_empty_state()
