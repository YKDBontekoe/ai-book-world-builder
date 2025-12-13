import os
import subprocess
import sys
import concurrent.futures

def run_script(script_path, repo_root, env):
    script_name = os.path.basename(script_path)
    print(f"Starting {script_name}...")
    # Capture output to prevent interleaving
    result = subprocess.run(
        [sys.executable, script_path],
        cwd=repo_root,
        env=env,
        capture_output=True,
        text=True
    )
    return script_name, result

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

    # Set default BASE_URL if not present
    env = os.environ.copy()
    if "BASE_URL" not in env:
        env["BASE_URL"] = "http://localhost:3000"

    print(f"Running scripts in parallel (max_workers=4) against {env['BASE_URL']}...")

    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
        futures = {
            executor.submit(run_script, os.path.join(verification_dir, s), repo_root, env): s
            for s in scripts
        }

        for future in concurrent.futures.as_completed(futures):
            script_name, result = future.result()

            if result.returncode != 0:
                print(f"❌ {script_name} failed.")
                print(f"--- STDOUT ({script_name}) ---")
                print(result.stdout)
                print(f"--- STDERR ({script_name}) ---")
                print(result.stderr)
                print("---------------------------------")
                failed_scripts.append(script_name)
            else:
                print(f"✅ {script_name} passed.")

    print("\n--- Summary ---")
    if failed_scripts:
        print(f"❌ {len(failed_scripts)} scripts failed: {', '.join(failed_scripts)}")
        sys.exit(1)
    else:
        print("✅ All verification scripts passed.")
        sys.exit(0)

if __name__ == "__main__":
    run_verification_scripts()
