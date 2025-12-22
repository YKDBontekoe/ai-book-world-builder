import os
import sys
import re
import time
from playwright.sync_api import sync_playwright, Page, expect

# Constants
BASE_URL = os.getenv("BASE_URL", "http://localhost:3000")
SCREENSHOT_DIR = os.path.join(os.path.dirname(__file__), "screenshots")

def ensure_screenshot_dir():
    if not os.path.exists(SCREENSHOT_DIR):
        os.makedirs(SCREENSHOT_DIR)

def take_screenshot(page: Page, name: str):
    ensure_screenshot_dir()
    safe_name = re.sub(r'[^a-zA-Z0-9_\-]', '_', name)
    path = os.path.join(SCREENSHOT_DIR, f"{safe_name}.png")
    try:
        page.wait_for_load_state("networkidle", timeout=3000)
    except:
        pass
    page.screenshot(path=path, full_page=True)
    print(f"Screenshot saved to {path}")

def login_as_new_user(page: Page):
    timestamp = int(time.time())
    email = f"test-user-{timestamp}@example.com"
    password = f"pass-{timestamp}"

    print(f"Registering: {email}")
    page.goto(f"{BASE_URL}/register")
    page.get_by_placeholder("user@acme.com").fill(email)
    page.get_by_label("Password").fill(password)
    page.get_by_role("button", name="Sign Up", exact=True).click(force=True)

    try:
        expect(page.get_by_test_id("toast")).to_contain_text("Account created successfully!", timeout=10000)
    except:
        pass

    page.wait_for_timeout(2000)
    if "/register" in page.url:
         page.get_by_role("button", name="Sign Up", exact=True).click(force=True)
         page.wait_for_timeout(2000)

    return {"email": email, "password": password}

BROWSERS = ['chromium', 'firefox', 'webkit']

def run_glass_test():
    print(f"Starting Glassmorphism Visual Regression Tests on {BASE_URL}...")

    with sync_playwright() as p:
        for browser_type_name in BROWSERS:
            print(f"\n--- Testing browser: {browser_type_name} ---")
            try:
                browser_type = getattr(p, browser_type_name)
                browser = browser_type.launch()
                context = browser.new_context(
                    viewport={'width': 1280, 'height': 800},
                    device_scale_factor=2
                )
                page = context.new_page()

                print(f"Checking Login Page...")
                page.goto(f"{BASE_URL}/login")
                try:
                    page.wait_for_selector(".glass, .glass-panel, .glass-input", timeout=5000)
                except:
                    print("No glass elements found on login page immediately.")

                take_screenshot(page, f"glass_login_{browser_type_name}")

                print(f"Logging in...")
                try:
                    login_as_new_user(page)
                    page.wait_for_url("**/projects", timeout=10000)
                    page.wait_for_load_state("networkidle")
                    print("Checking Dashboard...")
                    take_screenshot(page, f"glass_dashboard_{browser_type_name}")
                except Exception as e:
                    print(f"Login failed or dashboard load failed: {e}")
                    take_screenshot(page, f"glass_error_{browser_type_name}")

                browser.close()
                print(f"Completed {browser_type_name}")

            except Exception as e:
                print(f"Failed to test {browser_type_name}: {e}")

if __name__ == "__main__":
    run_glass_test()
