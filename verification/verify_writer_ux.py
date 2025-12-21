import os
import sys
import time

# Ensure we can import utils
sys.path.append(os.getcwd())
from verification.utils import login_as_new_user, take_screenshot, BASE_URL
from playwright.sync_api import sync_playwright, expect

def verify_writer_ux():
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

            # Fill form
            page.get_by_label("Name").fill("Palette Polish Project")
            page.get_by_label("Description").fill("Testing UI states")

            # Submit
            page.get_by_role("button", name="Create Project").last.click()

            # Wait for navigation implicitly by waiting for element on new page
            print("Waiting for Writer View...")

            # 3. Verify Empty State (Sidebar & Editor)
            print("Verifying Empty Project State...")

            # The Sidebar EmptyState renders h4 with the title "No chapters"
            # We increase timeout because first load might be slow
            expect(page.get_by_role("heading", name="No chapters")).to_be_visible(timeout=90000)

            # Verify Editor "Start Your Story"
            expect(page.get_by_role("heading", name="Start Your Story")).to_be_visible()

            take_screenshot(page, "writer_empty_state")

            # 4. Trigger "Start Writing" to create structure
            # Note: "Start Writing" is in the Editor EmptyState
            print("Initializing Project...")
            page.get_by_role("button", name="Start Writing").click()

            # After clicking, the page reloads. We need to wait for reload.
            # We can wait for "Chapter 1" to appear.
            expect(page.get_by_text("Chapter 1")).to_be_visible(timeout=90000)

            # 5. Verify "No Scene Selected" State
            if page.get_by_role("heading", name="No Scene Selected").is_visible():
                print("State: No Scene Selected (as expected/hoped)")
                take_screenshot(page, "writer_no_scene_selected")
            else:
                print("State: Scene auto-selected (likely)")
                take_screenshot(page, "writer_scene_selected")

            # 6. Verify Sidebar Skeleton (Manual Trigger)
            # Click "Add Chapter" in sidebar header
            print("Triggering sidebar loading...")
            page.get_by_role("button", name="Add Chapter").click()

            # Wait for Chapter 2
            expect(page.get_by_text("Chapter 2")).to_be_visible(timeout=30000)

            take_screenshot(page, "writer_with_chapters")

            print("Verification Complete!")

        except Exception as e:
            print(f"Error: {e}")
            take_screenshot(page, "error_state")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    verify_writer_ux()
