
import sys
import os

# Ensure we can import from the repo root if needed, though mostly using standard libs
sys.path.append(os.getcwd())

from playwright.sync_api import sync_playwright, expect

def verify_writer_layout():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={'width': 1280, 'height': 800}
        )
        page = context.new_page()

        # NOTE: We cannot easily login without seed data or a running Auth instance.
        # However, we can try to hit the login page or a public page to see if layout renders.
        # Since this is a protected app, we might just get redirected to login.
        # But we can try to verify if the components are loading by checking the build/server status.

        # In this specific environment, we might not have a full DB.
        # We will attempt to navigate to a project page if we can bypass auth or if we can mock it.
        # If not, we will just verify the login page loads, which confirms the app is running.
        # Ideally, we would simulate the WriterView component isolation, but that requires Component Testing which is complex here.

        try:
            print("Navigating to home...")
            page.goto("http://localhost:3000", timeout=60000)

            # Wait for something to load
            page.wait_for_load_state("networkidle")

            print("Taking screenshot of initial state...")
            page.screenshot(path="verification/initial_load.png")

            # If redirected to login (likely)
            if "sign-in" in page.url or "login" in page.url:
                print("Redirected to login as expected.")

        except Exception as e:
            print(f"Error during verification: {e}")
            page.screenshot(path="verification/error_state.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_writer_layout()
