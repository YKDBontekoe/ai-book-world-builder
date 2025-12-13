import time
from playwright.sync_api import sync_playwright, expect

def verify_marketplace():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # 1. Register
        print("Registering new user...")
        page.goto("http://localhost:3000/register")

        email = f"test-{int(time.time())}@example.com"
        password = "password123"

        page.get_by_placeholder("user@acme.com").fill(email)
        page.get_by_label("Password").fill(password)
        page.get_by_role("button", name="Sign Up", exact=True).click()

        print("Waiting for registration...")
        time.sleep(5)

        print(f"Current URL after registration: {page.url}")

        # 2. Go to Projects
        print("Navigating to /projects...")
        page.goto("http://localhost:3000/projects")
        time.sleep(2)
        print(f"Current URL at /projects: {page.url}")

        page.screenshot(path="verification/debug.png")

        # 3. Check Tabs
        print("Checking Tabs...")
        my_projects_tab = page.get_by_role("tab", name="My Projects")
        community_tab = page.get_by_role("tab", name="Community")

        expect(my_projects_tab).to_be_visible()
        expect(community_tab).to_be_visible()

        # 4. Click Community Tab
        print("Clicking Community Tab...")
        community_tab.click()
        time.sleep(2)

        # 5. Screenshot
        print("Taking screenshot...")
        page.screenshot(path="verification/verification.png")
        print("Screenshot saved.")

        browser.close()

if __name__ == "__main__":
    verify_marketplace()
