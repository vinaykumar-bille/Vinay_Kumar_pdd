"""
MediBook AI - Ollama Local LLM Integration Service
Manages local LLM inference, clinical safety guardrails, emergency red-flag pre-checks,
and fallback coordination for the MediBook AI healthcare management platform.
"""
import os
import json
import time
import logging
import urllib.request
import urllib.error
from typing import List, Dict, Any, Optional

from .triage import analyze_symptoms, EMERGENCY_KEYWORDS

# Configure privacy-preserving logging (no PHI / user messages logged)
logger = logging.getLogger("medibook.ai.ollama")
if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter("[%(asctime)s] [%(levelname)s] [MediBook-Ollama]: %(message)s")
    handler.setFormatter(formatter)
    logger.addHandler(handler)
logger.setLevel(logging.INFO)

# Environment configuration
OLLAMA_BASE_URL = os.environ.get("OLLAMA_URL", os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")).rstrip("/")
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "llama3.2:3b")
DEFAULT_TIMEOUT_SECONDS = float(os.environ.get("OLLAMA_TIMEOUT_SECONDS", "30.0"))
MAX_INPUT_LENGTH = int(os.environ.get("MAX_INPUT_LENGTH", "2000"))

# System Prompt embodying clinical safety guardrails and healthcare coordination persona
MEDIBOOK_SYSTEM_PROMPT = """You are MediBook AI, an empathetic, highly knowledgeable, and professional healthcare coordination assistant for the MediBook AI / HealthNet platform.

CORE RESPONSIBILITIES:
1. Explain general healthcare concepts and preventive health education in simple, reassuring terms.
2. Guide patients on how to book, reschedule, or cancel consultations on the MediBook AI platform.
3. Help users understand what medical documentation or history to prepare for an appointment.
4. Explain platform features including Find a Doctor, Telehealth Video Rooms, Digital Prescriptions, and Receptionist Queueing.
5. Provide specialty guidance by directing users toward appropriate clinical departments (e.g. Cardiology, Orthopedics, ENT, Neurology, Dermatology, Pediatrics, General Medicine).

STRICT SAFETY AND CLINICAL MANDATES:
1. NON-DIAGNOSTIC BOUNDARY: You are an informational assistant. You DO NOT issue formal medical diagnoses, prescribe medications or specific dosages, fabricate lab results, or alter patient medical records.
2. LICENSED PHYSICIAN REFERRAL: Always advise patients to confirm clinical questions with a certified doctor during a consultation.
3. EMERGENCY ADVICE: If the user describes potentially life-threatening symptoms (e.g., severe crushing chest pain, difficulty breathing, slurred speech, sudden paralysis, severe bleeding, or loss of consciousness), urgently instruct them to contact emergency medical services (108 / 112 in India, 911 in the US) or visit the nearest hospital Emergency Room immediately.
4. TONE: Warm, professional, concise, and structured. Use bullet points for step-by-step instructions.
"""

class OllamaService:
    def __init__(
        self,
        base_url: Optional[str] = None,
        model: Optional[str] = None,
        timeout: Optional[float] = None
    ):
        self.base_url = (base_url or OLLAMA_BASE_URL).rstrip("/")
        self.model = model or OLLAMA_MODEL
        self.timeout = timeout or DEFAULT_TIMEOUT_SECONDS

    def check_health(self) -> Dict[str, Any]:
        """
        Queries Ollama service tags to determine connectivity, latency, and model presence.
        Does not throw unhandled exceptions.
        """
        start_time = time.time()
        url = f"{self.base_url}/api/tags"
        try:
            req = urllib.request.Request(url, headers={"Accept": "application/json"})
            with urllib.request.urlopen(req, timeout=3.0) as resp:
                latency_ms = round((time.time() - start_time) * 1000, 2)
                if resp.status == 200:
                    data = json.loads(resp.read().decode("utf-8"))
                    models = [m.get("name", "") for m in data.get("models", [])]
                    # Check exact match or prefix match (e.g. llama3.2:3b vs llama3.2:3b-instruct)
                    model_found = any(self.model in m or m.startswith(self.model) for m in models)
                    return {
                        "status": "CONNECTED",
                        "baseUrl": self.base_url,
                        "configuredModel": self.model,
                        "isModelAvailable": model_found,
                        "availableModels": models,
                        "latencyMs": latency_ms,
                        "message": f"Ollama is reachable. Model '{self.model}' is {'available' if model_found else 'NOT downloaded (run `ollama pull ' + self.model + '`)'}."
                    }
                else:
                    return {
                        "status": "UNAVAILABLE",
                        "baseUrl": self.base_url,
                        "configuredModel": self.model,
                        "isModelAvailable": False,
                        "availableModels": [],
                        "latencyMs": latency_ms,
                        "message": f"Ollama returned HTTP {resp.status}."
                    }
        except (urllib.error.URLError, TimeoutError, OSError) as e:
            latency_ms = round((time.time() - start_time) * 1000, 2)
            logger.warning("Ollama connectivity check failed at %s: %s", self.base_url, str(e))
            return {
                "status": "UNAVAILABLE",
                "baseUrl": self.base_url,
                "configuredModel": self.model,
                "isModelAvailable": False,
                "availableModels": [],
                "latencyMs": latency_ms,
                "message": f"Ollama is not running at {self.base_url}. Using high-fidelity clinical fallback."
            }
        except Exception as e:
            latency_ms = round((time.time() - start_time) * 1000, 2)
            logger.error("Unexpected error checking Ollama: %s", str(e))
            return {
                "status": "ERROR",
                "baseUrl": self.base_url,
                "configuredModel": self.model,
                "isModelAvailable": False,
                "availableModels": [],
                "latencyMs": latency_ms,
                "message": f"Check failed: {str(e)}"
            }

    def chat(
        self,
        message: str,
        history: Optional[List[Dict[str, str]]] = None,
        model_override: Optional[str] = None,
        temperature: float = 0.3
    ) -> Dict[str, Any]:
        """
        Coordinates healthcare conversation:
        1. Validates input length and non-emptiness.
        2. Executes deterministic clinical emergency red-flag pre-check.
           If critical emergency detected, returns immediate life-saving alert without waiting for LLM.
        3. Attempts local Ollama inference via /api/chat.
        4. If Ollama is offline or times out, falls back gracefully to MediBook AI clinical rule engine.
        """
        if not message or not message.strip():
            raise ValueError("Chat message is required and cannot be empty.")

        cleaned_msg = message.strip()
        if len(cleaned_msg) > MAX_INPUT_LENGTH:
            raise ValueError(f"Message exceeds maximum allowable length of {MAX_INPUT_LENGTH} characters.")

        # =====================================================================
        # 1. MANDATORY CLINICAL RED-FLAG SAFETY PRE-CHECK
        # =====================================================================
        # Run validated emergency triage logic. This rule strictly overrides LLM outputs.
        triage_assessment = analyze_symptoms(cleaned_msg)
        if triage_assessment.get("urgency") == "CRITICAL_EMERGENCY":
            logger.info("Safety rule triggered: CRITICAL_EMERGENCY detected for query (length %d)", len(cleaned_msg))
            return {
                "reply": (
                    "🚨 **CRITICAL MEDICAL EMERGENCY NOTICE**\n\n"
                    "Your reported symptoms may indicate an **acute life-threatening emergency**.\n\n"
                    "**DO NOT wait for an online scheduled appointment.**\n\n"
                    "• Please call national emergency services immediately (**108 / 112** in India, **911** in the US).\n"
                    "• Have someone escort you to the nearest hospital **Emergency Room** right away.\n\n"
                    "*MediBook AI provides scheduled clinical appointment coordination and cannot replace acute emergency medical intervention.*"
                ),
                "recommendedDepartment": "Emergency Medicine / Immediate Hospital Care",
                "urgency": "CRITICAL_EMERGENCY",
                "action": "EMERGENCY_ALERT",
                "source": "CLINICAL_NLP_SAFETY_GUARD",
                "model": "rule_based_triage_v1",
                "disclaimer": "Emergency triage rule triggered. Seek emergency hospital care immediately."
            }

        # =====================================================================
        # 2. ATTEMPT OLLAMA LOCAL LLM CHAT (/api/chat)
        # =====================================================================
        active_model = model_override or self.model
        ollama_reply = self._call_ollama_api(cleaned_msg, history or [], active_model, temperature)
        if ollama_reply:
            # Append clinical department suggestion if relevant
            dept = triage_assessment.get("recommendedDepartment")
            return {
                "reply": ollama_reply.get("content", ""),
                "recommendedDepartment": dept if dept != "General Medicine" else None,
                "urgency": "NORMAL",
                "source": "OLLAMA_LOCAL_LLM",
                "model": active_model,
                "latencyMs": ollama_reply.get("latencyMs"),
                "disclaimer": "MediBook AI provides general healthcare and appointment guidance. It does not provide medical diagnosis. Please consult a licensed physician."
            }

        # =====================================================================
        # 3. HIGH-FIDELITY CLINICAL FALLBACK ENGINE
        # =====================================================================
        logger.info("Engaging clinical fallback engine for message length %d", len(cleaned_msg))
        return self._generate_clinical_fallback(cleaned_msg, triage_assessment)

    def _call_ollama_api(
        self,
        message: str,
        history: List[Dict[str, str]],
        model_name: str,
        temperature: float
    ) -> Optional[Dict[str, Any]]:
        """
        Dispatches HTTP POST to Ollama /api/chat. Returns None on connection failure or timeout.
        """
        start_time = time.time()
        url = f"{self.base_url}/api/chat"

        # Construct chat message history with system prompt
        messages = [{"role": "system", "content": MEDIBOOK_SYSTEM_PROMPT}]

        # Include up to last 10 messages for conversation context
        for h in history[-10:]:
            r = h.get("role")
            c = h.get("content")
            if r in ("user", "assistant") and c:
                messages.append({"role": r, "content": str(c)[:MAX_INPUT_LENGTH]})

        messages.append({"role": "user", "content": message})

        payload = {
            "model": model_name,
            "messages": messages,
            "stream": False,
            "options": {
                "temperature": temperature,
                "top_p": 0.9
            }
        }

        try:
            req_data = json.dumps(payload).encode("utf-8")
            req = urllib.request.Request(
                url,
                data=req_data,
                headers={"Content-Type": "application/json", "Accept": "application/json"},
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                latency_ms = round((time.time() - start_time) * 1000, 2)
                if resp.status == 200:
                    res_body = json.loads(resp.read().decode("utf-8"))
                    msg_obj = res_body.get("message", {})
                    content = msg_obj.get("content", "").strip()
                    if content:
                        logger.info("Ollama responded in %.2fms using model %s", latency_ms, model_name)
                        return {"content": content, "latencyMs": latency_ms}
                    else:
                        logger.warning("Ollama returned empty message content in %.2fms", latency_ms)
                        return None
        except (urllib.error.URLError, TimeoutError, OSError) as e:
            logger.warning("Ollama API call to %s failed: %s", url, str(e))
            return None
        except Exception as e:
            logger.error("Unexpected error calling Ollama API: %s", str(e))
            return None

    def _generate_clinical_fallback(
        self,
        query: str,
        triage: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Rule-based healthcare assistant responses when local Ollama is offline or warming up.
        """
        lower = query.lower()
        dept = triage.get("recommendedDepartment", "General Medicine")
        triage_summary = triage.get("triageSummary", "")

        if any(k in lower for k in ["how to book", "book appointment", "schedule appointment", "schedule a", "schedule consultation", "schedule", "book doctor"]):
            content = (
                "**How to Book an Appointment on MediBook AI:**\n\n"
                "1. **Explore Specialists:** Navigate to the **Find a Doctor** section to filter specialists by department, consultation fee, or rating.\n"
                "2. **Select Date & Slot:** View real-time availability slots (e.g. 09:00 AM, 11:30 AM).\n"
                "3. **Choose Consultation Mode:** Choose between an **In-Person Hospital Visit** or a secure **HD Telehealth Video Room** consultation.\n"
                "4. **Confirm Reservation:** Verify your booking to receive an immediate appointment reference code (e.g. `MBA-xxxx`) and digital notification."
            )
        elif any(k in lower for k in ["cancel", "reschedule", "change time", "change date"]):
            content = (
                "**Rescheduling or Cancelling an Appointment:**\n\n"
                "• Head to your **Patient Dashboard** under the **Upcoming Appointments** tab.\n"
                "• Click **Reschedule** to pick a new open time slot for that physician, or click **Cancel**.\n"
                "• All slot changes immediately update doctor schedules and release previous slots for other patients."
            )
        elif any(k in lower for k in ["video", "telehealth", "teleconsult", "online consult"]):
            content = (
                "**Telehealth Video Consultations:**\n\n"
                "• MediBook AI features integrated WebRTC video rooms for virtual doctor visits.\n"
                "• When your scheduled appointment time arrives, a **Join Video Room** button lights up on your dashboard.\n"
                "• Video calls are end-to-end encrypted, and doctors can upload digital prescriptions directly during the call."
            )
        elif any(k in lower for k in ["prescription", "medicines", "rx"]):
            content = (
                "**Digital Prescriptions on MediBook AI:**\n\n"
                "• After completing a consultation, your physician uploads your clinical diagnosis and medication regimen.\n"
                "• You can review active prescriptions, dosage schedules, duration, and doctor's advice in the **Prescriptions** tab anytime."
            )
        elif any(k in lower for k in ["record", "lab", "test", "upload"]):
            content = (
                "**Medical Records Management:**\n\n"
                "• You can upload prior lab reports, blood panels, or imaging files in the **Medical Records** section.\n"
                "• Attaching relevant test results helps your consulting specialist review your health history accurately."
            )
        else:
            content = (
                f"Based on your description, your query aligns with our **{dept}** department.\n\n"
                f"**Clinical Specialty Guidance:**\n{triage_summary}\n\n"
                f"Would you like to review available specialists in **{dept}** to schedule a consultation?"
            )

        return {
            "reply": content,
            "recommendedDepartment": dept if dept != "General Medicine" else None,
            "urgency": triage.get("urgency", "NORMAL"),
            "source": "CLINICAL_RULE_FALLBACK",
            "model": "medibook_clinical_rules_v1",
            "latencyMs": 5.0,
            "disclaimer": "MediBook AI provides appointment coordination and healthcare information. It does not provide medical diagnoses. For clinical evaluation, consult a licensed physician."
        }

# Global singleton instance
ollama_service = OllamaService()
