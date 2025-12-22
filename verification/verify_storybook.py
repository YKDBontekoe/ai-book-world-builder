import time
import sys
from playwright.sync_api import sync_playwright

def verify_storybook():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Wait for Storybook to be up (retry)
        # Using iframe.html to render component in isolation
        url = "http://localhost:6006/iframe.html?id=ui-glasscard--liquid&viewMode=story"
        print(f"Connecting to {url}...")

        for i in range(60):
            try:
                # Use a shorter timeout for polling
                page.goto(url, timeout=5000)
                break
            except Exception as e:
                print(f"Waiting for Storybook... {e}")
                time.sleep(2)
        else:
            print("Storybook failed to start or timed out.")
            sys.exit(1)

        print("Connected. Waiting for component...")
        try:
            # Wait for the glass panel class to appear
            page.wait_for_selector(".glass-panel", timeout=30000)

            # Wait a bit for animations
            time.sleep(1)

            # Take screenshot
            output_path = "/home/jules/verification/glass-card-liquid.png"
            page.screenshot(path=output_path)
            print(f"Screenshot saved to {output_path}")
        except Exception as e:
            print(f"Error finding component: {e}")
            page.screenshot(path="/home/jules/verification/error.png")

        browser.close()

if __name__ == "__main__":
    verify_storybook()
