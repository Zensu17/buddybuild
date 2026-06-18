import json
from pathlib import Path
from typing import Any

DATA_DIR = Path(__file__).resolve().parent
DATA_DIR.mkdir(parents=True, exist_ok=True)


def _file_path(name: str) -> Path:
    return DATA_DIR / f"{name}.json"


def load_json(name: str, default: Any) -> Any:
    path = _file_path(name)
    if not path.exists():
        save_json(name, default)
        return default
    try:
        with path.open(encoding="utf-8") as handle:
            return json.load(handle)
    except (json.JSONDecodeError, OSError):
        save_json(name, default)
        return default


def save_json(name: str, data: Any) -> None:
    path = _file_path(name)
    with path.open("w", encoding="utf-8") as handle:
        json.dump(data, handle, ensure_ascii=False, indent=2)
