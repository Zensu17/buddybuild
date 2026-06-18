from fastapi import APIRouter

router = APIRouter(tags=["study-tips"])

STUDY_TIPS = [
    {
        "id": "1",
        "text": (
            "Gunakan teknik Pomodoro: Belajar 25 menit, istirahat 5 menit "
            "untuk menjaga konsentrasi maksimal."
        ),
        "category": "productivity",
    },
    {
        "id": "2",
        "text": (
            "Riset menunjukkan bahwa mengajar konsep ke orang lain "
            "(Teknik Feynman) mempercepat pemahaman hingga 90%."
        ),
        "category": "learning",
    },
    {
        "id": "3",
        "text": (
            "Minum air putih yang cukup dan hirup udara segar setiap sesi "
            "istirahat belajar meningkatkan fokus otak."
        ),
        "category": "wellness",
    },
    {
        "id": "4",
        "text": (
            "Membuat visualisasi kartu flashcard terbukti memperkuat memori "
            "jangka panjang (Active Recall)."
        ),
        "category": "memory",
    },
]


@router.get("/study-tips")
async def get_study_tips():
    return {"success": True, "data": STUDY_TIPS}
