# Visual Verification

This directory contains Python scripts for visual verification using Playwright, as mandated by the project's [AGENTS.md](../AGENTS.md).

## Usage

### 1. Run all visual tests

```bash
pnpm test:visual
```

This will discover and run all scripts matching `verify_*.py`.

### 2. Create a new verification script

Create a file named `verify_<feature>.py`. Use the `utils` module to handle setup, login, and screenshots.

```python
from playwright.sync_api import sync_playwright
from utils import login_as_new_user, take_screenshot

def verify_feature():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            # Login (creates a fresh user)
            login_as_new_user(page)

            # Navigate and interact
            # Note: utils.BASE_URL defaults to http://localhost:3000
            # You can import BASE_URL from utils if needed

            # Take a screenshot
            take_screenshot(page, "my_feature_working")

        finally:
            browser.close()

if __name__ == "__main__":
    verify_feature()
```

### 3. Check Screenshots

Screenshots are saved in `verification/screenshots/`. Review them to ensure the UI matches the "Native macOS" aesthetic.

## Utilities (`utils.py`)

- `login_as_new_user(page)`: Registers a new user with a random email/password and logs them in. Returns the credentials.
- `take_screenshot(page, name)`: Saves a screenshot to `verification/screenshots/<name>.png`. Automatically handles directory creation.
- `generate_user_credentials()`: Returns random credentials.
