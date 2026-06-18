from fastapi.responses import JSONResponse


def error_response(status_code: int, error: str, code: str | None = None) -> JSONResponse:
    payload: dict[str, object] = {"success": False, "error": error}
    if code:
        payload["code"] = code
    return JSONResponse(status_code=status_code, content=payload)
