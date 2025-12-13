from playwright.sync_api import sync_playwright

def verify_design(page):
    # Use port 3001
    page.goto("http://localhost:3001")
    page.wait_for_load_state("networkidle")

    if "onboarding" in page.url or page.get_by_text("Get Started").is_visible():
        print("On Landing Page. Clicking Get Started...")
        try:
             page.get_by_role("button", name="Get Started").first.click()
             page.wait_for_load_state("networkidle")
             print(f"Navigated to: {page.url}")
        except:
             print("Could not click Get Started")

    # Take a screenshot of wherever we ended up
    page.screenshot(path="verification/app_state.png", full_page=True)
    print("Screenshot taken: verification/app_state.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        try:
            verify_design(page)
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()
