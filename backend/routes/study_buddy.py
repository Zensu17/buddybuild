from fastapi import APIRouter, Depends

from middleware.limiter import LimiterOptions, create_rate_limiter
from schemas import StudyBuddyRequest
from services.gemini_service import ask_study_buddy
from utils.responses import error_response

router = APIRouter(tags=["study-buddy"])

study_buddy_limiter = create_rate_limiter(
    LimiterOptions(
        window_ms=60_000,
        max_requests=10,
        message=(
            "Terlalu banyak permintaan ke Asisten Belajar dari IP ini. "
            "Silakan tunggu 1 menit sebelum mengirim lagi."
        ),
    )
)


@router.post("/study-buddy", dependencies=[Depends(study_buddy_limiter)])
async def handle_study_buddy(body: StudyBuddyRequest):
    print(
        f"[StudyBuddy] Generating response. Prompt length: {len(body.prompt)}"
    )
    result = await ask_study_buddy(body.prompt, body.context)
    reply = result["reply"]

    if reply == "ERROR_API_KEY_MISSING":
        return error_response(
            500,
            "Configuration error: GEMINI_API_KEY environment variable is not defined on the server.",
            "API_KEY_MISSING",
        )

    if reply == "ERROR_API_KEY_INVALID":
        return error_response(
            401,
            "Authentication error: The configured GEMINI_API_KEY is invalid.",
            "API_KEY_INVALID",
        )

    if reply == "ERROR_QUOTA_EXCEEDED":
        return error_response(
            429,
            "Rate limit error: Gemini API quota exceeded. Please try again later.",
            "QUOTA_EXCEEDED",
        )

    if reply.startswith("ERROR:"):
        return error_response(
            502,
            f"AI Service error: {reply.replace('ERROR:', '').strip()}",
            "AI_SERVICE_ERROR",
        )

    return {"success": True, **result}
