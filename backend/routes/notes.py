from fastapi import APIRouter

from data.store import load_json, save_json
from schemas import NotesUpdate

router = APIRouter(tags=["notes"])

DEFAULT_NOTES = {"content": ""}


@router.get("/notes")
async def get_notes():
    data = load_json("notes", DEFAULT_NOTES)
    return {"success": True, "data": data}


@router.put("/notes")
async def update_notes(body: NotesUpdate):
    payload = {"content": body.content}
    save_json("notes", payload)
    return {"success": True, "data": payload}
