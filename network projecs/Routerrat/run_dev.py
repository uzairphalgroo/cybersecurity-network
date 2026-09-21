import subprocess
import sys
import os
import time

def main():
    print("=" * 60)
    print("🚀 STARTING ROUTERRAT ENTERPRISE TELEMETRY ENGINE & LUXURY GUI")
    print("=" * 60)

    root_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(root_dir, "backend")
    frontend_dir = os.path.join(root_dir, "frontend")

    # Set PYTHONPATH for backend
    env = os.environ.copy()
    env["PYTHONPATH"] = backend_dir

    print("\n[1/2] Starting FastAPI Backend on http://localhost:8000 ...")
    backend_proc = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"],
        cwd=backend_dir,
        env=env
    )

    time.sleep(2)

    print("\n[2/2] Starting Vite Frontend on http://localhost:3000 ...")
    frontend_proc = subprocess.Popen(
        ["npm", "run", "dev"],
        cwd=frontend_dir,
        shell=True
    )

    print("\n" + "=" * 60)
    print("✨ RouterRat is LIVE!")
    print("   • Web GUI:  http://localhost:3000")
    print("   • REST API: http://localhost:8000/docs")
    print("=" * 60 + "\n")

    try:
        backend_proc.wait()
        frontend_proc.wait()
    except KeyboardInterrupt:
        print("\nStopping services...")
        backend_proc.terminate()
        frontend_proc.terminate()

if __name__ == "__main__":
    main()
