from playwright.sync_api import sync_playwright
from utils import login_as_new_user, take_screenshot

def verify_settings():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            # 1. Login using the shared utility
            # This handles registration and ensures we are authenticated
            user = login_as_new_user(page)
            print(f"Successfully logged in as {user['email']}")

            # 2. Verify we are on a protected page or see protected content
            # Taking a screenshot of the dashboard/chat view
            take_screenshot(page, "dashboard_after_login")

        except Exception as e:
            print(f"Verification failed: {e}")
            try:
                take_screenshot(page, "error_state")
            except:
                pass
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    verify_settings()
