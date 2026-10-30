"""
MediBook AI - Automated Test Suite for Python AI Intelligence & Ollama Integration Services.
Tests both local clinical triage/recommender/forecasting models and Ollama local LLM integration
using mocked HTTP responses to ensure hermetic, deterministic offline execution.
"""
import sys
import json
import urllib.request
import urllib.error
from unittest.mock import patch, MagicMock

from app.triage import analyze_symptoms
from app.recommender import recommend_doctors
from app.forecasting import forecast_appointment_demand
from app.ollama_service import OllamaService, MEDIBOOK_SYSTEM_PROMPT

def run_all_tests():
    print("=" * 60)
    print("[TEST] [MediBook AI] Python Intelligence & Ollama Test Suite")
    print("=" * 60)
    passed = 0
    failed = 0

    def check(test_name, fn):
        nonlocal passed, failed
        try:
            fn()
            print(f"  [PASS] {test_name}")
            passed += 1
        except Exception as e:
            print(f"  [FAIL] {test_name}")
            print(f"         Error: {str(e)}")
            failed += 1

    # =========================================================================
    # PART 1: REGRESSION TESTS FOR EXISTING CAPABILITIES
    # =========================================================================
    print("\n--- Part 1: Existing Clinical & Forecasting Regression Tests ---")

    def test_triage():
        t = analyze_symptoms("Patient has sudden palpitations and chest tightness")
        assert t["recommendedDepartment"] == "Cardiology", f"Expected Cardiology, got {t['recommendedDepartment']}"
        assert "disclaimer" in t

    def test_emergency_redflag():
        em = analyze_symptoms("Patient has severe crushing chest pain and shortness of breath")
        assert em["urgency"] == "CRITICAL_EMERGENCY"
        assert "108" in em["triageSummary"] or "112" in em["triageSummary"]

    def test_recommender():
        recs = recommend_doctors(specialization="Cardiology", budget=800, language="English")
        assert len(recs["recommendations"]) > 0
        top = recs["recommendations"][0]
        assert top["matchScore"] >= 50
        assert top["doctor"]["specialization"] == "Cardiology"

    def test_forecasting():
        fc = forecast_appointment_demand()
        assert fc["totalProjectedBookings"] > 100
        assert len(fc["dailyProjections"]) == 7

    check("Clinical NLP Triage routes cardiac complaints to Cardiology", test_triage)
    check("Emergency alert triggered for critical red-flag symptoms", test_emergency_redflag)
    check("Doctor Recommender scores and explains best matching physicians", test_recommender)
    check("Demand Forecaster computes 7-day operational appointment projections", test_forecasting)

    # =========================================================================
    # PART 2: OLLAMA LOCAL LLM INTEGRATION TESTS (WITH HERMETIC MOCKS)
    # =========================================================================
    print("\n--- Part 2: Ollama Local LLM Integration Tests ---")

    service = OllamaService(base_url="http://localhost:11434", model="llama3.2:3b", timeout=2.0)

    # Test 5: Ollama connectivity check when service is offline
    def test_ollama_offline_status():
        with patch("urllib.request.urlopen", side_effect=urllib.error.URLError("Connection refused")):
            status = service.check_health()
            assert status["status"] == "UNAVAILABLE"
            assert status["isModelAvailable"] is False
            assert "not running" in status["message"] or "failed" in status["message"]
    check("Ollama connectivity reports UNAVAILABLE gracefully when daemon is offline", test_ollama_offline_status)

    # Test 6: Ollama connectivity check when service is online with model
    def test_ollama_online_status():
        mock_resp = MagicMock()
        mock_resp.status = 200
        mock_resp.read.return_value = json.dumps({
            "models": [
                {"name": "llama3.2:3b", "size": 2019393189},
                {"name": "nomic-embed-text:latest", "size": 274302450}
            ]
        }).encode("utf-8")
        mock_resp.__enter__.return_value = mock_resp

        with patch("urllib.request.urlopen", return_value=mock_resp):
            status = service.check_health()
            assert status["status"] == "CONNECTED"
            assert status["isModelAvailable"] is True
            assert "llama3.2:3b" in status["availableModels"]
    check("Ollama connectivity verifies model availability from /api/tags", test_ollama_online_status)

    # Test 7: Successful Ollama /api/chat response
    def test_ollama_chat_success():
        mock_resp = MagicMock()
        mock_resp.status = 200
        mock_resp.read.return_value = json.dumps({
            "model": "llama3.2:3b",
            "message": {
                "role": "assistant",
                "content": "To book an appointment on MediBook AI, navigate to the Find a Doctor tab and choose a specialist."
            },
            "done": True
        }).encode("utf-8")
        mock_resp.__enter__.return_value = mock_resp

        with patch("urllib.request.urlopen", return_value=mock_resp):
            res = service.chat("How do I book an appointment?")
            assert res["source"] == "OLLAMA_LOCAL_LLM"
            assert "Find a Doctor" in res["reply"]
            assert res["model"] == "llama3.2:3b"
            assert "disclaimer" in res
    check("Ollama /api/chat successfully generates healthcare assistant guidance", test_ollama_chat_success)

    # Test 8: Empty and oversized input rejection
    def test_input_validation():
        # Empty
        try:
            service.chat("")
            assert False, "Empty message should have raised ValueError"
        except ValueError:
            pass

        # Whitespace
        try:
            service.chat("   \n\t   ")
            assert False, "Whitespace message should have raised ValueError"
        except ValueError:
            pass

        # Oversized (>2000 chars)
        try:
            service.chat("a" * 2500)
            assert False, "Oversized message (>2000) should have raised ValueError"
        except ValueError:
            pass
    check("Input validation rejects empty, whitespace, and oversized messages", test_input_validation)

    # Test 9: Mandatory emergency red-flag override (takes priority over LLM)
    def test_emergency_redflag_priority():
        # Even if mock Ollama returns a generic reply, red-flag check MUST intercept and return emergency alert!
        mock_resp = MagicMock()
        mock_resp.status = 200
        mock_resp.read.return_value = json.dumps({
            "message": {"role": "assistant", "content": "I am an LLM saying hello"}
        }).encode("utf-8")
        mock_resp.__enter__.return_value = mock_resp

        with patch("urllib.request.urlopen", return_value=mock_resp):
            res = service.chat("I have crushing chest pain and severe shortness of breath")
            assert res["urgency"] == "CRITICAL_EMERGENCY"
            assert res["source"] == "CLINICAL_NLP_SAFETY_GUARD"
            assert "108" in res["reply"] or "112" in res["reply"]
            assert "EMERGENCY" in res["reply"]
    check("Emergency red-flag detection overrides LLM and delivers immediate emergency alert", test_emergency_redflag_priority)

    # Test 10: Ollama service unavailable fallback to clinical rule engine
    def test_service_unavailable_fallback():
        with patch("urllib.request.urlopen", side_effect=urllib.error.URLError("Connection refused")):
            res = service.chat("How do I schedule a consultation?")
            assert res["source"] == "CLINICAL_RULE_FALLBACK"
            assert "How to Book an Appointment" in res["reply"]
            assert res["urgency"] == "NORMAL"
    check("Offline Ollama seamlessly falls back to high-fidelity clinical rule engine", test_service_unavailable_fallback)

    # Test 11: Request timeout handling
    def test_timeout_fallback():
        with patch("urllib.request.urlopen", side_effect=TimeoutError("Request timed out")):
            res = service.chat("Tell me about video teleconsultations")
            assert res["source"] == "CLINICAL_RULE_FALLBACK"
            assert "Telehealth" in res["reply"] or "Video" in res["reply"]
    check("Request timeout falls back gracefully without unhandled exceptions", test_timeout_fallback)

    # Test 12: Malformed or empty model response handling
    def test_malformed_response():
        mock_resp = MagicMock()
        mock_resp.status = 200
        mock_resp.read.return_value = json.dumps({"message": {"content": ""}}).encode("utf-8")
        mock_resp.__enter__.return_value = mock_resp

        with patch("urllib.request.urlopen", return_value=mock_resp):
            res = service.chat("What are symptoms of skin rash?")
            assert res["source"] == "CLINICAL_RULE_FALLBACK"
            assert "Dermatology" in res.get("recommendedDepartment", "") or "Dermatology" in res["reply"]
    check("Malformed or empty LLM response safely recovers to clinical fallback", test_malformed_response)

    # Test 13: System prompt verification for safety instructions
    def test_system_prompt_guardrails():
        assert "NON-DIAGNOSTIC BOUNDARY" in MEDIBOOK_SYSTEM_PROMPT
        assert "EMERGENCY" in MEDIBOOK_SYSTEM_PROMPT
        assert "MediBook AI" in MEDIBOOK_SYSTEM_PROMPT
    check("MediBook AI system prompt contains required clinical and non-diagnostic guardrails", test_system_prompt_guardrails)

    # =========================================================================
    # SUMMARY
    # =========================================================================
    print("\n" + "=" * 60)
    print(f"[RESULTS] Python AI Test Results: {passed} Passed, {failed} Failed")
    print("=" * 60)

    if failed > 0:
        sys.exit(1)
    else:
        print("\nAll MediBook AI Python service & Ollama integration tests passed successfully!\n")

if __name__ == "__main__":
    run_all_tests()
