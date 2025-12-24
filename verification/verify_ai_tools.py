
import os
from playwright.sync_api import sync_playwright, expect

def verify_ai_tools_menu():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 800})
        page = context.new_page()

        try:
            page.goto("http://localhost:3000/login")
            # Use exact match to avoid ambiguity
            expect(page.get_by_role("button", name="Sign in", exact=True)).to_be_visible(timeout=10000)

            page.screenshot(path="verification/verification.png")
            print("Screenshot taken at verification/verification.png")

        except Exception as e:
            print(f"Verification failed: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_ai_tools_menu()
