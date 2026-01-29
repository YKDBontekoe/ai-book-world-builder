import argparse
import os
from pathlib import Path
from playwright.sync_api import sync_playwright, Error

def verify_writer_ui():
    parser = argparse.ArgumentParser(description="Verify Writer UI")
    parser.add_argument(
        "--write-url",
        default=os.getenv("WRITE_URL", "http://localhost:3000/projects/demo/write"),
        help="URL of the writer page"
    )
    parser.add_argument(
        "--screenshot-path",
        default=os.getenv("SCREENSHOT_PATH", "verification/writer_view_attempt.png"),
        help="Path to save the screenshot"
    )
    args = parser.parse_args()

    # Ensure screenshot directory exists
    screenshot_path = Path(args.screenshot_path)
    screenshot_path.parent.mkdir(parents=True, exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            # Try to navigate to a project writer page.
            # It will likely redirect to login or error out due to missing DB,
            # but we want to see what happens.
            page.goto(args.write_url, timeout=10000)

            # Wait a bit
            page.wait_for_timeout(2000)

            # Take screenshot
            page.screenshot(path=str(screenshot_path))
            print(f"Screenshot taken at {screenshot_path}")

        except Error as e:
            print(f"Error: {e}")
            try:
                # Fallback screenshot on error
                error_screenshot_path = screenshot_path.parent / "error.png"
                page.screenshot(path=str(error_screenshot_path))
            except Error:
                pass
        finally:
            browser.close()

if __name__ == "__main__":
    verify_writer_ui()
