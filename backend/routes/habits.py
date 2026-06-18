from fastapi import APIRouter

from data.store import load_json, save_json
from schemas import HabitsUpdate

router = APIRouter(tags=["habits"])

DEFAULT_HABITS = [
    {"id": "1", "title": "Sesi Fokus Pomodoro", "completed": False},
    {"id": "2", "title": "Tinjau Rencana Jadwal Kuliah", "completed": False},
    {"id": "3", "title": "Latihan Kuis / Kerjakan Flashcard", "completed": False},
    {"id": "4", "title": "Konsumsi Air Putih & Istirahat", "completed": False},
]


@router.get("/habits")
async def get_habits():
    data = load_json("habits", DEFAULT_HABITS)
    return {"success": True, "data": data}


@router.put("/habits")
async def update_habits(body: HabitsUpdate):
    habits = [habit.model_dump() for habit in body.habits]
    save_json("habits", habits)
    return {"success": True, "data": habits}
