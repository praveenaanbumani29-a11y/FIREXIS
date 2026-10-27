#!/usr/bin/env python3
"""
FIREXIS — Application Launcher
================================================================================
Runs both the FastAPI backend and React frontend services, generates a local
link to access the application locally, and opens it automatically in the default
web browser.

Usage:
    python app.py                     # Auto-detects and launches both services
    python app.py --mode dev          # Runs FastAPI backend + Vite frontend dev server
    python app.py --mode unified      # Runs single-port FastAPI serving built frontend
    python app.py --no-browser        # Starts services without auto-opening the browser
    python app.py --backend-port 8000 --frontend-port 5173
================================================================================
"""

import os
import sys
import time
import socket
import shutil
import signal
import atexit
import argparse
import subprocess
import threading
import functools
import webbrowser
import urllib.request
import urllib.error
from pathlib import Path

# Always flush output immediately
print = functools.partial(print, flush=True)

# Configure utf-8 stdout/stderr on Windows if possible
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

# Enable VT100 / ANSI escape sequences on Windows consoles
if os.name == "nt":
    os.system("")

# ANSI Color Codes
CYAN = "\033[96m"
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
BOLD = "\033[1m"
DIM = "\033[2m"
RESET = "\033[0m"

ROOT_DIR = Path(__file__).resolve().parent
FRONTEND_DIR = ROOT_DIR / "frontend"
FRONTEND_DIST = FRONTEND_DIR / "dist"
BACKEND_DIR = ROOT_DIR / "backend"

ACTIVE_PROCESSES: list[tuple[str, subprocess.Popen]] = []
SHUTTING_DOWN = False


def log_info(msg: str) -> None:
    print(f"{CYAN}[FIREXIS]{RESET} {msg}")


def log_success(msg: str) -> None:
    print(f"{GREEN}[FIREXIS +]{RESET} {msg}")


def log_warn(msg: str) -> None:
    print(f"{YELLOW}[FIREXIS !]{RESET} {msg}")


def log_error(msg: str) -> None:
    print(f"{RED}[FIREXIS x]{RESET} {msg}")


def is_port_in_use(host: str, port: int) -> bool:
    """Check if a TCP port is in use."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.5)
        try:
            s.connect((host, port))
            return True
        except (socket.timeout, ConnectionRefusedError, OSError):
            return False


def find_free_port(host: str, start_port: int, max_attempts: int = 20) -> int:
    """Find an available port starting from start_port."""
    for port in range(start_port, start_port + max_attempts):
        if not is_port_in_use(host, port):
            return port
    return start_port


def is_backend_healthy(host: str, port: int) -> bool:
    """Test if FIREXIS FastAPI backend is responding to /api/health."""
    url = f"http://{host}:{port}/api/health"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "FIREXIS-Launcher"})
        with urllib.request.urlopen(req, timeout=1.0) as resp:
            return resp.status == 200
    except Exception:
        return False


def wait_for_service(url: str, name: str, timeout: float = 20.0, interval: float = 0.4) -> bool:
    """Wait until an HTTP service responds with a 2xx or 3xx status code."""
    deadline = time.time() + timeout
    while time.time() < deadline:
        if SHUTTING_DOWN:
            return False
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "FIREXIS-Launcher"})
            with urllib.request.urlopen(req, timeout=1.0) as resp:
                if resp.status < 400:
                    return True
        except Exception:
            pass
        time.sleep(interval)
    return False


def kill_process_tree(proc: subprocess.Popen, name: str = "Process") -> None:
    """Safely terminate a process and all of its descendants."""
    if proc is None or proc.poll() is not None:
        return

    try:
        if os.name == "nt":
            # On Windows, kill the entire process tree using taskkill
            subprocess.run(
                ["taskkill", "/F", "/T", "/PID", str(proc.pid)],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                check=False
            )
        else:
            proc.terminate()
            try:
                proc.wait(timeout=3)
            except subprocess.TimeoutExpired:
                proc.kill()
    except Exception as e:
        try:
            proc.kill()
        except Exception:
            pass


def shutdown_all_services() -> None:
    """Terminate all running backend and frontend subprocesses cleanly."""
    global SHUTTING_DOWN
    if SHUTTING_DOWN or not ACTIVE_PROCESSES:
        return
    SHUTTING_DOWN = True

    divider = "-" * 60
    print(f"\n{YELLOW}{BOLD}{divider}{RESET}")
    print(f"{YELLOW}[FIREXIS] Shutting down all active services gracefully...{RESET}")

    for name, proc in reversed(ACTIVE_PROCESSES):
        if proc.poll() is None:
            print(f"{DIM}  Stopping {name} (PID {proc.pid})...{RESET}")
            kill_process_tree(proc, name)

    ACTIVE_PROCESSES.clear()
    log_success("All FIREXIS services stopped cleanly. Goodbye!")
    print(f"{YELLOW}{BOLD}{divider}{RESET}\n")


def signal_handler(sig, frame):
    shutdown_all_services()
    sys.exit(0)


# Register shutdown handlers
signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)
atexit.register(shutdown_all_services)


def stream_output(pipe, prefix: str, color: str) -> None:
    """Read lines from process stdout/stderr and output with a formatted prefix."""
    try:
        for line in iter(pipe.readline, ""):
            if not line:
                break
            stripped = line.rstrip("\r\n")
            if stripped:
                print(f"{color}[{prefix}]{RESET} {stripped}")
    except (ValueError, OSError):
        pass


def check_prerequisites() -> tuple[bool, bool]:
    """Check Python packages and Node.js/npm availability."""
    # Check Python requirements
    try:
        import fastapi
        import uvicorn
    except ImportError:
        log_error("FastAPI or Uvicorn is missing. Install requirements:")
        print(f"  {BOLD}pip install -r backend/requirements.txt{RESET}")
        sys.exit(1)

    # Check Node / npm
    npm_path = shutil.which("npm")
    node_path = shutil.which("node")
    has_node = bool(npm_path and node_path)

    # Check node_modules
    has_node_modules = (FRONTEND_DIR / "node_modules").is_dir()
    has_dist = (FRONTEND_DIST / "index.html").is_file()

    return has_node and has_node_modules, has_dist


def build_frontend_if_needed() -> bool:
    """Build the frontend if dist is missing and npm is available."""
    if (FRONTEND_DIST / "index.html").is_file():
        return True

    npm_cmd = shutil.which("npm")
    if not npm_cmd:
        return False

    log_info("Frontend production bundle not found. Building now...")
    try:
        cmd = [npm_cmd, "run", "build"]
        res = subprocess.run(
            cmd,
            cwd=str(FRONTEND_DIR),
            shell=(os.name == "nt"),
            capture_output=True,
            text=True
        )
        if res.returncode == 0:
            log_success("Frontend build completed successfully.")
            return True
        else:
            log_error(f"Frontend build failed:\n{res.stderr}")
            return False
    except Exception as e:
        log_error(f"Error while building frontend: {e}")
        return False


def start_backend(host: str, port: int, reload: bool = True) -> subprocess.Popen:
    """Launch the FastAPI backend via uvicorn in a subprocess."""
    log_info(f"Starting Backend API service on http://{host}:{port}...")

    cmd = [
        sys.executable,
        "-m",
        "uvicorn",
        "backend.main:app",
        "--host",
        host,
        "--port",
        str(port),
    ]
    if reload:
        cmd.append("--reload")

    env = os.environ.copy()
    env["PYTHONUNBUFFERED"] = "1"
    env["PYTHONPATH"] = str(ROOT_DIR)

    proc = subprocess.Popen(
        cmd,
        cwd=str(ROOT_DIR),
        env=env,
        stdin=subprocess.DEVNULL,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
        encoding="utf-8",
        errors="replace"
    )
    ACTIVE_PROCESSES.append(("Backend (FastAPI)", proc))

    # Stream backend logs in a background thread
    t = threading.Thread(
        target=stream_output,
        args=(proc.stdout, "Backend", CYAN),
        daemon=True
    )
    t.start()

    return proc


def start_frontend_dev(host: str, port: int, backend_port: int) -> subprocess.Popen:
    """Launch Vite dev server for the frontend."""
    log_info(f"Starting Frontend Vite server on http://{host}:{port}...")

    npm_cmd = shutil.which("npm") or "npm"
    cmd = [
        npm_cmd,
        "run",
        "dev",
        "--",
        "--host",
        host,
        "--port",
        str(port),
    ]

    proc = subprocess.Popen(
        cmd,
        cwd=str(FRONTEND_DIR),
        stdin=subprocess.DEVNULL,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
        shell=(os.name == "nt"),
        encoding="utf-8",
        errors="replace"
    )
    ACTIVE_PROCESSES.append(("Frontend (Vite)", proc))

    # Stream frontend logs in a background thread
    t = threading.Thread(
        target=stream_output,
        args=(proc.stdout, "Frontend", GREEN),
        daemon=True
    )
    t.start()

    return proc


def print_banner(primary_url: str, backend_url: str, mode: str, host: str, backend_port: int, frontend_port: int) -> None:
    """Display the primary local link and operational status in a high-visibility banner."""
    line = "=" * 78
    subline = "-" * 78

    print(f"\n{BOLD}{CYAN}{line}{RESET}")
    print(f"{BOLD}{CYAN}   [FIREXIS] Fire Exit Risk Evaluation and Intelligent Safety System{RESET}")
    print(f"{BOLD}{CYAN}{line}{RESET}")
    print(f"   {DIM}Acoustic, Thermal, Topological & Multi-Agent Evacuation Digital Twin{RESET}\n")

    print(f"   {GREEN}{BOLD}>>> LOCAL APPLICATION LINK:{RESET}   {BOLD}{primary_url}{RESET}")
    print(f"   {CYAN}    Backend REST API:{RESET}         http://{host}:{backend_port}")
    print(f"   {CYAN}    Interactive API Docs:{RESET}     http://{host}:{backend_port}/docs")
    print(f"   {CYAN}    Health Status Endpoint:{RESET}   http://{host}:{backend_port}/api/health")

    if mode == "dev":
        print(f"   {YELLOW}    Unified Server Mirror:{RESET}    http://{host}:{backend_port}/")

    print(f"\n{DIM}{subline}{RESET}")
    print(f"   {GREEN}{BOLD}[STATUS]{RESET}   Both Backend and Frontend are operational and connected.")
    print(f"   {CYAN}{BOLD}[MODE]{RESET}     Running in {BOLD}{mode.upper()}{RESET} mode.")
    print(f"   {YELLOW}{BOLD}[CONTROL]{RESET}  Press {BOLD}Ctrl+C{RESET} in this terminal window to stop all services.")
    print(f"{BOLD}{CYAN}{line}{RESET}\n")


def parse_arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="FIREXIS — Safety Platform Local Launcher",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "--mode",
        choices=["auto", "dev", "unified"],
        default="auto",
        help="Launch mode: 'auto' (dev if node available, else unified), 'dev' (Vite + FastAPI), or 'unified' (FastAPI single port).",
    )
    parser.add_argument(
        "--host",
        default="127.0.0.1",
        help="Host address to bind servers.",
    )
    parser.add_argument(
        "--backend-port",
        type=int,
        default=8000,
        help="Port for the FastAPI backend service.",
    )
    parser.add_argument(
        "--frontend-port",
        type=int,
        default=5173,
        help="Port for the Vite frontend dev server.",
    )
    parser.add_argument(
        "--no-browser",
        action="store_true",
        help="Do not automatically open the application in the web browser.",
    )
    parser.add_argument(
        "--no-reload",
        action="store_true",
        help="Disable auto-reloading for the backend server.",
    )
    parser.add_argument(
        "--build",
        action="store_true",
        help="Rebuild the frontend production bundle before launching.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_arguments()

    print(f"\n{BOLD}{CYAN}FIREXIS — Initializing Local Application Environment...{RESET}")

    # Check prerequisites
    has_node_dev, has_dist = check_prerequisites()

    if args.build:
        build_frontend_if_needed()
        has_dist = (FRONTEND_DIST / "index.html").is_file()

    # Determine mode
    resolved_mode = args.mode
    if resolved_mode == "auto":
        if has_node_dev:
            resolved_mode = "dev"
        elif has_dist:
            resolved_mode = "unified"
            log_warn("Node.js/npm not detected for dev server. Running in high-performance Unified mode.")
        else:
            # Try to build if npm exists
            built = build_frontend_if_needed()
            resolved_mode = "unified" if built else "dev"

    # Port availability check
    backend_port = args.backend_port
    if is_port_in_use(args.host, backend_port):
        if is_backend_healthy(args.host, backend_port):
            log_info(f"Existing FIREXIS backend detected running on http://{args.host}:{backend_port}.")
        else:
            log_warn(f"Port {backend_port} is already in use by another process.")
            backend_port = find_free_port(args.host, backend_port + 1)
            log_info(f"Assigned free port {backend_port} for backend.")

    frontend_port = args.frontend_port
    if resolved_mode == "dev" and is_port_in_use(args.host, frontend_port):
        log_warn(f"Port {frontend_port} is already in use.")
        frontend_port = find_free_port(args.host, frontend_port + 1)
        log_info(f"Assigned free port {frontend_port} for frontend dev server.")

    # 1. Start Backend
    backend_proc = None
    if not is_backend_healthy(args.host, backend_port):
        backend_proc = start_backend(args.host, backend_port, reload=not args.no_reload)
    else:
        log_success(f"Backend is already healthy on http://{args.host}:{backend_port}")

    # Wait for backend health
    backend_health_url = f"http://{args.host}:{backend_port}/api/health"
    log_info("Verifying backend healthcheck...")
    if not wait_for_service(backend_health_url, "Backend API", timeout=15.0):
        log_error("Backend failed to start within 15 seconds. Please check logs.")
        shutdown_all_services()
        sys.exit(1)
    log_success("Backend is healthy and responding.")

    # 2. Start Frontend (if dev mode)
    primary_url = f"http://localhost:{backend_port}/"
    if resolved_mode == "dev":
        start_frontend_dev(args.host, frontend_port, backend_port)
        frontend_url = f"http://localhost:{frontend_port}/"
        log_info(f"Waiting for Vite dev server on {frontend_url}...")
        if wait_for_service(frontend_url, "Frontend (Vite)", timeout=15.0):
            log_success("Frontend dev server is active and responding.")
            primary_url = frontend_url
        else:
            log_warn("Frontend dev server took longer than expected; fallback to unified server.")
            primary_url = f"http://localhost:{backend_port}/"
    else:
        # In unified mode, the primary url is the backend which serves the built frontend
        primary_url = f"http://localhost:{backend_port}/"

    # 3. Print high-visibility banner with local link
    backend_url = f"http://{args.host}:{backend_port}"
    print_banner(
        primary_url=primary_url,
        backend_url=backend_url,
        mode=resolved_mode,
        host=args.host,
        backend_port=backend_port,
        frontend_port=frontend_port
    )

    # 4. Open in browser
    if not args.no_browser:
        log_info(f"Launching web browser at {primary_url} ...")
        try:
            webbrowser.open(primary_url)
        except Exception as e:
            log_warn(f"Could not open browser automatically: {e}")

    # 5. Keep main process alive and monitor child processes
    try:
        while not SHUTTING_DOWN:
            time.sleep(0.5)
            # Check if any child process died unexpectedly
            for name, proc in ACTIVE_PROCESSES:
                code = proc.poll()
                if code is not None and not SHUTTING_DOWN:
                    log_error(f"{name} exited unexpectedly with return code {code}.")
                    shutdown_all_services()
                    sys.exit(code or 1)
    except KeyboardInterrupt:
        shutdown_all_services()
        sys.exit(0)


if __name__ == "__main__":
    main()
