import os
import sys
import time

# Ensure we can import utils
sys.path.append(os.getcwd())
from verification.utils import login_as_new_user, take_screenshot, BASE_URL
from playwright.sync_api import sync_playwright, expect

def verify_typing_stability():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        try:
            # 1. Login
            login_as_new_user(page)

            # 2. Create Project
            print("Creating new project...")
            page.goto(f"{BASE_URL}/projects")

            # Click "Create Project" (dialog trigger)
            page.get_by_role("button", name="Create Project").first.click()
            page.get_by_label("Name").fill("Typing Test Project")
            page.get_by_label("Description").fill("Testing editor typing stability")
            page.get_by_role("button", name="Create Project").last.click()

            # 3. Initialize Story
            print("Initializing Story...")
            # Wait for "Generate Your Story"
            expect(page.get_by_role("heading", name="Generate Your Story")).to_be_visible(timeout=60000)

            # Manually add chapter
            print("Manually adding chapter...")
            page.get_by_role("button", name="Add Chapter").first.click()

            # Wait for structure
            print("Waiting for structure...")
            expect(page.get_by_text("Chapter 1")).to_be_visible(timeout=60000)

            # 4. Add Scene via Book Canvas
            print("Adding Scene via Book Canvas...")

            # Switch to 'Scenes' tab in Book Canvas
            # Try to find the tab button. It seems they are labeled "Outline", "Scenes", etc.
            # Using text locator with 'exact=True' to avoid matching content headers if possible,
            # but 'Scenes' is short.
            # The tabs seem to be buttons or generic elements.
            # Let's try matching the text "Scenes" inside the navigation bar.
            page.get_by_text("Scenes").first.click()

            # Click "Add Scene"
            # Wait for the button to appear
            add_scene_btn = page.locator("button").filter(has_text="Add Scene").first
            expect(add_scene_btn).to_be_visible(timeout=10000)
            add_scene_btn.click()

            # Wait for "Scene 1" to appear in the sidebar
            print("Waiting for Scene 1...")
            expect(page.get_by_text("Scene 1").first).to_be_visible(timeout=30000)

            # 5. Select the Scene in Sidebar
            print("Selecting Scene in Sidebar...")
            # Click "Scene 1" in sidebar
            page.get_by_text("Scene 1").first.click()

            # Wait for editor
            print("Waiting for editor...")
            editor_locator = page.locator(".ProseMirror")
            expect(editor_locator).to_be_visible(timeout=10000)

            # 6. Type rapidly
            print("Typing rapidly...")
            editor_locator.click()

            # Clear existing content if any
            editor_locator.press("Control+a")
            editor_locator.press("Backspace")

            text_to_type = "Hello World This Is A Test Of Typing Stability"

            # Type character by character with a small delay
            editor_locator.press_sequentially(text_to_type, delay=50)

            time.sleep(2)

            # 7. Verify Content
            content = editor_locator.text_content()
            print(f"Editor content: '{content}'")

            if text_to_type not in content:
                print("FAILURE: Text mismatch. Typing might have been reset.")
                raise Exception(f"Expected '{text_to_type}' to be in '{content}'")

            take_screenshot(page, "typing_verification")
            print("Typing verification successful!")

        except Exception as e:
            print(f"Error: {e}")
            take_screenshot(page, "typing_error")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    verify_typing_stability()
