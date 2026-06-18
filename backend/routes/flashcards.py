from fastapi import APIRouter, Depends

from middleware.limiter import LimiterOptions, create_rate_limiter
from schemas import GenerateFlashcardsRequest
from services.gemini_service import generate_flashcard_set
from utils.responses import error_response

router = APIRouter(tags=["flashcards"])

flashcards_limiter = create_rate_limiter(
    LimiterOptions(
        window_ms=60_000,
        max_requests=10,
        message=(
            "Terlalu banyak permintaan alat AI dari IP ini. "
            "Silakan tunggu 1 menit sebelum mengirim lagi."
        ),
    )
)


@router.post("/flashcards/generate", dependencies=[Depends(flashcards_limiter)])
async def handle_generate_flashcards(body: GenerateFlashcardsRequest):
    print(
        f'[Flashcards] Generating flashcards. Topic: "{body.topic}", '
        f'Course: "{body.course}"'
    )

    try:
        result = await generate_flashcard_set(body.topic, body.course)
        return {
            "success": True,
            "count": len(result.get("cards", [])),
            "data": result,
        }
    except ValueError as error:
        message = str(error)
        if message == "ERROR_API_KEY_MISSING":
            return error_response(
                500,
                "Configuration error: GEMINI_API_KEY environment variable is not defined on the server.",
                "API_KEY_MISSING",
            )
        return error_response(500, message)
    except Exception as error:
        print(f"[Flashcards] Generator error: {error}")
        message = str(error)

        if "API key not valid" in message or "not found" in message:
            return error_response(
                401,
                "Authentication error: The configured GEMINI_API_KEY is invalid.",
                "API_KEY_INVALID",
            )

        if "quota" in message.lower():
            return error_response(
                429,
                "Rate limit error: Gemini API quota exceeded. Please try again later.",
                "QUOTA_EXCEEDED",
            )

        return error_response(500, message or "Failed to generate flashcards via AI.")
