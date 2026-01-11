import os
from playwright.sync_api import sync_playwright

def verify_frontend():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use a larger viewport to see everything
        page = browser.new_page(viewport={"width": 1280, "height": 800})

        # 1. Login (using dummy credentials for Credentials provider or bypass if possible)
        # Since I cannot easily use Google Auth in headless, I will try to use the Credentials provider if enabled
        # or rely on the "proxy.ts" excluding "verification-settings" or similar if available?
        # Actually, "proxy.ts" excludes "/((?!api/auth|_next/static|_next/image|favicon.ico|verification-settings).*)"
        # So maybe I can access /verification-settings without login?
        # But I need to see ProjectBrowser which is protected.

        # Let's try to login with dummy credentials. The auth.ts suggests:
        # const users = await getUser(email); ... await compare(password, DUMMY_PASSWORD);
        # If no user found, it checks dummy password.
        # But getUser checks DB.

        # Strategy: Bypass login by setting the session cookie directly if I knew how to sign it (JWT).
        # Easier Strategy: Modify "proxy.ts" temporarily to allow access to /projects for verification?
        # No, that modifies code I want to ship.

        # Correct Strategy: Just hit the login page and verify it renders (basic health check).
        # And hit a public page if any.

        print("Navigating to Login...")
        page.goto("http://localhost:3000/login")
        page.wait_for_load_state("networkidle")
        page.screenshot(path="verification/login_page.png")
        print("Login screenshot taken.")

        # Try to navigate to /projects (should redirect to login if not auth)
        print("Navigating to Projects...")
        page.goto("http://localhost:3000/projects")
        page.wait_for_load_state("networkidle")
        # Should be on login page again
        page.screenshot(path="verification/projects_redirect.png")

        browser.close()

if __name__ == "__main__":
    verify_frontend()
