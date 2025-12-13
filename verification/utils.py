import os
import time
import re
from playwright.sync_api import Page, expect

# Default to localhost:3000 but allow override
BASE_URL = os.getenv("BASE_URL", "http://localhost:3000")
# Directory for screenshots relative to this file
SCREENSHOT_DIR = os.path.join(os.path.dirname(__file__), "screenshots")

def ensure_screenshot_dir():
    """Ensures the screenshot directory exists."""
    if not os.path.exists(SCREENSHOT_DIR):
        os.makedirs(SCREENSHOT_DIR)

def generate_user_credentials():
    """Generates unique user credentials based on timestamp."""
    timestamp = int(time.time())
    return {
        "email": f"test-user-{timestamp}@example.com",
        "password": f"pass-{timestamp}"
    }

def login_as_new_user(page: Page):
    """
    Registers a new user and logs them in.
    Returns a dictionary with 'email' and 'password'.
    This function handles the registration flow which signs the user in.
    """
    creds = generate_user_credentials()
    email = creds["email"]
    password = creds["password"]

    print(f"Registering and logging in new user: {email}")

    # Go to register page
    page.goto(f"{BASE_URL}/register")

    # Fill registration form
    # Using locators matching tests/helpers.ts
    page.get_by_placeholder("user@acme.com").fill(email)
    page.get_by_label("Password").fill(password)

    # Click Sign Up
    # Use force=True because dev overlay might interfere
    page.get_by_role("button", name="Sign Up", exact=True).click(force=True)

    # Wait for success toast to confirm login/registration
    # Using locator matching tests/helpers.ts
    try:
        expect(page.get_by_test_id("toast")).to_contain_text("Account created successfully!", timeout=10000)
    except:
        print("Warning: Toast not found or timed out, checking URL...")
        pass

    # Wait a moment for any redirects to settle
    page.wait_for_timeout(2000)

    # Check if we are redirected to setup or dashboard (assuming login success if URL changes)
    # If still on /register, then it failed.
    if "/register" in page.url:
         print("Warning: Still on register page. Force clicking again just in case.")
         page.get_by_role("button", name="Sign Up", exact=True).click(force=True)
         page.wait_for_timeout(2000)

    return creds

def take_screenshot(page: Page, name: str):
    """
    Takes a full page screenshot and saves it to verification/screenshots/
    """
    ensure_screenshot_dir()
    # Sanitize name
    safe_name = re.sub(r'[^a-zA-Z0-9_\-]', '_', name)
    path = os.path.join(SCREENSHOT_DIR, f"{safe_name}.png")

    # Ensure page is loaded
    try:
        page.wait_for_load_state("networkidle", timeout=3000)
    except:
        print("Warning: Network idle timeout, proceeding with screenshot.")

    page.screenshot(path=path, full_page=True)
    print(f"Screenshot saved to {path}")
