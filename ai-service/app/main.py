"""
MediBook AI - Python FastAPI Intelligence Service
Exposes REST APIs for Doctor Recommendations, Clinical NLP Specialty Triage, Demand Forecasting,
and Ollama Local LLM Healthcare Conversational Assistance.
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

from .triage import analyze_symptoms
from .recommender import recommend_doctors
from .forecasting import forecast_appointment_demand
from .ollama_service import ollama_service, OllamaService

app = FastAPI(
    title="MediBook AI Intelligence Service",
    description="Explainable clinical decision support, symptom-to-specialty triage, operational forecasting, and Ollama local LLM healthcare assistant.",
    version="1.1.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Schemas
class RecommendRequest(BaseModel):
    specialization: Optional[str] = None
    symptoms: Optional[str] = None
    budget: Optional[float] = None
    language: Optional[str] = None
    consultationType: Optional[str] = None
    preferredDate: Optional[str] = None

class TriageRequest(BaseModel):
    symptoms: str

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000, description="Patient message or question")
    history: Optional[List[ChatMessage]] = Field(default=[], description="Previous conversation turn history")
    model: Optional[str] = Field(default=None, description="Optional Ollama model override")
    temperature: Optional[float] = Field(default=0.3, ge=0.0, le=1.0)

@app.get("/api/ai/health")
def health_check():
    return {
        "status": "HEALTHY",
        "service": "MediBook AI FastAPI Intelligence Service",
        "timestamp": datetime.now().isoformat(),
        "modules": [
            "ClinicalTriageNLP",
            "MultiAttributeRecommender",
            "AppointmentDemandForecaster",
            "OllamaLocalLLM"
        ]
    }

@app.get("/api/ai/ollama/status")
def api_ollama_status():
    """
    Checks Ollama connectivity, configured model presence, latency, and available local models.
    """
    return ollama_service.check_health()

@app.post("/api/ai/chat")
def api_chat_assistant(req: ChatRequest):
    """
    Conversational healthcare assistant:
    1. Validates input format and length.
    2. Runs deterministic emergency red-flag pre-check.
    3. Calls local Ollama LLM (/api/chat).
    4. Falls back gracefully to clinical decision rules if Ollama is offline.
    """
    if not req.message or not req.message.strip():
        raise HTTPException(status_code=400, detail="Message query is required and cannot be empty.")

    try:
        # Convert Pydantic history objects to dicts
        history_dicts = [{"role": h.role, "content": h.content} for h in (req.history or [])]
        result = ollama_service.chat(
            message=req.message,
            history=history_dicts,
            model_override=req.model,
            temperature=req.temperature or 0.3
        )
        return result
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Healthcare assistant error: {str(e)}")

@app.post("/api/ai/recommend-doctors")
def api_recommend_doctors(req: RecommendRequest):
    try:
        # If no specialization provided but symptoms are present, run triage first
        spec = req.specialization
        if not spec and req.symptoms:
            triage_res = analyze_symptoms(req.symptoms)
            spec = triage_res.get("recommendedDepartment")

        result = recommend_doctors(
            specialization=spec,
            symptoms=req.symptoms,
            budget=req.budget,
            language=req.language,
            consultation_type=req.consultationType
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/specialty-guidance")
def api_specialty_guidance(req: TriageRequest):
    if not req.symptoms or not req.symptoms.strip():
        raise HTTPException(status_code=400, detail="Symptoms description is required.")
    try:
        return analyze_symptoms(req.symptoms)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/ai/appointment-forecast")
def api_appointment_forecast():
    try:
        return forecast_appointment_demand()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
