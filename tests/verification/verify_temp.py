import sys
import os
import time
sys.path.append(os.getcwd())
from verification.utils import login_as_new_user, BASE_URL
from playwright.sync_api import sync_playwright

def verify_chat_optimization():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 720})

        try:
            print("Logging in...")
            # Increase default timeout for slow env
            page.set_default_timeout(60000)

            login_as_new_user(page)

            # Wait for any redirects
            print("Waiting for redirects...")
            page.wait_for_timeout(10000)

            print(f"Current URL: {page.url}")

            # Navigate to chat if needed
            if "/register" in page.url or "/login" in page.url:
                print("Still on auth page. Trying to force navigate to /")
                page.goto(f"{BASE_URL}/")
                page.wait_for_timeout(5000)

            # Ensure directory exists
            os.makedirs('/home/jules/verification', exist_ok=True)

            page.screenshot(path='/home/jules/verification/verification.png', full_page=True)
            print("Screenshot saved to /home/jules/verification/verification.png")

        except Exception as e:
            print(f"Error: {e}")
            try:
                page.screenshot(path='/home/jules/verification/error.png')
            except:
                pass
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    verify_chat_optimization()
