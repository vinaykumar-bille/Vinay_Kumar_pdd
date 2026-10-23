"""
Clinical NLP Symptom-to-Department Triage Module.
Provides rule-based NLP extraction and clinical specialty mapping.
Displays emergency caveats and non-diagnostic disclaimers.
"""

EMERGENCY_KEYWORDS = [
    "crushing chest pain", "severe shortness of breath", "sudden paralysis",
    "slurred speech", "heavy bleeding", "loss of consciousness", "seizure lasting",
    "anaphylaxis", "severe difficulty breathing", "heart attack"
]

SPECIALTY_MAPPINGS = {
    "Cardiology": {
        "keywords": ["chest", "heart", "cardiac", "palpitations", "pulse", "blood pressure", "hypertension", "angina"],
        "summary": "Symptoms indicate cardiovascular evaluation. A cardiologist can evaluate blood pressure, perform an ECG, and review cardiac function.",
        "suggested_tests": ["12-Lead ECG", "Echocardiogram", "Lipid Profile"]
    },
    "Orthopedics": {
        "keywords": ["bone", "joint", "fracture", "knee", "back pain", "spine", "ligament", "sprain", "shoulder", "hip", "arthritis"],
        "summary": "Symptoms point to musculoskeletal strain or articular concerns. An orthopedic surgeon can evaluate bone alignment and mobility limits.",
        "suggested_tests": ["Digital X-Ray", "MRI Scan", "Bone Mineral Density (DEXA)"]
    },
    "ENT": {
        "keywords": ["ear", "nose", "throat", "hearing", "tinnitus", "sinus", "tonsil", "snore", "nasal", "vocal"],
        "summary": "Symptoms correspond to otolaryngology. An ENT specialist evaluates auditory canals, nasal airways, and throat structures.",
        "suggested_tests": ["Pure Tone Audiometry", "Nasal Endoscopy", "CT Sinus"]
    },
    "Neurology": {
        "keywords": ["headache", "migraine", "nerve", "dizzy", "dizziness", "vertigo", "numbness", "tremor", "memory", "epilepsy"],
        "summary": "Symptoms indicate central or peripheral nervous system evaluation. A neurologist investigates cranial nerve function and vascular head pain.",
        "suggested_tests": ["Brain MRI", "Electroencephalogram (EEG)", "Nerve Conduction Study"]
    },
    "Dermatology": {
        "keywords": ["skin", "rash", "itch", "itching", "acne", "hair", "scalp", "eczema", "psoriasis", "mole", "allergy"],
        "summary": "Cutaneous manifestations like flareups, lesions, or scalp irritations fall under Dermatology.",
        "suggested_tests": ["Skin Patch Allergy Test", "Dermoscopy", "Biopsy"]
    },
    "Pediatrics": {
        "keywords": ["child", "baby", "infant", "toddler", "kid", "vaccine", "vaccination", "growth", "colic"],
        "summary": "Health indicators concerning infants and developing children are best guided by specialized pediatric physicians.",
        "suggested_tests": ["Pediatric Growth Charting", "Routine Vaccination Review"]
    },
    "General Medicine": {
        "keywords": ["fever", "cough", "cold", "flu", "weakness", "fatigue", "diabetes", "stomach", "vomiting", "infection"],
        "summary": "General physical symptoms, seasonal viral episodes, and primary metabolic management begin with General Internal Medicine.",
        "suggested_tests": ["Complete Blood Count (CBC)", "Fasting Blood Sugar", "Urine Routine"]
    }
}

def analyze_symptoms(symptoms_text: str):
    text = (symptoms_text or "").lower()

    # 1. Check for Emergency
    for em in EMERGENCY_KEYWORDS:
        if em in text:
            return {
                "symptomsEntered": symptoms_text,
                "recommendedDepartment": "Emergency Medicine / Immediate Hospital Care",
                "urgency": "CRITICAL_EMERGENCY",
                "triageSummary": "🚨 RED FLAG ALERT: The described symptoms may indicate an urgent medical emergency. Please proceed immediately to the nearest Emergency Room or dial 108 / 112 without delay.",
                "confidence": 0.99,
                "suggestedKeywords": ["Emergency Room", "Ambulance Call 108"],
                "disclaimer": "MediBook AI triage is strictly non-diagnostic. In emergencies, seek immediate in-person hospital care."
            }

    # 2. Match against specialties
    best_dept = "General Medicine"
    max_matches = 0
    selected_meta = SPECIALTY_MAPPINGS["General Medicine"]

    for dept, data in SPECIALTY_MAPPINGS.items():
        matches = sum(1 for kw in data["keywords"] if kw in text)
        if matches > max_matches:
            max_matches = matches
            best_dept = dept
            selected_meta = data

    confidence = min(0.95, 0.65 + (max_matches * 0.10)) if max_matches > 0 else 0.60

    return {
        "symptomsEntered": symptoms_text,
        "recommendedDepartment": best_dept,
        "urgency": "NORMAL",
        "triageSummary": selected_meta["summary"],
        "suggestedKeywords": selected_meta["keywords"][:4],
        "suggestedDiagnosticTests": selected_meta["suggested_tests"],
        "confidence": round(confidence, 2),
        "source": "CLINICAL_NLP_TRIAGE_MODEL_V1",
        "disclaimer": "MediBook AI is an appointment scheduling and healthcare coordination tool. AI triage does not constitute medical diagnosis or clinical prescription."
    }
