from playwright.sync_api import sync_playwright

def verify_build():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            print("Navigating to http://localhost:3000...")
            response = page.goto("http://localhost:3000", timeout=60000)
            print(f"Status: {response.status}")
            page.wait_for_load_state("networkidle")
            page.screenshot(path="verification/build_verification.png")
            print("Screenshot saved to verification/build_verification.png")
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_build()
