from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, HTTPException

from data.store import load_json, save_json
from schemas import StudyLogCreate

router = APIRouter(tags=["study-logs"])

DEFAULT_STUDY_LOGS = [
    {
        "id": "1",
        "course": "Kalkulus",
        "minutes": 120,
        "date": datetime.now(timezone.utc).isoformat(),
    },
    {
        "id": "2",
        "course": "Struktur Data",
        "minutes": 180,
        "date": datetime.now(timezone.utc).isoformat(),
    },
    {
        "id": "3",
        "course": "Fisika Dasar",
        "minutes": 90,
        "date": datetime.now(timezone.utc).isoformat(),
    },
    {
        "id": "4",
        "course": "Bahasa Inggris",
        "minutes": 60,
        "date": datetime.now(timezone.utc).isoformat(),
    },
]


@router.get("/study-logs")
async def get_study_logs():
    data = load_json("study_logs", DEFAULT_STUDY_LOGS)
    return {"success": True, "data": data}


@router.post("/study-logs")
async def create_study_log(body: StudyLogCreate):
    logs = load_json("study_logs", DEFAULT_STUDY_LOGS)
    new_log = {
        "id": str(uuid4()),
        "course": body.course,
        "minutes": body.minutes,
        "date": datetime.now(timezone.utc).isoformat(),
    }
    logs.insert(0, new_log)
    save_json("study_logs", logs)
    return {"success": True, "data": new_log}


@router.delete("/study-logs/{log_id}")
async def delete_study_log(log_id: str):
    logs = load_json("study_logs", DEFAULT_STUDY_LOGS)
    filtered = [item for item in logs if item["id"] != log_id]
    if len(filtered) == len(logs):
        raise HTTPException(status_code=404, detail="Study log not found")
    save_json("study_logs", filtered)
    return {"success": True}
