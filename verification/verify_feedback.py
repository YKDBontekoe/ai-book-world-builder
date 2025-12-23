import time
import random
import string
from playwright.sync_api import sync_playwright

def generate_random_email():
    return f"testuser_{''.join(random.choices(string.ascii_lowercase, k=8))}@example.com"

def verify_feedback(page):
    email = generate_random_email()
    password = "password123"

    print(f"Registering with {email}...")
    page.goto("http://localhost:3000/register")

    page.wait_for_selector("input[type=email]")
    page.fill("input[type=email]", email)
    page.fill("input[type=password]", password)
    page.click("button[type=submit]")

    print("Waiting for navigation to projects...")
    page.wait_for_url("**/projects", timeout=60000)

    print("Checking sidebar...")
    time.sleep(2)

    feedback_btn = page.get_by_role("button", name="Feedback")
    feedback_btn.wait_for(state="visible", timeout=10000)
    print("Feedback button found!")
    page.screenshot(path="verification/sidebar_debug.png")

    feedback_btn.click(force=True)

    print("Checking dialog...")
    page.get_by_text("Send Feedback").wait_for(state="visible", timeout=5000)

    print("Taking screenshot...")
    page.screenshot(path="verification/feedback_dialog.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1920, "height": 1080})
        context.add_cookies([{
            "name": "sidebar_state",
            "value": "true",
            "domain": "localhost",
            "path": "/"
        }])
        page = context.new_page()
        try:
            verify_feedback(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
            raise e
        finally:
            browser.close()
