import os
import sys
import time
import re
from playwright.sync_api import sync_playwright

def verify_ux():
    print("Starting UX verification...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use a large enough viewport
        context = browser.new_context(viewport={"width": 1400, "height": 900})
        page = context.new_page()

        try:
            # 1. Register/Login
            print("Registering new user...")
            page.goto("http://localhost:3000/register")

            if page.url == "http://localhost:3000/":
                print("Redirected to / immediately.")
            else:
                email = f"test_{int(time.time())}@example.com"
                page.wait_for_selector('input[name="email"]', timeout=5000)
                page.fill('input[name="email"]', email)
                page.fill('input[name="password"]', "password123")
                page.click('button[type="submit"]')
                print("Submitted registration.")

            try:
                page.wait_for_url(re.compile(r".*/projects|.*/$"), timeout=15000)
            except:
                pass

            if page.url.endswith("3000/"):
                 print("At root. Navigating to /projects...")
                 page.goto("http://localhost:3000/projects")
                 page.wait_for_url(re.compile(r".*/projects"), timeout=15000)

            # 2. Create Project
            print("Creating project...")
            time.sleep(2)

            # Try to open dialog
            create_btn = page.get_by_role("button", name="Create Story").first
            if not create_btn.is_visible():
                 create_btn = page.get_by_role("button").filter(has_text="Create Story").first

            if create_btn.is_visible():
                create_btn.click()
                print("Clicked Create Story button.")
            else:
                # Maybe generic "Create Project"
                page.get_by_role("button", name="Create Project").first.click()
                print("Clicked Create Project button.")

            # Wait for dialog
            page.wait_for_selector('div[role="dialog"]', timeout=5000)
            print("Dialog opened.")

            # Fill form
            page.get_by_label("Name").fill("UX Test Project")

            # Click Create Project (submit in footer)
            page.get_by_role("button", name="Create Project").click()

            # Wait for Writer View (url contains /projects/UUID)
            print("Waiting for Writer View (may take time to compile)...")
            page.wait_for_url(re.compile(r".*/projects/.*"), timeout=60000)
            print("In Writer View.")

            # 3. Test Sidebar Toggle
            print("Testing Sidebar Toggle...")

            sidebar_text = page.get_by_text("Book Structure")
            try:
                sidebar_text.wait_for(state="visible", timeout=30000)
                print("Sidebar visible.")
            except:
                print("Sidebar NOT visible initially.")
                page.screenshot(path="verification/sidebar_missing.png")

            # Click Close Button
            close_btn = page.get_by_label("Close Sidebar").first
            if close_btn.is_visible():
                close_btn.click()
                print("Clicked Close Sidebar.")
                time.sleep(2) # Animation
                if not sidebar_text.is_visible():
                    print("Sidebar collapsed successfully.")
                else:
                    print("Sidebar text still visible.")
                    page.screenshot(path="verification/sidebar_not_collapsed.png")
            else:
                print("Close Sidebar button not found.")
                page.screenshot(path="verification/close_btn_fail.png")

            # Click Open Button
            open_btn = page.get_by_label("Open Sidebar").first
            if open_btn.is_visible():
                open_btn.click()
                print("Clicked Open Sidebar.")
                time.sleep(2)
                if sidebar_text.is_visible():
                    print("Sidebar expanded successfully.")
            else:
                 print("Open Sidebar button not found.")

            # 4. Save Screenshot
            page.screenshot(path="verification/ux_test_result.png")
            print("Screenshot saved.")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")

        finally:
            browser.close()

if __name__ == "__main__":
    verify_ux()
