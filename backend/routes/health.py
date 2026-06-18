from datetime import datetime, timezone

from fastapi import APIRouter

from schemas import utc_timestamp

router = APIRouter(tags=["health"])


@router.get("/health")
async def health_check():
    return {
        "success": True,
        "status": "ok",
        "backend": "python-fastapi-buddybuild",
        "timestamp": utc_timestamp(),
    }


@router.get("/features")
async def list_features():
    return {
        "success": True,
        "app": "BuddyBuild",
        "backend": "python-fastapi-buddybuild",
        "features": {
            "health": "GET /buddybuild/health",
            "features": "GET /buddybuild/features",
            "study-buddy": "POST /buddybuild/study-buddy",
            "flashcards": "POST /buddybuild/flashcards/generate",
            "study-tips": "GET /buddybuild/study-tips",
            "quotes": "GET /buddybuild/quotes",
            "announcements": "GET|POST /buddybuild/announcements, DELETE /buddybuild/announcements/{id}",
            "study-logs": "GET|POST /buddybuild/study-logs, DELETE /buddybuild/study-logs/{id}",
            "habits": "GET|PUT /buddybuild/habits",
            "notes": "GET|PUT /buddybuild/notes",
        },
        "timestamp": utc_timestamp(),
    }
