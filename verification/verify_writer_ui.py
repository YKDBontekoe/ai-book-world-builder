from playwright.sync_api import sync_playwright

def verify_writer_ui():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            # Try to navigate to a project writer page.
            # It will likely redirect to login or error out due to missing DB,
            # but we want to see what happens.
            # Assuming port 3000
            page.goto("http://localhost:3000/projects/demo/write", timeout=10000)

            # Wait a bit
            page.wait_for_timeout(2000)

            # Take screenshot
            page.screenshot(path="/home/jules/verification/writer_view_attempt.png")
            print("Screenshot taken.")

        except Exception as e:
            print(f"Error: {e}")
            try:
                page.screenshot(path="/home/jules/verification/error.png")
            except:
                pass
        finally:
            browser.close()

if __name__ == "__main__":
    verify_writer_ui()
