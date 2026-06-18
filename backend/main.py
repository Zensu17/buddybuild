import os
import sys
from pathlib import Path

import uvicorn

BACKEND_DIR = Path(__file__).resolve().parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app import create_app  # noqa: E402

app = create_app()


def main() -> None:
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument("--reload", action="store_true", help="Enable auto-reload for development")
    args = parser.parse_args()

    port = int(os.environ.get("PORT", "3000"))
    reload = args.reload or os.environ.get("NODE_ENV") != "production"

    print(f"[Backend-Server] Starting Python FastAPI backend on port {port}")
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=reload,
        reload_dirs=[str(BACKEND_DIR)] if reload else None,
    )


if __name__ == "__main__":
    main()
