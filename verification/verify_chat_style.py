import sys
import os
from playwright.sync_api import sync_playwright, expect

# Add current directory to path to import utils
sys.path.append(os.path.dirname(__file__))
from utils import login_as_new_user, BASE_URL

def verify_chat_final(page):
    # Login
    print("Logging in...")
    login_as_new_user(page)

    # Go to chat
    print("Navigating to chat...")
    page.goto(f"{BASE_URL}/", timeout=120000)

    # Check if chat input exists
    print("Checking for input...")
    input_area = page.get_by_placeholder("What would you like to create?")
    expect(input_area).to_be_visible()

    # Type a message
    print("Sending message...")
    message_text = "Hello iMessage style verification."
    input_area.fill(message_text)

    # Wait for state update
    page.wait_for_timeout(500)

    # Send via Enter
    print("Pressing Enter...")
    input_area.press("Enter")

    # Wait for user message to appear in the list
    print("Waiting for message to appear...")
    locator = page.get_by_text(message_text)
    expect(locator).to_be_visible()

    # Scroll to the message to ensure it's in view
    locator.scroll_into_view_if_needed()

    # Wait for response
    print("Waiting for visual update...")
    page.wait_for_timeout(3000)

    # Take screenshot of the viewport
    screenshot_path = "verification/final_screenshot_viewport.png"
    os.makedirs(os.path.dirname(screenshot_path), exist_ok=True)
    page.screenshot(path=screenshot_path)
    print(f"Screenshot saved to {screenshot_path}")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.set_viewport_size({"width": 1280, "height": 800})
        try:
            verify_chat_final(page)
        except Exception as e:
            print(f"Error: {e}")
            os.makedirs("verification", exist_ok=True)
            page.screenshot(path="verification/error.png")
            raise e
        finally:
            browser.close()
