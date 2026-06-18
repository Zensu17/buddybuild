import json
import os
import re
from typing import Any

from google import genai
from google.genai import types

STUDY_BUDDY_SYSTEM_INSTRUCTION = (
    "Anda adalah BuddyBuild AI, asisten belajar universitas yang serba bisa, "
    "netral, dan objektif. Tugas Anda adalah membantu mahasiswa dari berbagai "
    "disiplin ilmu secara seimbang.\n\n"
    "PENTING:\n"
    "1. Selalu berikan penjelasan secara terstruktur dalam format "
    "Langkah-demi-Langkah (Step-by-Step) yang sangat jelas, terperinci, "
    "dan mudah dipahami oleh mahasiswa.\n"
    "2. Di bagian akhir dari setiap jawaban Anda, Anda WAJIB menambahkan "
    "bagian penutup khusus berjudul '💡 Tips Belajar BuddyBuild:' yang berisi "
    "tips belajar singkat, relevan, praktis, atau teknik mnemonic khusus "
    "berdasarkan topik yang ditanyakan untuk membantu mahasiswa menguasai "
    "konsep tersebut lebih cepat.\n\n"
    "Selalu tanggapi dengan ramah dan gunakan bahasa Indonesia yang baik jika "
    "pertanyaan diketik dalam bahasa Indonesia. Gunakan format markdown untuk "
    "estetika teks yang rapi."
)

FLASHCARD_SYSTEM_INSTRUCTION = """Anda adalah mesin pembuat flashcards otomatis. Anda wajib merespons HANYA dengan objek JSON valid tanpa markdown block (```json). Format output harus tepat seperti ini:
        {
          "title": "Judul Set Flashcard yang menarik",
          "course": "Kode/Nama Mata Kuliah",
          "cards": [
            {
              "front": "Pertanyaan atau istilah kunci di bagian depan kartu",
              "back": "Penjelasan ringkas, definisi, atau jawaban di bagian belakang kartu"
            }
          ]
        }"""


def _get_client() -> genai.Client | None:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("[GeminiService] GEMINI_API_KEY is not defined in the environment.")
        return None
    return genai.Client(api_key=api_key)


def _extract_tokens(response: Any) -> dict[str, int] | None:
    usage = getattr(response, "usage_metadata", None)
    if not usage:
        return None
    return {
        "promptTokens": getattr(usage, "prompt_token_count", 0) or 0,
        "candidatesTokens": getattr(usage, "candidates_token_count", 0) or 0,
        "totalTokens": getattr(usage, "total_token_count", 0) or 0,
    }


def _classify_error(error_message: str) -> str:
    if "API key not valid" in error_message or "not found" in error_message:
        return "ERROR_API_KEY_INVALID"
    if "quota" in error_message.lower():
        return "ERROR_QUOTA_EXCEEDED"
    return f"ERROR: {error_message or 'Connection failed'}"


async def ask_study_buddy(prompt: str, context: str | None = None) -> dict[str, Any]:
    client = _get_client()
    if client is None:
        return {"reply": "ERROR_API_KEY_MISSING"}

    contents = (
        f"Context: {context}\n\nQuestion: {prompt}" if context else prompt
    )

    try:
        response = client.models.generate_content(
            model="gemini-3.5-flash",
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=STUDY_BUDDY_SYSTEM_INSTRUCTION,
                temperature=0.7,
                top_p=0.95,
                top_k=40,
            ),
        )

        text = response.text or (
            "I received an empty response. Please try rephrasing your question."
        )
        result: dict[str, Any] = {"reply": text}
        tokens = _extract_tokens(response)
        if tokens:
            result["tokens"] = tokens
        return result
    except Exception as error:
        print(f"[GeminiService] StudyBuddy AI generation failed: {error}")
        error_message = str(error)
        return {"reply": _classify_error(error_message)}


def _validate_flashcard_data(data: Any) -> None:
    if not data or not isinstance(data, dict):
        raise ValueError("Invalid response format: response must be an object")
    if not isinstance(data.get("title"), str) or not data["title"].strip():
        raise ValueError("Invalid response format: title must be a non-empty string")
    if not isinstance(data.get("course"), str) or not data["course"].strip():
        raise ValueError("Invalid response format: course must be a non-empty string")
    cards = data.get("cards")
    if not isinstance(cards, list) or len(cards) == 0:
        raise ValueError("Invalid response format: cards must be a non-empty array")
    for card in cards:
        if not isinstance(card.get("front"), str) or not card["front"].strip():
            raise ValueError(
                "Invalid response format: card front side must be a non-empty string"
            )
        if not isinstance(card.get("back"), str) or not card["back"].strip():
            raise ValueError(
                "Invalid response format: card back side must be a non-empty string"
            )


async def generate_flashcard_set(topic: str, course: str) -> dict[str, Any]:
    client = _get_client()
    if client is None:
        raise ValueError("ERROR_API_KEY_MISSING")

    try:
        response = client.models.generate_content(
            model="gemini-3.5-flash",
            contents=(
                f'Buatkan set flashcard interaktif belajar tentang topik: "{topic}" '
                f'untuk mata kuliah: "{course}". Hasilkan tepat 6 kartu flashcard '
                f"berkualitas tinggi yang mencakup konsep penting, definisi, "
                f"atau pertanyaan kritis."
            ),
            config=types.GenerateContentConfig(
                system_instruction=FLASHCARD_SYSTEM_INSTRUCTION,
                response_mime_type="application/json",
                temperature=0.8,
            ),
        )

        text = response.text
        if not text:
            raise ValueError("Sistem AI mengembalikan respons kosong.")

        try:
            parsed = json.loads(text)
            _validate_flashcard_data(parsed)
            return parsed
        except json.JSONDecodeError:
            print(
                "[GeminiService] JSON parsing failed, attempting cleanup of AI response text."
            )
            cleaned = re.sub(r"```json\s?|```", "", text).strip()
            parsed = json.loads(cleaned)
            _validate_flashcard_data(parsed)
            return parsed
    except Exception as error:
        print(f"[GeminiService] Flashcard generation failed: {error}")
        raise
