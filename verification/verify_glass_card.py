from playwright.sync_api import sync_playwright, expect, TimeoutError, Error

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(viewport={"width": 1280, "height": 720})
    page = context.new_page()

    # Go to home page
    try:
        page.goto("http://localhost:3000", timeout=60000)

        # Wait for the heading
        page.get_by_text("Your creative workflow, reimagined").wait_for(timeout=30000)

        # Wait a bit for animations (since they are staggered)
        page.wait_for_timeout(3000)

        # Take screenshot
        page.screenshot(path="verification/home_page_glass_cards.png", full_page=True)
        print("Screenshot saved to verification/home_page_glass_cards.png")
    except (TimeoutError, Error) as e:
        print(f"Error: {e}")
        # Take error screenshot
        page.screenshot(path="verification/error_screenshot.png")
        raise e
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
