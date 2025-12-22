import os
import sys

# Ensure verification/utils.py can be imported
sys.path.append(os.getcwd())

from playwright.sync_api import sync_playwright
from verification.utils import login_as_new_user

def test_story_wizard():
    with sync_playwright() as p:
        # Use existing context if possible, or create new browser
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            # Login and create a project
            login_as_new_user(page)

            # Navigate to Projects page
            page.goto("http://localhost:3000/projects", timeout=60000)

            # Create a new project to trigger the empty state wizard
            page.get_by_role("button", name="New Project").click()
            page.get_by_label("Project Name").fill("Wizard Test Project")
            page.get_by_role("button", name="Create Project").click()

            # Wait for navigation to writer view
            page.wait_for_url(r"**/projects/*", timeout=30000)

            # Verify the "Generate Your Story" wizard is visible
            wizard_header = page.get_by_role("heading", name="Generate Your Story")
            wizard_header.wait_for(state="visible", timeout=10000)

            print("Story Wizard visible")
            page.screenshot(path="verification/story_wizard_visible.png")

            # Test generation flow (Mocked or real?)
            # Since this calls an LLM, we might just verify the UI element exists
            # and maybe the button state.

            prompt_input = page.get_by_placeholder("e.g. A cyberpunk detective")
            prompt_input.fill("A funny story about a robot cat.")

            generate_btn = page.get_by_role("button", name="Generate Plan")
            if generate_btn.is_enabled():
                print("Generate button enabled")
            else:
                print("Generate button disabled - Failed")

        except Exception as e:
            print(f"Test failed: {e}")
            page.screenshot(path="verification/story_wizard_error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    test_story_wizard()
