from playwright.sync_api import sync_playwright, expect

def verify_onboarding():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 2000}) # Large height to capture more
        page = context.new_page()

        try:
            print("Navigating to onboarding page...")
            page.goto("http://localhost:3000/onboarding")

            # Wait for content to load
            expect(page.get_by_role("heading", name="Build Your Story Universe")).to_be_visible()

            print("Verifying Hero Section...")
            expect(page.get_by_role("button", name="Start Building Free")).to_be_visible()
            expect(page.get_by_role("button", name="How it Works")).to_be_visible()

            print("Verifying How It Works Section...")
            expect(page.get_by_text("Your creative workflow, reimagined")).to_be_visible()
            expect(page.get_by_role("heading", name="Define Your World")).to_be_visible()
            expect(page.get_by_role("heading", name="Populate Characters")).to_be_visible()
            expect(page.get_by_role("heading", name="Generate Story")).to_be_visible()

            print("Verifying Feature Grid...")
            # Use specific matchers to avoid strict mode violations or ambiguous matches
            expect(page.get_by_role("heading", name="Character Management")).to_be_visible()
            expect(page.get_by_role("heading", name="World Building")).to_be_visible()

            print("Taking screenshot...")
            page.screenshot(path="verification/onboarding.png")
            print("Screenshot saved to verification/onboarding.png")

        except Exception as e:
            print(f"Error: {e}")
            raise
        finally:
            browser.close()

if __name__ == "__main__":
    verify_onboarding()
