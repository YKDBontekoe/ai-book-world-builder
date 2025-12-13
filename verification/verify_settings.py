from playwright.sync_api import sync_playwright

def verify_settings():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # 1. Register
        print("Navigating to register...")
        page.goto("http://localhost:3000/register")
        page.screenshot(path="verification/register_page.png")
        print("Screenshot taken.")
        browser.close()

if __name__ == "__main__":
    verify_settings()
