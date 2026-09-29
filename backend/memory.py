import json
import os
from difflib import SequenceMatcher

MEMORY_FILE = "memory.json"


def load_memory():
    if not os.path.exists(MEMORY_FILE):
        return []

    try:
        with open(MEMORY_FILE, "r", encoding="utf-8") as file:
            return json.load(file)
    except Exception:
        return []


def save_memory(memory):
    with open(MEMORY_FILE, "w", encoding="utf-8") as file:
        json.dump(memory, file, indent=2)


def similarity(text1, text2):
    return SequenceMatcher(
        None,
        text1.lower(),
        text2.lower()
    ).ratio()


def find_similar(error, threshold=0.35):
    memory = load_memory()

    best_match = None
    best_score = 0

    for incident in memory:
        score = similarity(error, incident["error"])

        if score > best_score:
            best_score = score
            best_match = incident

    if best_match and best_score >= threshold:
        return best_match, best_score

    return None, 0


def add_incident(
    error,
    root_cause,
    fix,
    success
):
    memory = load_memory()

    incident_number = len(memory) + 1

    incident = {
        "id": f"INC-{incident_number:03d}",
        "error": error,
        "root_cause": root_cause,
        "fix": fix,
        "success": success
    }

    memory.append(incident)
    save_memory(memory)

    return incident