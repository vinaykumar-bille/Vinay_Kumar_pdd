import assert from 'assert';
import dbStore from '../src/models/store.js';
import aiService from '../src/services/aiService.js';

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
