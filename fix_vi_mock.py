import os
import re

TESTS_DIR = "/Users/youribontekoe/RiderProjects/ai-book-world-builder/tests"

# Regex for "as generic as vi.Mock" -> "as unknown as Mock"
# And adding import if missing.

def process_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Replace "vi.Mock" with "Mock" (from vitest)
    # The error "Cannot find namespace 'vi'" usually means we should use import { Mock } from 'vitest' and type as `Mock`.
    
    if "vi.Mock" in content:
        new_content = content.replace("vi.Mock", "Mock")
        
        # Add import if needed
        if "import { Mock" not in new_content and "import { type Mock" not in new_content:
             # Try to append to existing vitest import
             if 'from "vitest";' in new_content:
                 new_content = new_content.replace('from "vitest";', ', type Mock } from "vitest";')
                 # Clean up double } if any
                 new_content = new_content.replace("}, type Mock }", ", type Mock }")
                 new_content = new_content.replace("{, type Mock", "{ type Mock")
                 new_content = new_content.replace("import {", "import {") # no change
             else:
                 # Add import
                 new_content = 'import { type Mock } from "vitest";\n' + new_content
        
        if new_content != content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
                print(f"Fixed vi.Mock in {file_path}")

print("Fixing vi.Mock types...")
for root, dirs, files in os.walk(TESTS_DIR):
    for f in files:
        if f.endswith(".ts") or f.endswith(".tsx"):
            process_file(os.path.join(root, f))
print("Done.")
