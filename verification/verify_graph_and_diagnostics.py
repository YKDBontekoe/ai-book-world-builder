import os
import sys
from playwright.sync_api import sync_playwright

def verify_graph_and_diagnostics():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 720})

        # Load auth state if available, otherwise assume we need to handle login or mock
        # For simplicity, we'll try to reach the page.
        # If running in a fresh env, we might need to rely on the dev server being open/mocked.
        # But this script is for the agent to run.

        page = context.new_page()

        try:
            # Go to home
            page.goto("http://localhost:3000")
            page.wait_for_load_state("networkidle")

            # If redirected to login, try a dummy login (if available) or fail gracefully
            if "login" in page.url:
                print("Redirected to login. Attempting demo login...")
                # Assumption: Demo login might exist or we just screenshot login
                # But we need to see the canvas.
                # Since I can't easily login in this script without credentials,
                # I will check if I can access a public project or just screenshot the landing.
                pass

            # Try to navigate to a project (Writer View)
            # We assume there's a project list.
            # Click first project
            if page.get_by_role("link", name="Projects").is_visible():
                page.get_by_role("link", name="Projects").click()
                page.wait_for_load_state("networkidle")

                # Click first project card
                # This selector is fragile, but "Project" text or typical card structure
                page.click(".glass-card") # generic selector
                page.wait_for_load_state("networkidle")

                # Wait for Writer View
                page.wait_for_selector("text=Canvas", timeout=5000)

                # 1. Verify Graph
                # Switch to Graph Pane
                # The Canvas tabs might be visible? Or we need to select "Graph".
                # Assuming "Graph" tab or similar.
                # If using `BookCanvas`, maybe it's in a tab list.
                # "bible", "graph", "diagnostics" are likely tabs or segmented controls.

                # Try to find the segmented control for "Graph"
                if page.get_by_text("Graph").is_visible():
                    page.get_by_text("Graph").click()
                    page.wait_for_timeout(2000) # Wait for dagre layout
                    page.screenshot(path="verification/graph_pane.png")
                    print("Screenshot saved: verification/graph_pane.png")

                # 2. Verify Diagnostics
                if page.get_by_text("Readiness").is_visible() or page.get_by_text("Diagnostics").is_visible():
                     # Click Diagnostics tab/button
                     page.get_by_text("Readiness").click() # Or whatever the label is
                     # Or check if there is an icon?
                     # The file `diagnostics-pane.tsx` has title "Readiness" or "Diagnostics".
                     page.wait_for_timeout(1000)
                     page.screenshot(path="verification/diagnostics_pane.png")
                     print("Screenshot saved: verification/diagnostics_pane.png")

            else:
                print("Could not find Projects link. Saving state.")
                page.screenshot(path="verification/landing_state.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error_state.png")

        browser.close()

if __name__ == "__main__":
    verify_graph_and_diagnostics()
