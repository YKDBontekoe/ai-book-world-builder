import uuid
from playwright.sync_api import sync_playwright, expect
from verification.utils import login_as_new_user, BASE_URL

def create_project(page):
    """Creates a new project via the UI."""
    page.goto(f"{BASE_URL}/projects")

    # Wait for the "Create Project" button or similar
    # Assuming standard empty state or header button
    # Using 'Create Story' based on previous memory/context or "New Project"
    # Let's try to find a button that looks like a create button.
    # Often it's "Create Project" or "New Project".
    # Memory said: "Empty State components must always include a primary Call-to-Action (CTA) button... e.g., 'Create Story'"

    try:
        page.get_by_role("button", name="Create Story").click(timeout=5000)
    except:
        # Fallback if there are existing projects or different text
        page.get_by_role("button", name="New Project").click()

    # Fill dialog
    project_title = f"Test Project {uuid.uuid4()}"
    page.get_by_label("Title").fill(project_title)

    # Click submit
    page.get_by_role("button", name="Create Project").click()

    # Wait for redirect
    page.wait_for_url(r"\/projects\/.*")

    # Extract ID from URL
    url = page.url
    project_id = url.split("/")[-1]
    return project_id

def verify_writer_layout(page, user):
    """
    Verifies the Writer View 3-pane layout and floating chat.
    """
    project_id = create_project(page)

    # 1. Navigate to Project (which should now be the Writer View)
    print(f"Navigating to project {project_id}...")
    # Should already be there after creation, but let's ensure
    page.goto(f"{BASE_URL}/projects/{project_id}")

    # Wait for layout
    # Left Sidebar: Outline/Scene Navigation
    print("Checking Left Sidebar...")
    expect(page.get_by_text("Outline")).to_be_visible()

    # Center: Editor
    print("Checking Editor...")
    # The editor might show "Select a scene" initially or load the first scene.
    # We should check for the empty state or the editor container.
    expect(page.get_by_text("Select a scene to start writing")).to_be_visible(timeout=10000)

    # Right Sidebar: Book Canvas
    print("Checking Book Canvas...")
    # It might be collapsed or visible. The text "Book Canvas" should be in the header of the panel.
    # The panel has "Book Canvas" text in my implementation.
    expect(page.get_by_text("Book Canvas", exact=True)).to_be_visible()

    # Floating Chat
    print("Checking Floating Chat...")
    # Button with message icon
    expect(page.locator("button.rounded-full")).to_be_visible()

    # 2. Test Interactions
    # Open Chat
    page.locator("button.rounded-full").click()
    # Check for Assistant text in header
    expect(page.get_by_text("Assistant")).to_be_visible()

    # Close Chat
    # Find close button inside the chat card (using X icon)
    # The X icon is lucide-x
    page.locator("button:has(svg.lucide-x)").click()
    expect(page.get_by_text("Assistant")).not_to_be_visible()

    print("Writer View Layout Verified Successfully.")

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            print("Logging in...")
            user = login_as_new_user(page)

            verify_writer_layout(page, user)

        except Exception as e:
            print(f"Verification Failed: {e}")
            page.screenshot(path="verification-failure.png")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    main()
