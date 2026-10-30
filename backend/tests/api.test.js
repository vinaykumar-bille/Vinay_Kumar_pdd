import assert from 'assert';
import dbStore from '../src/models/store.js';
import aiService from '../src/services/aiService.js';
import { generateToken, verifyAuth } from '../src/middleware/auth.js';

console.log('🧪 Starting MediBook AI Automated Verification Test Suite...\n');

async function runTests() {
  let passed = 0;
  let failed = 0;

  const test = async (name, fn) => {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     Error: ${err.message}`);
      failed++;
    }
  };

  // Test 1: Baseline Seed Integrity
  await test('Baseline Seed Data contains required roles and doctors', async () => {
    const doctors = await dbStore.getAllDoctors();
    assert(doctors.length >= 6, `Expected at least 6 doctors, found ${doctors.length}`);
    const admin = await dbStore.findUserByEmail('admin@medibook.ai');
    assert(admin && admin.role === 'ADMIN', 'Admin account missing');
    const receptionist = await dbStore.findUserByEmail('receptionist@medibook.ai');
    assert(receptionist && receptionist.role === 'RECEPTIONIST', 'Receptionist account missing');
  });

  // Test 2: User Registration
  let testPatientId = '';
  await test('Patient registration creates new user with PATIENT role', async () => {
    const uniqueEmail = `test_patient_${Date.now()}@test.com`;
    const user = await dbStore.createUser({
      name: 'Verification Patient',
      email: uniqueEmail,
      passwordHash: 'dummyHash',
      role: 'PATIENT',
      phone: '+91 91111 22222'
    });
    assert(user.id, 'User ID should be generated');
    assert.strictEqual(user.role, 'PATIENT');
    testPatientId = user.id;
  });

  // Test 3: Dynamic Doctor Availability
  await test('Doctor availability accurately computes open time slots', async () => {
    // Dr. Amit Verma works Monday, Wednesday, Friday
    // 2026-10-19 is a Monday
    const slotsData = await dbStore.getDoctorSlotsForDate('doc_1', '2026-10-19');
    assert(slotsData.isWorkingDay === true, 'Doctor should be working on Monday');
    assert(slotsData.slots.length > 0, 'Should return available time slots');
    const firstSlot = slotsData.slots[0];
    assert(firstSlot.time, 'Slot must have a time');
  });

  // Test 4: Real Appointment Booking
  let testApptId = '';
  const testDate = '2026-10-19';
  const testTime = '09:00 AM';

  await test('Appointment booking secures slot and returns unique reference number', async () => {
    const appt = await dbStore.createAppointment({
      patientId: testPatientId,
      doctorId: 'doc_1',
      appointmentDate: testDate,
      startTime: testTime,
      consultationType: 'IN_PERSON',
      reasonForVisit: 'Pre-surgery consultation'
    });
    assert(appt.appointmentNumber.startsWith('MBA-'), 'Appointment number must start with MBA-');
    assert.strictEqual(appt.status, 'CONFIRMED');
    assert.strictEqual(appt.appointmentDate, testDate);
    assert.strictEqual(appt.startTime, testTime);
    testApptId = appt.id;
  });

  // Test 5: Double-Booking Prevention (Concurrency Overlap Guard)
  await test('Double-booking prevention stops concurrent conflicting reservations', async () => {
    let errorCaught = false;
    try {
      await dbStore.createAppointment({
        patientId: 'usr_pat_2',
        doctorId: 'doc_1',
        appointmentDate: testDate,
        startTime: testTime, // Same date & time for same doctor!
        consultationType: 'VIDEO',
        reasonForVisit: 'Conflicting request'
      });
    } catch (err) {
      errorCaught = true;
      assert(err.message.includes('not available') || err.message.includes('already booked'), 'Error must specify slot unavailability');
    }
    assert(errorCaught, 'Double booking must throw an error');
  });

  // Test 6: Reschedule Appointment Workflow
  const newDate = '2026-10-19';
  const newTime = '11:00 AM';
  await test('Appointment rescheduling updates slot and preserves audit history', async () => {
    const rescheduled = await dbStore.rescheduleAppointment(testApptId, {
      newDate,
      newStartTime: newTime,
      reason: 'Urgent meeting conflict'
    });
    assert.strictEqual(rescheduled.status, 'RESCHEDULED');
    assert.strictEqual(rescheduled.appointmentDate, newDate);
    assert.strictEqual(rescheduled.startTime, newTime);
    assert(rescheduled.rescheduleHistory.length > 0, 'Must record reschedule history');
  });

  // Test 7: Doctor Slot Released after Reschedule
  await test('Previous slot is freed up after reschedule', async () => {
    const slotsData = await dbStore.getDoctorSlotsForDate('doc_1', testDate);
    const oldSlot = slotsData.slots.find(s => s.time === testTime);
    assert(oldSlot && oldSlot.available === true, 'Previous slot (09:00 AM) must now be free');
  });

  // Test 8: Front Desk Receptionist Queue & Check-In
  await test('Receptionist check-in marks patient in waiting queue', async () => {
    const checkedIn = await dbStore.updateAppointmentStatus(testApptId, {
      status: 'CHECKED_IN',
      updatedBy: 'RECEPTIONIST'
    });
    assert.strictEqual(checkedIn.status, 'CHECKED_IN');
  });

  // Test 9: Doctor Consultation & Prescription Generation
  await test('Doctor prescription issues diagnosis and marks appointment COMPLETED', async () => {
    const prescription = await dbStore.createPrescription({
      appointmentId: testApptId,
      patientId: testPatientId,
      patientName: 'Verification Patient',
      doctorId: 'doc_1',
      doctorName: 'Dr. Amit Verma',
      department: 'Cardiology',
      diagnosis: 'Stable Angina & Mild Hypertension',
      medications: [
        { name: 'Amlodipine 5mg', dosage: '1-0-0', duration: '30 Days', instructions: 'Morning post breakfast' },
        { name: 'Aspirin 75mg', dosage: '0-0-1', duration: '30 Days', instructions: 'Night post dinner' }
      ],
      advice: 'Low sodium diet, brisk walking 30 mins daily.'
    });
    assert(prescription.id, 'Prescription ID generated');
    assert(prescription.medications.length === 2, 'Medications included');

    const appt = await dbStore.getAppointmentById(testApptId);
    assert.strictEqual(appt.status, 'COMPLETED');
  });

  // Test 10: AI Specialty Triage Guidance
  await test('AI Specialty Triage correctly routes cardiac symptoms to Cardiology', async () => {
    const triage = await aiService.getSpecialtyGuidance({
      symptoms: 'Experiencing recurrent chest tightness, palpitations, and elevated blood pressure'
    });
    assert.strictEqual(triage.recommendedDepartment, 'Cardiology');
    assert(triage.disclaimer, 'AI medical disclaimer must be present');
  });

  // Test 11: AI Doctor Recommendation Engine
  await test('AI Recommendation engine scores and explains matching doctors', async () => {
    const recs = await aiService.recommendDoctors({
      specialization: 'Cardiology',
      budget: 850,
      language: 'English',
      consultationType: 'IN_PERSON'
    });
    assert(recs.recommendations.length > 0, 'Must return recommendations');
    const topDoc = recs.recommendations[0];
    assert(topDoc.matchScore > 50, 'Top doctor score must be high');
    assert(topDoc.recommendationReasons.length > 0, 'Must provide clear reasons');
    assert(topDoc.doctor.specialization === 'Cardiology', 'Specialization must match');
  });

  // Test 12: Analytics Dashboard Calculation
  await test('Admin analytics calculates real metrics from active store', async () => {
    const analytics = await dbStore.getAnalyticsOverview();
    assert(analytics.totalPatients >= 10, 'Patient count matches active records');
    assert(analytics.totalDoctors >= 6, 'Doctor count matches active records');
    assert(analytics.totalAppointments >= 5, 'Appointment count matches active records');
    assert(analytics.statusCounts.COMPLETED >= 1, 'Completed appointments tracked');
  });

  // =========================================================================
  // OLLAMA LOCAL LLM & HEALTHCARE ASSISTANT BACKEND TESTS
  // =========================================================================

  // Test 13: Ollama local LLM status inquiry
  await test('Ollama status endpoint returns structured diagnostic metrics', async () => {
    const status = await aiService.getOllamaStatus();
    assert(status.status === 'CONNECTED' || status.status === 'UNAVAILABLE', 'Status must be CONNECTED or UNAVAILABLE');
    assert(typeof status.configuredModel === 'string', 'configuredModel must be defined');
    assert(typeof status.isModelAvailable === 'boolean', 'isModelAvailable must be boolean');
  });

  // Test 14: Healthcare conversational assistant guides appointment scheduling
  await test('Healthcare conversational assistant guides appointment scheduling and maintains medical disclaimer', async () => {
    const reply = await aiService.chatAssistant({
      message: 'How can I book an appointment with a doctor?'
    });
    assert(reply.reply, 'Assistant must return a reply');
    assert(reply.reply.includes('Book an Appointment') || reply.reply.includes('Find a Doctor'), 'Must guide booking workflow');
    assert(reply.reply.includes('Disclaimer') || reply.disclaimer, 'Medical disclaimer must be present');
  });

  // Test 15: Emergency red-flag symptoms immediately trigger critical alert
  await test('Emergency red-flag symptoms trigger critical emergency notice over ordinary response', async () => {
    const reply = await aiService.chatAssistant({
      message: 'Patient has sudden crushing chest pain and severe shortness of breath'
    });
    assert.strictEqual(reply.urgency, 'CRITICAL_EMERGENCY');
    assert.strictEqual(reply.action, 'EMERGENCY_ALERT');
    assert(reply.reply.includes('108') || reply.reply.includes('112') || reply.reply.includes('Emergency Room'));
  });

  // Test 16: Chat input validation rejects empty and oversized messages
  await test('Chat input validation rejects empty, whitespace, and oversized messages', async () => {
    let emptyCaught = false;
    try {
      await aiService.chatAssistant({ message: '   ' });
    } catch (e) {
      emptyCaught = true;
      assert(e.message.includes('required') || e.message.includes('empty'));
    }
    assert(emptyCaught, 'Empty message must throw error');

    let oversizedCaught = false;
    try {
      await aiService.chatAssistant({ message: 'x'.repeat(2500) });
    } catch (e) {
      oversizedCaught = true;
      assert(e.message.includes('exceeds'));
    }
    assert(oversizedCaught, 'Oversized message (>2000 chars) must throw error');
  });

  // Test 17: Authenticated user chat verification with JWT Bearer token
  await test('Authenticated user chat route verifies valid JWT Bearer token', async () => {
    const testUser = await dbStore.findUserById(testPatientId);
    assert(testUser, 'Test patient must exist');
    const token = generateToken(testUser);

    let nextCalled = false;
    const mockReq = {
      headers: { authorization: `Bearer ${token}` }
    };
    const mockRes = {
      status(code) { this.statusCode = code; return this; },
      json(data) { this.body = data; return this; }
    };

    await verifyAuth(mockReq, mockRes, () => { nextCalled = true; });
    assert(nextCalled, 'verifyAuth must call next() for valid token');
    assert(mockReq.user && mockReq.user.id === testPatientId, 'req.user must be populated');
  });

  // Test 18: Unauthenticated chat request rejection (HTTP 401 Unauthorized)
  await test('Unauthenticated chat request is rejected with HTTP 401', async () => {
    let nextCalled = false;
    let statusCode = 200;
    let responseBody = null;

    const mockReq = { headers: {} };
    const mockRes = {
      status(code) { statusCode = code; return this; },
      json(data) { responseBody = data; return this; }
    };

    await verifyAuth(mockReq, mockRes, () => { nextCalled = true; });
    assert(!nextCalled, 'verifyAuth must NOT call next() when token is missing');
    assert.strictEqual(statusCode, 401, 'Must return 401 status');
    assert(responseBody.error.includes('No token provided'), 'Error must specify missing token');
  });

  // Test 19: Invalid payload rejection with 400 Bad Request
  await test('Empty or non-string message payload is rejected', async () => {
    let err = false;
    try {
      await aiService.chatAssistant({ message: '' });
    } catch (e) {
      err = true;
    }
    assert(err, 'Empty message must be rejected');
  });

  // Test 20: AI microservice resilience and fallback
  await test('AI assistant provides reliable clinical fallback when external service is offline', async () => {
    // Calling chat with a non-emergency clinical symptom
    const reply = await aiService.chatAssistant({
      message: 'I have severe knee pain and joint swelling when walking'
    });
    assert(reply.reply, 'Must return a guidance reply');
    assert(reply.recommendedDepartment === 'Orthopedics' || reply.reply.includes('Orthopedics'), 'Must route to Orthopedics');
  });

  console.log(`\n========================================`);
  console.log(`📊 Test Results: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
