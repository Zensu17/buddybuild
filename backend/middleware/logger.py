import time
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response


class RequestLoggerMiddleware(BaseHTTPMiddleware):
    """Lightweight request logging middleware."""

    async def dispatch(self, request: Request, call_next) -> Response:
        start = time.time()
        path = request.url.path
        if request.url.query:
            path = f"{path}?{request.url.query}"

        response = await call_next(request)
        duration = int((time.time() - start) * 1000)
        status = response.status_code

        if status >= 500:
            status_text = f"\033[31m[{status}]\033[0m"
        elif status >= 400:
            status_text = f"\033[33m[{status}]\033[0m"
        elif status >= 200:
            status_text = f"\033[32m[{status}]\033[0m"
        else:
            status_text = f"[{status}]"

        print(
            f"[Server] {request.method} to {path} - "
            f"Status: {status_text} - Duration: {duration}ms"
        )
        return response
