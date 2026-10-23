"""
Doctor Recommendation Engine using multi-attribute scoring and explainable matching.
"""
from typing import List, Dict, Any, Optional

DEFAULT_DOCTORS_CATALOG = [
    {
        "id": "doc_1",
        "name": "Dr. Amit Verma",
        "specialization": "Cardiology",
        "department": "Cardiology",
        "experienceYears": 16,
        "consultationFee": 800,
        "rating": 4.9,
        "languages": ["English", "Hindi", "Tamil"],
        "consultationModes": ["IN_PERSON", "VIDEO"],
        "clinicName": "MediBook AI Central Hospital"
    },
    {
        "id": "doc_2",
        "name": "Dr. Priya Deshmukh",
        "specialization": "Cardiology",
        "department": "Cardiology",
        "experienceYears": 12,
        "consultationFee": 750,
        "rating": 4.8,
        "languages": ["English", "Hindi", "Marathi"],
        "consultationModes": ["IN_PERSON", "VIDEO"],
        "clinicName": "MediBook AI Central Hospital"
    },
    {
        "id": "doc_3",
        "name": "Dr. Rajesh K. Sharma",
        "specialization": "Orthopedics",
        "department": "Orthopedics",
        "experienceYears": 18,
        "consultationFee": 700,
        "rating": 4.7,
        "languages": ["English", "Hindi"],
        "consultationModes": ["IN_PERSON", "VIDEO"],
        "clinicName": "MediBook AI Central Hospital"
    },
    {
        "id": "doc_4",
        "name": "Dr. Sandeep Gupta",
        "specialization": "ENT",
        "department": "ENT",
        "experienceYears": 15,
        "consultationFee": 500,
        "rating": 4.7,
        "languages": ["English", "Hindi", "Punjabi"],
        "consultationModes": ["IN_PERSON", "VIDEO"],
        "clinicName": "MediBook AI Central Hospital"
    },
    {
        "id": "doc_5",
        "name": "Dr. Vikram Malhotra",
        "specialization": "Neurology",
        "department": "Neurology",
        "experienceYears": 22,
        "consultationFee": 1000,
        "rating": 4.9,
        "languages": ["English", "Hindi"],
        "consultationModes": ["IN_PERSON", "VIDEO"],
        "clinicName": "MediBook AI Central Hospital"
    },
    {
        "id": "doc_6",
        "name": "Dr. Siddharth Roy",
        "specialization": "Dermatology",
        "department": "Dermatology",
        "experienceYears": 14,
        "consultationFee": 600,
        "rating": 4.8,
        "languages": ["English", "Bengali", "Hindi"],
        "consultationModes": ["IN_PERSON", "VIDEO"],
        "clinicName": "MediBook AI West Care Specialty Center"
    },
    {
        "id": "doc_7",
        "name": "Dr. Rohan Mehta",
        "specialization": "Pediatrics",
        "department": "Pediatrics",
        "experienceYears": 17,
        "consultationFee": 600,
        "rating": 4.9,
        "languages": ["English", "Gujarati", "Hindi"],
        "consultationModes": ["IN_PERSON", "VIDEO"],
        "clinicName": "MediBook AI Central Hospital"
    },
    {
        "id": "doc_8",
        "name": "Dr. Sanjay Dutt",
        "specialization": "General Medicine",
        "department": "General Medicine",
        "experienceYears": 25,
        "consultationFee": 500,
        "rating": 4.9,
        "languages": ["English", "Hindi", "Tamil"],
        "consultationModes": ["IN_PERSON", "VIDEO"],
        "clinicName": "MediBook AI Central Hospital"
    }
]

def recommend_doctors(
    specialization: Optional[str] = None,
    symptoms: Optional[str] = None,
    budget: Optional[float] = None,
    language: Optional[str] = None,
    consultation_type: Optional[str] = None,
    doctors_pool: Optional[List[Dict[str, Any]]] = None
) -> Dict[str, Any]:
    pool = doctors_pool or DEFAULT_DOCTORS_CATALOG
    target_spec = (specialization or "").strip().lower()

    scored = []
    for doc in pool:
        score = 0.0
        reasons = []

        doc_spec = doc.get("specialization", "").lower()
        doc_dept = doc.get("department", "").lower()

        # Specialization Match
        if target_spec:
            if target_spec in doc_spec or target_spec in doc_dept:
                score += 45.0
                reasons.append(f"Direct match for requested {doc['specialization']} specialization")
            else:
                score += 5.0
        else:
            score += 20.0

        # Budget Check
        fee = doc.get("consultationFee", 500)
        if budget and budget > 0:
            if fee <= budget:
                score += 25.0
                reasons.append(f"Consultation fee (₹{fee}) is within specified budget of ₹{int(budget)}")
            elif fee <= budget * 1.25:
                score += 10.0
        else:
            score += 15.0

        # Language match
        langs = [l.lower() for l in doc.get("languages", [])]
        if language:
            if language.lower() in langs:
                score += 15.0
                reasons.append(f"Physician communicates in {language}")
        else:
            score += 10.0

        # Consultation mode
        modes = doc.get("consultationModes", ["IN_PERSON", "VIDEO"])
        if consultation_type:
            if consultation_type.upper() in modes:
                score += 10.0
                reasons.append(f"Supports your preferred consultation mode ({consultation_type.upper()})")

        # Rating & Experience boost
        rating = doc.get("rating", 4.5)
        experience = doc.get("experienceYears", 5)
        score += min(10.0, experience * 0.5)
        score += rating * 1.5

        final_score = min(99, int(score))

        scored.append({
            "doctor": doc,
            "matchScore": final_score,
            "recommendationReasons": reasons if reasons else ["Top rated licensed medical professional"],
            "explanation": f"Recommended because this physician matches {', '.join(reasons)}." if reasons else "High clinical standing."
        })

    scored.sort(key=lambda x: x["matchScore"], reverse=True)

    return {
        "recommendations": scored[:5],
        "inferredSpecialty": specialization or "General Medicine",
        "source": "AI_RECOMMENDER_SERVICE_FASTAPI",
        "disclaimer": "Doctor recommendations are based on patient preferences and verified credentials. AI does not guarantee medical outcomes."
    }
