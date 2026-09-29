from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from memory import (
    load_memory,
    find_similar,
    add_incident
)

from analyzer import analyze_eda_error


# ============================================================
# APPLICATION
# ============================================================

app = FastAPI(
    title="EDA Copilot",
    description="AI-powered VLSI engineering memory assistant",
    version="1.0.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# REQUEST MODELS
# ============================================================

class AnalyzeRequest(BaseModel):
    error: str


class FeedbackRequest(BaseModel):
    incident_id: str
    error: str
    root_cause: str
    fix: str
    success: bool


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():
    return {
        "success": True,
        "message": "EDA Copilot backend is running 🚀"
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/api/health")
def health():
    return {
        "success": True,
        "status": "online",
        "service": "EDA Copilot"
    }


# ============================================================
# ANALYZE EDA ERROR
# ============================================================

@app.post("/api/analyze")
def analyze_error(request: AnalyzeRequest):

    error = request.error.strip()

    # Validate input
    if not error:
        return {
            "success": False,
            "message": "Please enter an EDA error."
        }

    # --------------------------------------------------------
    # STEP 1: Analyze the EDA error
    # --------------------------------------------------------

    analysis = analyze_eda_error(error)

    # --------------------------------------------------------
    # STEP 2: Search engineering memory
    # --------------------------------------------------------

    incident, score = find_similar(error)

    # --------------------------------------------------------
    # STEP 3: Previous incident found
    # --------------------------------------------------------

    if incident:

        recommendation = incident["fix"]

        root_cause = incident["root_cause"]

        confidence = max(
            analysis["confidence"],
            score
        )

        return {
            "success": True,

            "incident_id": incident["id"],

            "error": error,

            "diagnosis": {
                "root_cause": root_cause,
                "confidence": confidence,
                "category": analysis["category"]
            },

            "memory": {
                "found": True,
                "similarity": score,
                "previous_incident": incident["id"],
                "previous_error": incident["error"],
                "previous_fix": incident["fix"],
                "previous_result": (
                    "Successful"
                    if incident["success"]
                    else "Failed"
                )
            },

            "recommendation": recommendation
        }

    # --------------------------------------------------------
    # STEP 4: No previous incident found
    # --------------------------------------------------------

    return {
        "success": True,

        "incident_id": "NEW",

        "error": error,

        "diagnosis": {
            "root_cause": analysis["root_cause"],
            "confidence": analysis["confidence"],
            "category": analysis["category"]
        },

        "memory": {
            "found": False,
            "similarity": 0,
            "previous_incident": None,
            "previous_error": None,
            "previous_fix": None,
            "previous_result": None
        },

        "recommendation": analysis["recommendation"]
    }


# ============================================================
# ENGINEER FEEDBACK
# ============================================================

@app.post("/api/feedback")
def feedback(request: FeedbackRequest):

    incident = add_incident(
        error=request.error,
        root_cause=request.root_cause,
        fix=request.fix,
        success=request.success
    )

    return {
        "success": True,
        "message": "Incident stored in engineering memory 🧠",
        "incident": incident
    }


# ============================================================
# INCIDENT HISTORY
# ============================================================

@app.get("/api/incidents")
def incidents():

    memory = load_memory()

    return {
        "success": True,
        "count": len(memory),
        "incidents": memory
    }