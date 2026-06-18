from fastapi import APIRouter

from routes import (
    announcements,
    flashcards,
    habits,
    health,
    notes,
    quotes,
    study_buddy,
    study_logs,
    study_tips,
)

router = APIRouter()

router.include_router(health.router)
router.include_router(study_buddy.router)
router.include_router(flashcards.router)
router.include_router(study_tips.router)
router.include_router(quotes.router)
router.include_router(announcements.router)
router.include_router(study_logs.router)
router.include_router(habits.router)
router.include_router(notes.router)
