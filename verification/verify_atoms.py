from playwright.sync_api import sync_playwright, expect
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        url = "http://localhost:6006/iframe.html?id=ui-input--clearable&viewMode=story"
        print(f"Navigating to {url}")
        page.goto(url, timeout=60000)

        input_locator = page.get_by_role("textbox")
        expect(input_locator).to_be_visible()

        expect(input_locator).to_have_value("Initial value")

        clear_btn = page.get_by_label("Clear input")
        expect(clear_btn).to_be_visible()

        page.screenshot(path="verification/input_with_value.png")

        clear_btn.click()

        expect(input_locator).to_have_value("")

        expect(clear_btn).not_to_be_visible()

        page.screenshot(path="verification/input_cleared.png")

        print("Verification successful!")
        browser.close()

if __name__ == "__main__":
    run()
