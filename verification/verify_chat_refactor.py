import os
import sys

# Add the directory containing verification/utils.py to python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from playwright.sync_api import sync_playwright
# Adjust import to work when running from root or inside folder
try:
    from verification.utils import login_as_new_user, take_screenshot, BASE_URL
except ImportError:
    from utils import login_as_new_user, take_screenshot, BASE_URL

def verify_chat_refactor():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use a larger viewport to ensure sidebar doesn't collapse and hide things
        context = browser.new_context(viewport={"width": 1280, "height": 720})
        page = context.new_page()

        print("Starting Chat Refactor Verification...")

        try:
            # 1. Login
            login_as_new_user(page)

            # 2. Wait for redirect to home / chat
            page.goto(f"{BASE_URL}/")
            page.wait_for_load_state("networkidle")

            # 3. Check if Chat UI is present
            # Chat input
            print("Waiting for chat input...")
            page.wait_for_selector('[data-testid="multimodal-input"]', timeout=20000)
            print("Chat input found.")

            # 4. Type a message to verify input state handling
            input_area = page.get_by_test_id("multimodal-input")
            input_area.fill("Hello, verify refactor!")

            # 5. Take screenshot
            take_screenshot(page, "chat_refactor_verified")

        except Exception as e:
            print(f"Error during verification: {e}")
            page.screenshot(path="verification/error_verification.png")
            raise e
        finally:
            browser.close()
            print("Verification script finished.")

if __name__ == "__main__":
    verify_chat_refactor()
