import os
import subprocess
import sys

def run_verification_scripts():
    # verification directory is the directory containing this script
    verification_dir = os.path.dirname(os.path.abspath(__file__))

    # List all files starting with verify_ and ending with .py
    scripts = [f for f in os.listdir(verification_dir) if f.startswith("verify_") and f.endswith(".py")]

    if not scripts:
        print("No verification scripts found in verification/ directory.")
        return

    print(f"Found {len(scripts)} verification scripts: {', '.join(scripts)}")

    failed_scripts = []

    # Ensure we run from the repo root
    repo_root = os.path.dirname(verification_dir)

    for script in scripts:
        print(f"\n--- Running {script} ---")
        script_path = os.path.join(verification_dir, script)

        # Run the script using the current python executable
        # We pass the environment variables (like BASE_URL)
        result = subprocess.run([sys.executable, script_path], cwd=repo_root, env=os.environ.copy())

        if result.returncode != 0:
            print(f"❌ {script} failed.")
            failed_scripts.append(script)
        else:
            print(f"✅ {script} passed.")

    print("\n--- Summary ---")
    if failed_scripts:
        print(f"❌ {len(failed_scripts)} scripts failed: {', '.join(failed_scripts)}")
        sys.exit(1)
    else:
        print("✅ All verification scripts passed.")
        sys.exit(0)

if __name__ == "__main__":
    run_verification_scripts()
