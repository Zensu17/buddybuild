import threading
import time
from collections.abc import Callable
from dataclasses import dataclass

from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware


@dataclass
class LimiterOptions:
    window_ms: int
    max_requests: int
    message: str


class _RateLimitStore:
    def __init__(self) -> None:
        self._store: dict[str, dict[str, int]] = {}
        self._lock = threading.Lock()
        self._start_cleanup()

    def _start_cleanup(self) -> None:
        def cleanup() -> None:
            while True:
                time.sleep(60 * 60)
                now = int(time.time() * 1000)
                with self._lock:
                    expired = [
                        ip
                        for ip, entry in self._store.items()
                        if now > entry["reset_time"]
                    ]
                    for ip in expired:
                        del self._store[ip]

        thread = threading.Thread(target=cleanup, daemon=True)
        thread.start()

    def check(self, ip: str, options: LimiterOptions) -> bool:
        now = int(time.time() * 1000)

        with self._lock:
            entry = self._store.get(ip)
            if entry is None or now > entry["reset_time"]:
                self._store[ip] = {
                    "count": 1,
                    "reset_time": now + options.window_ms,
                }
                return True

            entry["count"] += 1
            return entry["count"] <= options.max_requests


_ip_store = _RateLimitStore()


def create_rate_limiter(options: LimiterOptions) -> Callable:
    """Creates a dependency that enforces in-memory rate limiting per IP."""

    async def rate_limit_dependency(request: Request) -> None:
        ip = request.client.host if request.client else "unknown-ip"
        if not _ip_store.check(ip, options):
            print(
                f"[RateLimiter] Rate limit exceeded for IP: {ip} "
                f"on path {request.url.path}"
            )
            raise RateLimitExceeded(options.message)

    return rate_limit_dependency


class RateLimitExceeded(Exception):
    def __init__(self, message: str) -> None:
        self.message = message
        super().__init__(message)
