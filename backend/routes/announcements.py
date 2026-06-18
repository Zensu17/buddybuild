from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, HTTPException

from data.store import load_json, save_json
from schemas import AnnouncementCreate

router = APIRouter(tags=["announcements"])

DEFAULT_ANNOUNCEMENTS = [
    {
        "id": "1",
        "title": "Pengumuman Jadwal UTS Genap 2026",
        "content": (
            "Ujian Tengah Semester genap akan dilaksanakan mulai tanggal 22 Juni 2026 "
            "secara offline. Silakan pastikan kehadiran minimal 75%."
        ),
        "category": "akademik",
        "date": datetime.now(timezone.utc).isoformat(),
        "author": "BAA Administrasi",
    },
    {
        "id": "2",
        "title": "Pendaftaran Kompetisi Hackathon Kampus",
        "content": (
            'Telah dibuka registrasi "Campus Innovation Hackathon 2026". '
            "Dapatkan pendanaan inkubasi dan sertifikat konversi SKS gratis!"
        ),
        "category": "event",
        "date": datetime.now(timezone.utc).isoformat(),
        "author": "KEMAHASISWAAN",
    },
    {
        "id": "3",
        "title": "TIPS: Menjaga Fokus Dengan Pomodoro",
        "content": (
            'Gunakan tab "Reminders / Pomodoro Timer" di sebelah kiri untuk '
            "menerapkan metode 25 menit fokus dan 5 menit istirahat demi efisiensi belajar!"
        ),
        "category": "tips",
        "date": datetime.now(timezone.utc).isoformat(),
        "author": "Konselor Akademik",
    },
]


@router.get("/announcements")
async def get_announcements():
    data = load_json("announcements", DEFAULT_ANNOUNCEMENTS)
    return {"success": True, "data": data}


@router.post("/announcements")
async def create_announcement(body: AnnouncementCreate):
    announcements = load_json("announcements", DEFAULT_ANNOUNCEMENTS)
    new_item = {
        "id": str(uuid4()),
        "title": body.title,
        "content": body.content,
        "category": body.category,
        "date": datetime.now(timezone.utc).isoformat(),
        "author": body.author,
    }
    announcements.insert(0, new_item)
    save_json("announcements", announcements)
    return {"success": True, "data": new_item}


@router.delete("/announcements/{announcement_id}")
async def delete_announcement(announcement_id: str):
    announcements = load_json("announcements", DEFAULT_ANNOUNCEMENTS)
    filtered = [item for item in announcements if item["id"] != announcement_id]
    if len(filtered) == len(announcements):
        raise HTTPException(status_code=404, detail="Announcement not found")
    save_json("announcements", filtered)
    return {"success": True}
