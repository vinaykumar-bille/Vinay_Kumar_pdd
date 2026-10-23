import sys

def test_ai_modules():
    print("[TEST] Verifying MediBook AI Python Services...")
    from app.triage import analyze_symptoms
    from app.recommender import recommend_doctors
    from app.forecasting import forecast_appointment_demand

    # Test 1: Triage
    triage = analyze_symptoms("Patient has sudden palpitations and chest tightness")
    assert triage["recommendedDepartment"] == "Cardiology", f"Expected Cardiology, got {triage['recommendedDepartment']}"
    assert "disclaimer" in triage
    print("  [PASS] Clinical NLP Triage correctly identified Cardiology")

    # Test 2: Emergency Detection
    em = analyze_symptoms("Patient has severe crushing chest pain and shortness of breath")
    assert em["urgency"] == "CRITICAL_EMERGENCY"
    print("  [PASS] Emergency alert triggered for critical red-flag symptoms")

    # Test 3: Recommender
    recs = recommend_doctors(specialization="Cardiology", budget=800, language="English")
    assert len(recs["recommendations"]) > 0
    top = recs["recommendations"][0]
    assert top["matchScore"] >= 50
    print(f"  [PASS] Doctor Recommender recommended {top['doctor']['name']} (Score: {top['matchScore']})")

    # Test 4: Forecasting
    fc = forecast_appointment_demand()
    assert fc["totalProjectedBookings"] > 100
    print(f"  [PASS] Demand Forecaster projected {fc['totalProjectedBookings']} appointments over 7 days")

    print("\nAll Python AI intelligence service tests passed successfully!")

if __name__ == "__main__":
    test_ai_modules()
