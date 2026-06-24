import os
import traceback
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from middleware.limiter import RateLimitExceeded
from middleware.logger import RequestLoggerMiddleware
from routes import router as api_router

load_dotenv(Path(__file__).resolve().parent.parent / ".env")


def create_app() -> FastAPI:
    app = FastAPI(title="BuddyBuild API")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization"],
    )
    app.add_middleware(RequestLoggerMiddleware)

    app.include_router(api_router, prefix="/buddybuild")

    @app.get("/buddybuild")
    async def buddybuild_index():
        from routes.health import list_features
        return await list_features()

    @app.exception_handler(RateLimitExceeded)
    async def rate_limit_handler(_request: Request, exc: RateLimitExceeded):
        return JSONResponse(
            status_code=429,
            content={"success": False, "error": exc.message},
        )

    @app.exception_handler(RequestValidationError)
    async def validation_handler(_request: Request, exc: RequestValidationError):
        details: dict[str, str] = {}
        for error in exc.errors():
            field = ".".join(str(part) for part in error.get("loc", []) if part != "body")
            if not field:
                field = "body"
            details[field] = error.get("msg", "Invalid value")

        return JSONResponse(
            status_code=400,
            content={
                "success": False,
                "error": "Validation failed.",
                "details": details,
            },
        )

    @app.exception_handler(Exception)
    async def global_error_handler(request: Request, exc: Exception):
        is_production = os.environ.get("NODE_ENV") == "production"
        print(
            f"[ServerError] Error occurred during {request.method} {request.url.path}:"
        )
        print(traceback.format_exc())

        payload: dict[str, object] = {
            "success": False,
            "error": str(exc) or "An unexpected error occurred on the server.",
        }
        if not is_production:
            payload["stack"] = traceback.format_exc()

        return JSONResponse(status_code=500, content=payload)

    _mount_static_files(app)
    return app


def _mount_static_files(app: FastAPI) -> None:
    dist_path = Path(__file__).resolve().parent.parent / "frontend" / "dist"
    if not dist_path.exists():
        return

    app.mount("/assets", StaticFiles(directory=dist_path / "assets"), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path.startswith("buddybuild"):
            return JSONResponse(status_code=404, content={"detail": "Not Found"})

        file_path = dist_path / full_path
        if full_path and file_path.is_file():
            return FileResponse(file_path)

        index_path = dist_path / "index.html"
        if index_path.exists():
            return FileResponse(index_path)

        return JSONResponse(status_code=404, content={"detail": "Not Found"})
