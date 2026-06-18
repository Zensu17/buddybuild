from datetime import datetime, timezone
from typing import Literal

from pydantic import BaseModel, Field


class StudyBuddyRequest(BaseModel):
    prompt: str = Field(min_length=1, max_length=5000)
    context: str | None = None


class GenerateFlashcardsRequest(BaseModel):
    topic: str = Field(min_length=1, max_length=200)
    course: str = Field(min_length=1, max_length=200)


class StudyTip(BaseModel):
    id: str
    text: str
    category: Literal["productivity", "learning", "wellness", "memory"]


class AnnouncementCreate(BaseModel):
    title: str = Field(min_length=1, max_length=300)
    content: str = Field(min_length=1, max_length=5000)
    category: Literal["akademik", "event", "darurat", "tips"] = "akademik"
    author: str = Field(min_length=1, max_length=200)


class StudyLogCreate(BaseModel):
    course: str = Field(min_length=1, max_length=200)
    minutes: int = Field(gt=0, le=1440)


class HabitItem(BaseModel):
    id: str
    title: str
    completed: bool = False


class HabitsUpdate(BaseModel):
    habits: list[HabitItem]


class NotesUpdate(BaseModel):
    content: str = Field(max_length=50000)


def utc_timestamp() -> str:
    return datetime.now(timezone.utc).isoformat()
