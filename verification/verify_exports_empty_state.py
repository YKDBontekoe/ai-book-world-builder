
import os
import sys

# Add project root to path
sys.path.append(os.getcwd())

from verification.utils import login_as_new_user, BASE_URL
from playwright.sync_api import sync_playwright

def verify_empty_exports():
    """Verify that the empty state is displayed when a user has no exports."""
    with sync_playwright() as p:
        browser = p.chromium.launch()
        # Create a page first
        page = browser.new_page()

        # Login as a new user (who has no exports)
        login_as_new_user(page)

        # Navigate to the exports page
        print("Navigating to exports page...")
        page.goto(f"{BASE_URL}/exports")

        # Wait for the empty state
        # The empty state should have the text "No exports yet"
        print("Checking for empty state...")
        try:
            # We expect the text "No exports yet" to be visible
            # Using get_by_text since the empty state component renders this text
            empty_state_title = page.get_by_text("No exports yet")
            empty_state_title.wait_for(timeout=10000)
            print("✓ 'No exports yet' title found.")

            # Check for description
            description = page.get_by_text("Export your books from the project page to see them here.")
            description.wait_for(timeout=5000)
            print("✓ Description found.")

            # Check for the CTA button
            cta_button = page.get_by_role("link", name="Go to Projects")
            cta_button.wait_for(timeout=5000)
            print("✓ CTA button found.")

            # Take a screenshot
            os.makedirs("verification/screenshots", exist_ok=True)
            page.screenshot(path="verification/screenshots/exports_empty_state.png")
            print("✓ Screenshot saved to verification/screenshots/exports_empty_state.png")

        except Exception as e:
            print(f"❌ Verification failed: {e}")
            page.screenshot(path="verification/screenshots/exports_failure.png")
            sys.exit(1)

        browser.close()

if __name__ == "__main__":
    verify_empty_exports()
