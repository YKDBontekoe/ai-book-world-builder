import os
import sys
import time
from playwright.sync_api import sync_playwright, expect

# Add verification directory to path to import utils
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from utils import login_as_new_user, take_screenshot, BASE_URL

def verify_ux_polish(page):
    print(f"Navigating to {BASE_URL}")
    page.goto(BASE_URL, timeout=120000)

    # 1. Login
    login_as_new_user(page)

    # 2. Check Dashboard
    print("Checking Dashboard...")
    page.goto(f"{BASE_URL}/projects", timeout=60000)
    # Wait for content to animate in
    time.sleep(1) # Allow staggered animation to start
    take_screenshot(page, "dashboard_animated")

    # 3. Enter a project for Writer View
    print("Checking Writer View...")
    # Find a project card or create one if empty
    try:
        page.wait_for_selector("a[href^='/projects/']", timeout=10000)
        page.locator("a[href^='/projects/']").first.click()
    except:
        print("No projects found, creating one...")
        page.get_by_role("button", name="Create Story").first.click()
        page.fill("input[name='title']", "Polish Test Project")
        page.click("button[type='submit']")
        # Wait for redirect
        page.wait_for_url("**/projects/*")

    page.wait_for_selector("text=Book Structure", timeout=30000)
    take_screenshot(page, "writer_view_loaded")

    # 4. Check Floating Assistant
    print("Checking Floating Assistant...")
    # The button should be visible (bottom right)
    chat_trigger = page.locator("button:has(.lucide-message-square)")
    if chat_trigger.is_visible():
        print("Clicking Floating Assistant...")
        chat_trigger.click()
        # Wait for animation (spring)
        time.sleep(0.5)
        take_screenshot(page, "floating_assistant_open")

        # Close it
        page.locator("button:has(.lucide-x)").click()
        time.sleep(0.5)
        take_screenshot(page, "floating_assistant_closed")
    else:
        print("Floating Assistant trigger not found!")

    # 5. Check Sidebar Expansion
    print("Checking Sidebar Expansion...")
    # Find a chapter folder if any
    folder_btn = page.locator("button:has(.lucide-folder)").first
    if folder_btn.count() > 0:
        print("Toggling chapter...")
        folder_btn.click()
        time.sleep(0.3) # Wait for accordion
        take_screenshot(page, "sidebar_expanded")
    else:
        print("No chapters to expand.")

    print("Verification complete.")

if __name__ == "__main__":
    with sync_playwright() as p:
        # Launch with larger viewport for desktop check
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        try:
            verify_ux_polish(page)
        except Exception as e:
            print(f"Test failed: {e}")
            take_screenshot(page, "ux_polish_error")
            raise e
        finally:
            browser.close()
