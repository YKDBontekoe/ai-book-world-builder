import os
import sys
import time
import re
from playwright.sync_api import sync_playwright, expect

# Add current directory to path to allow importing utils
sys.path.append(os.getcwd())

from verification.utils import login_as_new_user

def verify_animations():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 720})
        page = context.new_page()

        try:
            # 1. Login and go to Projects page
            print("Logging in...")
            login_as_new_user(page)

            print("Navigating to projects page...")
            page.goto("http://localhost:3000/projects")

            # 2. Check PageContainer entry animation class
            print("Checking PageContainer animation...")
            page.wait_for_selector("text=Projects")

            animated_element = page.locator(".animate-in.ease-spring").first
            expect(animated_element).to_be_visible()
            print("Found element with animation classes.")

            page.screenshot(path="verification/projects_page_entry.png")

            # 3. Check Button Hover (Static check for class)
            print("Checking Button classes...")
            # Find the "Create Story" button
            create_button = page.get_by_role("button", name="Create Story").first
            expect(create_button).to_have_class(re.compile(r"ease-spring"))
            print("Button has ease-spring class.")

            # 4. Create a project to check Writer View animations
            print("Creating a project...")
            create_button.click()

            # Use get_by_label for "Name" in the dialog
            page.get_by_label("Name").fill("Animation Test Project")

            # Click "Create Project" button in the dialog footer
            # The dialog usually has a 'Create Project' or 'Create' button.
            # In the previous error screenshot, it was obscured or didn't click.
            # Let's ensure we find the button in the dialog.
            submit_button = page.get_by_role("button", name="Create Project").first
            submit_button.click()

            # Wait for navigation with increased timeout
            page.wait_for_url("**/projects/**", timeout=60000)

            # 5. Check Writer View entry animation
            print("Checking Writer View animation...")
            writer_view = page.locator(".animate-in.fade-in.duration-700").first
            expect(writer_view).to_be_visible()

            # Check Sidebar animation
            sidebar = page.locator(".animate-in.slide-in-from-left-4").first
            expect(sidebar).to_be_visible()

            print("Writer View animations confirmed.")

            # Take screenshot of Writer View
            time.sleep(2) # Wait for animations to settle
            page.screenshot(path="verification/writer_view_entry.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    verify_animations()
