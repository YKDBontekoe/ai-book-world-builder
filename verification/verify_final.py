
from playwright.sync_api import sync_playwright, expect
import os
import sys

# Add the verification directory to the python path
sys.path.append(os.path.join(os.getcwd(), 'verification'))
from utils import login_as_new_user, BASE_URL

def verify_chat_ui():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use a large viewport to ensure elements aren't hidden
        context = browser.new_context(viewport={"width": 1400, "height": 1000})
        page = context.new_page()

        print(f"Navigating to {BASE_URL}...")
        try:
            # Login and get to the chat page (this puts us at / or /projects/new usually)
            login_as_new_user(page)

            # Ensure we are at the root chat page
            page.goto(BASE_URL)

            # Wait for input to be ready
            input_area = page.locator('textarea[placeholder="What would you like to create?"]')
            expect(input_area).to_be_visible(timeout=60000)

            # Type and send a message
            print("Sending message...")
            input_area.fill("Test message for styling")

            # Click send button (arrow up icon usually)
            # Find the button near the textarea
            submit_button = page.locator('button[type="submit"]')
            # If submit button isn't found easily, use Enter
            input_area.press("Enter")

            print("Waiting for user message to appear...")
            # The message component has data-testid="message-user"
            # We look for the container with data-role="user"
            user_message = page.locator('div[data-testid="message-user"]')

            # Wait for it to be visible
            expect(user_message).to_be_visible(timeout=30000)

            # Scroll to it
            user_message.scroll_into_view_if_needed()

            # Wait a split second for animations to settle
            page.wait_for_timeout(2000)

            # Take screenshot of the whole page
            print("Taking screenshot...")
            page.screenshot(path="verification/final_chat_style.png", full_page=False)

            # Also try to take a screenshot of just the message if possible
            try:
                user_message.screenshot(path="verification/user_message_only.png")
                print("Captured message element screenshot.")
            except Exception as e:
                print(f"Could not capture element screenshot: {e}")

            print("Verification complete.")

        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="verification/final_error.png")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    verify_chat_ui()
