
import os
import sys

# Add verification directory to path so we can import utils
sys.path.append(os.path.join(os.path.dirname(__file__), 'verification'))

from playwright.sync_api import sync_playwright, expect
from verification.utils import login_as_new_user, take_screenshot, BASE_URL

def verify_context_selection(page):
    print("Starting verification for Smart Context Selection...")

    # 1. Login
    login_as_new_user(page)

    # 2. Create a Project (to ensure we have context)
    page.goto(f"{BASE_URL}")
    page.get_by_role("button", name="New Project").click()
    page.get_by_placeholder("Project Name").fill("Fantasy Epic")
    page.get_by_placeholder("Description").fill("A story about dragons.")
    page.get_by_role("button", name="Create Project").click()

    # Wait for project creation and redirect
    page.wait_for_timeout(2000)

    # 3. Navigate to Generation Page (Context Selection)
    # The URL should be /projects/[id]
    # We need to click "Start Writing" or "Generation" if available, or construct URL
    # Let's assume there is a way to get to generation from project page
    # Or navigate directly if we can grab ID from URL

    project_url = page.url
    project_id = project_url.split('/')[-1]

    print(f"Project ID: {project_id}")

    # Navigate to generation page
    page.goto(f"{BASE_URL}/projects/{project_id}/generate")

    # 4. Verify Context Selection Panel and Magic Select
    expect(page.get_by_text("Context Selection")).to_be_visible()
    expect(page.get_by_text("Magic Auto-Select")).to_be_visible()

    take_screenshot(page, "context_selection_panel")

    # 5. Test Magic Select Interaction (Mocked if possible, but real here)
    # We need to fill the input
    page.get_by_placeholder("What are you writing?").fill("Chapter 1: The Dragon Attacks")

    # Click Auto-Select
    # Note: This might fail if the server action fails or takes too long.
    # Since we don't have real AI key in some envs, it might error.
    # But we check for the button state or toast.

    btn = page.get_by_role("button", name="Auto-Select")
    btn.click()

    # Wait a bit for potential toast or loading
    page.wait_for_timeout(2000)

    take_screenshot(page, "magic_select_clicked")

    # 6. Verify Suggestion Consistency Warning (Mocked/Static check)
    # Navigate to Chat and verify "Consistency" suggestion style
    # We might not see it unless we force it, but we can verify the styles exist in CSS/DOM if we inspected,
    # but for visual verification, we might need to rely on the unit test or manual check.
    # However, let's try to see if Suggested Actions are visible in chat.

    page.goto(f"{BASE_URL}/projects/{project_id}")
    # Check if suggested actions appear (might take time to load)
    page.wait_for_timeout(3000)

    take_screenshot(page, "chat_suggestions")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_context_selection(page)
        except Exception as e:
            print(f"Error: {e}")
            take_screenshot(page, "error_state")
        finally:
            browser.close()
