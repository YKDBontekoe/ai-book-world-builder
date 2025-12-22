import sys
import os
from playwright.sync_api import sync_playwright, expect

# Add current directory to path to import utils
sys.path.append(os.path.dirname(__file__))
from utils import login_as_new_user, BASE_URL

def verify_chat(page):
    # Login
    print("Logging in...")
    login_as_new_user(page)

    # Go to chat (should be redirected there after login, but let's be sure)
    print("Navigating to chat...")
    page.goto(f"{BASE_URL}/", timeout=120000)

    # Check if chat input exists
    print("Checking for input...")
    input_area = page.get_by_placeholder("What would you like to create?")
    expect(input_area).to_be_visible()

    # Type a message
    print("Sending message...")
    input_area.fill("Hello, verify optimization.")

    # Send
    # The submit button is likely an arrow icon or similar.
    # Looking at MultimodalInput code: PromptInputSubmit has aria-label="Send message"
    page.get_by_label("Send message").click()

    # Wait for user message to appear in the list
    print("Waiting for message to appear...")
    expect(page.get_by_text("Hello, verify optimization.")).to_be_visible()

    # Wait a bit for potential response (optional, mainly verifying UI didn't crash)
    page.wait_for_timeout(3000)

    # Take screenshot
    os.makedirs("/home/jules/verification", exist_ok=True)
    page.screenshot(path="/home/jules/verification/chat_verification.png")
    print("Screenshot saved to /home/jules/verification/chat_verification.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_chat(page)
        except Exception as e:
            print(f"Error: {e}")
            os.makedirs("/home/jules/verification", exist_ok=True)
            page.screenshot(path="/home/jules/verification/error.png")
            raise e
        finally:
            browser.close()
