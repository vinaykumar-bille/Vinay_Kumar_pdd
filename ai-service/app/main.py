"""
MediBook AI - Python FastAPI Intelligence Service
Exposes REST APIs for Doctor Recommendations, Clinical NLP Specialty Triage, and Demand Forecasting.
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

from .triage import analyze_symptoms
from .recommender import recommend_doctors
from .forecasting import forecast_appointment_demand

app = FastAPI(
    title="MediBook AI Intelligence Service",
    description="Explainable clinical decision support, symptom-to-specialty triage, and operational forecasting.",
    version="1.0.0"
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

@app.get("/api/ai/health")
def health_check():
    return {
        "status": "HEALTHY",
        "service": "MediBook AI FastAPI Intelligence Service",
        "timestamp": datetime.now().isoformat(),
        "modules": ["ClinicalTriageNLP", "MultiAttributeRecommender", "AppointmentDemandForecaster"]
    }

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
