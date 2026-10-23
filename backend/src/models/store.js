import {
  initialUsers,
  initialDoctors,
  initialClinics,
  initialSpecializations,
  initialDoctorAvailabilities,
  initialAppointments,
  initialPrescriptions,
  initialMedicalRecords,
  initialNotifications,
  initialAuditLogs,
  initialPatientProfiles
} from '../seed/seedData.js';

class DataStore {
  constructor() {
    this.reset();
  }

  reset() {
    this.users = JSON.parse(JSON.stringify(initialUsers));
    this.doctors = JSON.parse(JSON.stringify(initialDoctors));
    this.clinics = JSON.parse(JSON.stringify(initialClinics));
    this.specializations = JSON.parse(JSON.stringify(initialSpecializations));
    this.availabilities = JSON.parse(JSON.stringify(initialDoctorAvailabilities));
    this.appointments = JSON.parse(JSON.stringify(initialAppointments));
    this.prescriptions = JSON.parse(JSON.stringify(initialPrescriptions));
    this.records = JSON.parse(JSON.stringify(initialMedicalRecords));
    this.notifications = JSON.parse(JSON.stringify(initialNotifications));
    this.auditLogs = JSON.parse(JSON.stringify(initialAuditLogs));
    this.patientProfiles = JSON.parse(JSON.stringify(initialPatientProfiles));
    this.counter = 2000;
  }

  // Helper for generating unique sequential IDs
  generateId(prefix) {
    return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  }

  generateAppointmentNumber() {
    this.counter += 1;
    return `MBA-${this.counter}`;
  }

  // --- USERS & AUTH ---
  async findUserByEmail(email) {
    if (!email) return null;
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  async findUserById(id) {
    return this.users.find(u => u.id === id) || null;
  }

  async createUser(userData) {
    const existing = await this.findUserByEmail(userData.email);
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }
    const id = userData.id || this.generateId('usr');
    const newUser = {
      id,
      name: userData.name,
      email: userData.email.toLowerCase(),
      phone: userData.phone || '',
      passwordHash: userData.passwordHash,
      role: (userData.role || 'PATIENT').toUpperCase(),
      accountStatus: userData.accountStatus || 'ACTIVE',
      gender: userData.gender || 'Not Specified',
      dateOfBirth: userData.dateOfBirth || '',
      city: userData.city || 'Chennai',
      avatar: userData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
      docId: userData.docId || '',
      createdAt: new Date().toISOString()
    };
    this.users.push(newUser);

    if (newUser.role === 'PATIENT') {
      this.patientProfiles.push({
        userId: id,
        bloodGroup: userData.bloodGroup || 'O+',
        allergies: userData.allergies || [],
        chronicConditions: userData.chronicConditions || [],
        emergencyContactName: userData.emergencyContactName || '',
        emergencyContactPhone: userData.emergencyContactPhone || '',
        medicalHistoryNotes: userData.medicalHistoryNotes || ''
      });
    }

    await this.logAudit({
      userId: id,
      userName: newUser.name,
      userRole: newUser.role,
      action: 'USER_REGISTERED',
      entityType: 'USER',
      entityId: id,
      details: `New ${newUser.role} account registered.`
    });

    return newUser;
  }

  async getAllUsers() {
    return this.users;
  }

  async updateUser(id, updateData) {
    const idx = this.users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    this.users[idx] = { ...this.users[idx], ...updateData, updatedAt: new Date().toISOString() };
    return this.users[idx];
  }

  // --- PATIENTS ---
  async getPatientProfile(userId) {
    const user = await this.findUserById(userId);
    if (!user) return null;
    const profile = this.patientProfiles.find(p => p.userId === userId) || {};
    return { ...user, ...profile };
  }

  async updatePatientProfile(userId, data) {
    const userIdx = this.users.findIndex(u => u.id === userId);
    if (userIdx !== -1) {
      if (data.name) this.users[userIdx].name = data.name;
      if (data.phone) this.users[userIdx].phone = data.phone;
      if (data.city) this.users[userIdx].city = data.city;
      if (data.dateOfBirth) this.users[userIdx].dateOfBirth = data.dateOfBirth;
      if (data.gender) this.users[userIdx].gender = data.gender;
    }

    let profileIdx = this.patientProfiles.findIndex(p => p.userId === userId);
    if (profileIdx === -1) {
      this.patientProfiles.push({ userId, ...data });
    } else {
      this.patientProfiles[profileIdx] = { ...this.patientProfiles[profileIdx], ...data };
    }
    return this.getPatientProfile(userId);
  }

  async getAllPatients() {
    return this.users.filter(u => u.role === 'PATIENT');
  }

  // --- DOCTORS ---
  async getAllDoctors(filter = {}) {
    let list = [...this.doctors];
    if (filter.specialization) {
      list = list.filter(d => d.specialization.toLowerCase() === filter.specialization.toLowerCase());
    }
    if (filter.department) {
      list = list.filter(d => d.department.toLowerCase() === filter.department.toLowerCase());
    }
    if (filter.clinicId) {
      list = list.filter(d => d.clinicId === filter.clinicId);
    }
    if (filter.consultationMode) {
      list = list.filter(d => d.consultationModes.includes(filter.consultationMode));
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(d => 
        d.name.toLowerCase().includes(q) || 
        d.specialization.toLowerCase().includes(q) ||
        d.department.toLowerCase().includes(q) ||
        d.clinicName.toLowerCase().includes(q)
      );
    }
    return list;
  }

  async getDoctorById(id) {
    return this.doctors.find(d => d.id === id) || null;
  }

  async createDoctor(docData) {
    const id = this.generateId('doc');
    const newDoc = {
      id,
      userId: docData.userId || this.generateId('usr_doc'),
      name: docData.name,
      email: docData.email,
      specialization: docData.specialization,
      department: docData.department || docData.specialization,
      qualifications: docData.qualifications || 'MBBS, MD',
      experienceYears: Number(docData.experienceYears) || 5,
      bio: docData.bio || '',
      languages: docData.languages || ['English'],
      consultationFee: Number(docData.consultationFee) || 500,
      clinicId: docData.clinicId || 'clinic_1',
      clinicName: docData.clinicName || 'MediBook AI Central Hospital',
      rating: 4.8,
      reviewCount: 0,
      verificationStatus: docData.verificationStatus || 'VERIFIED',
      consultationModes: docData.consultationModes || ['IN_PERSON', 'VIDEO'],
      imageUrl: docData.imageUrl || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400',
      availableDays: docData.availableDays || ['Monday', 'Wednesday', 'Friday'],
      availableTimeSlots: docData.availableTimeSlots || ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'],
      createdAt: new Date().toISOString()
    };
    this.doctors.push(newDoc);

    // Also create Doctor Availability record
    this.availabilities.push({
      doctorId: id,
      clinicId: newDoc.clinicId,
      workingDays: newDoc.availableDays,
      startTime: '09:00 AM',
      endTime: '05:00 PM',
      slotDurationMinutes: 30,
      breaks: [{ start: '01:00 PM', end: '02:00 PM', title: 'Lunch' }],
      leaveDates: [],
      consultationModes: newDoc.consultationModes
    });

    await this.logAudit({
      userId: 'ADMIN',
      userName: 'Administrator',
      userRole: 'ADMIN',
      action: 'CREATE_DOCTOR',
      entityType: 'DOCTOR',
      entityId: id,
      details: `Created doctor profile for ${newDoc.name} (${newDoc.specialization})`
    });

    return newDoc;
  }

  async updateDoctor(id, data) {
    const idx = this.doctors.findIndex(d => d.id === id);
    if (idx === -1) return null;
    this.doctors[idx] = { ...this.doctors[idx], ...data, updatedAt: new Date().toISOString() };
    return this.doctors[idx];
  }

  async deleteDoctor(id) {
    const doc = this.doctors.find(d => d.id === id);
    this.doctors = this.doctors.filter(d => d.id !== id);
    this.availabilities = this.availabilities.filter(a => a.doctorId !== id);
    if (doc) {
      this.users = this.users.filter(u => u.email !== doc.email);
    }
    return { success: true };
  }

  // --- CLINICS & SPECIALIZATIONS ---
  async getAllClinics() {
    return this.clinics;
  }

  async getAllSpecializations() {
    // Dynamic doctor counts
    return this.specializations.map(s => {
      const count = this.doctors.filter(d => d.specialization.toLowerCase() === s.name.toLowerCase() || d.department.toLowerCase() === s.name.toLowerCase()).length;
      return { ...s, doctorCount: count };
    });
  }

  async createSpecialization(data) {
    const id = this.generateId('spec');
    const newSpec = {
      id,
      name: data.name,
      description: data.description || '',
      icon: data.icon || 'Stethoscope',
      active: true,
      doctorCount: 0
    };
    this.specializations.push(newSpec);
    return newSpec;
  }

  // --- DOCTOR AVAILABILITY & DYNAMIC SLOTS ---
  async getDoctorAvailability(doctorId) {
    let avail = this.availabilities.find(a => a.doctorId === doctorId);
    if (!avail) {
      const doctor = await this.getDoctorById(doctorId);
      if (!doctor) return null;
      avail = {
        doctorId,
        clinicId: doctor.clinicId,
        workingDays: doctor.availableDays || ['Monday', 'Wednesday', 'Friday'],
        startTime: '09:00 AM',
        endTime: '05:00 PM',
        slotDurationMinutes: 30,
        breaks: [{ start: '01:00 PM', end: '02:00 PM', title: 'Lunch' }],
        leaveDates: [],
        consultationModes: doctor.consultationModes || ['IN_PERSON', 'VIDEO']
      };
      this.availabilities.push(avail);
    }
    return avail;
  }

  async updateDoctorAvailability(doctorId, data) {
    const idx = this.availabilities.findIndex(a => a.doctorId === doctorId);
    if (idx === -1) {
      const newAvail = { doctorId, ...data };
      this.availabilities.push(newAvail);
      return newAvail;
    }
    this.availabilities[idx] = { ...this.availabilities[idx], ...data };
    return this.availabilities[idx];
  }

  /**
   * Generates dynamic available time slots for a doctor on a specific calendar date.
   * Checks doctor's configured working days, leaves, breaks, and existing bookings.
   */
  async getDoctorSlotsForDate(doctorId, dateString) {
    const doctor = await this.getDoctorById(doctorId);
    if (!doctor) throw new Error('Doctor not found');

    const avail = await this.getDoctorAvailability(doctorId);
    const dateObj = new Date(dateString);
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = daysOfWeek[dateObj.getDay()];

    // 1. Check if doctor works on this day
    if (!avail.workingDays.includes(dayName)) {
      return {
        date: dateString,
        day: dayName,
        isWorkingDay: false,
        reason: `${doctor.name} is not scheduled to work on ${dayName}s.`,
        slots: []
      };
    }

    // 2. Check if doctor is on leave
    if (avail.leaveDates && avail.leaveDates.includes(dateString)) {
      return {
        date: dateString,
        day: dayName,
        isWorkingDay: false,
        reason: `${doctor.name} is on leave on this date.`,
        slots: []
      };
    }

    // 3. Generate time intervals
    const slots = doctor.availableTimeSlots && doctor.availableTimeSlots.length > 0
      ? [...doctor.availableTimeSlots]
      : ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM'];

    // 4. Retrieve existing active appointments for this doctor on this date
    const bookedAppointments = this.appointments.filter(a =>
      a.doctorId === doctorId &&
      a.appointmentDate === dateString &&
      !['CANCELLED', 'REJECTED'].includes(a.status)
    );

    const bookedTimes = new Set(bookedAppointments.map(a => a.startTime));

    const evaluatedSlots = slots.map(time => {
      const isBooked = bookedTimes.has(time);
      return {
        time,
        available: !isBooked,
        status: isBooked ? 'BOOKED' : 'AVAILABLE'
      };
    });

    return {
      date: dateString,
      day: dayName,
      isWorkingDay: true,
      doctor: { id: doctor.id, name: doctor.name, fee: doctor.consultationFee },
      slots: evaluatedSlots
    };
  }

  // --- APPOINTMENTS ENGINE & DOUBLE-BOOKING PREVENTION ---
  async getAllAppointments(filter = {}) {
    let list = [...this.appointments];
    if (filter.patientId) {
      list = list.filter(a => a.patientId === filter.patientId);
    }
    if (filter.doctorId) {
      list = list.filter(a => a.doctorId === filter.doctorId);
    }
    if (filter.clinicId) {
      list = list.filter(a => a.clinicId === filter.clinicId);
    }
    if (filter.status) {
      list = list.filter(a => a.status === filter.status);
    }
    if (filter.date) {
      list = list.filter(a => a.appointmentDate === filter.date);
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(a => 
        a.appointmentNumber.toLowerCase().includes(q) ||
        a.patientName.toLowerCase().includes(q) ||
        a.doctorName.toLowerCase().includes(q) ||
        a.department.toLowerCase().includes(q)
      );
    }
    // Sort descending by created date
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return list;
  }

  async getAppointmentById(id) {
    return this.appointments.find(a => a.id === id || a.appointmentNumber === id) || null;
  }

  /**
   * Atomic appointment booking with double-booking prevention constraint.
   */
  async createAppointment(data) {
    const { patientId, doctorId, appointmentDate, startTime, consultationType, reasonForVisit } = data;

    const doctor = await this.getDoctorById(doctorId);
    if (!doctor) throw new Error('Doctor not found');

    const patient = await this.findUserById(patientId);
    if (!patient) throw new Error('Patient not found');

    // Strict overlap check: Prevent double booking
    const conflicting = this.appointments.find(a =>
      a.doctorId === doctorId &&
      a.appointmentDate === appointmentDate &&
      a.startTime === startTime &&
      !['CANCELLED', 'REJECTED'].includes(a.status)
    );

    if (conflicting) {
      throw new Error(`This time slot (${startTime} on ${appointmentDate}) is already booked and no longer available. Please choose a different slot.`);
    }

    const apptId = this.generateId('app');
    const appointmentNumber = this.generateAppointmentNumber();
    const mode = (consultationType || 'IN_PERSON').toUpperCase();
    const videoUrl = mode === 'VIDEO' ? `https://meet.jit.si/medibook-ai-consult-${appointmentNumber.toLowerCase()}` : '';

    const newAppt = {
      id: apptId,
      appointmentNumber,
      patientId,
      patientName: data.patientName || patient.name,
      patientEmail: patient.email,
      patientPhone: patient.phone,
      doctorId,
      doctorName: doctor.name,
      department: doctor.department,
      clinicId: doctor.clinicId,
      clinicName: doctor.clinicName,
      appointmentDate,
      startTime,
      endTime: data.endTime || '',
      consultationType: mode,
      reasonForVisit: reasonForVisit || 'General Health Consultation',
      status: 'CONFIRMED',
      videoMeetingUrl: videoUrl,
      cancellationReason: '',
      doctorNotes: '',
      rescheduleHistory: [],
      createdAt: new Date().toISOString()
    };

    this.appointments.unshift(newAppt);

    // Create Notification for Patient
    await this.createNotification({
      userId: patientId,
      title: 'Appointment Confirmed',
      message: `Your ${mode === 'VIDEO' ? 'teleconsultation' : 'in-person appointment'} with ${doctor.name} on ${appointmentDate} at ${startTime} has been confirmed. (Ref: ${appointmentNumber})`,
      type: 'APPOINTMENT'
    });

    // Create Notification for Doctor
    const docUser = this.users.find(u => u.email === doctor.email);
    if (docUser) {
      await this.createNotification({
        userId: docUser.id,
        title: 'New Patient Booking',
        message: `${newAppt.patientName} has booked an appointment on ${appointmentDate} at ${startTime}.`,
        type: 'APPOINTMENT'
      });
    }

    // Audit Log
    await this.logAudit({
      userId: patientId,
      userName: newAppt.patientName,
      userRole: 'PATIENT',
      action: 'BOOK_APPOINTMENT',
      entityType: 'APPOINTMENT',
      entityId: appointmentNumber,
      details: `Scheduled ${mode} appointment with ${doctor.name} on ${appointmentDate} at ${startTime}`
    });

    return newAppt;
  }

  async rescheduleAppointment(id, { newDate, newStartTime, reason, updatedBy }) {
    const appt = await this.getAppointmentById(id);
    if (!appt) throw new Error('Appointment not found');

    if (appt.status === 'CANCELLED' || appt.status === 'COMPLETED') {
      throw new Error(`Cannot reschedule an appointment that is already ${appt.status.toLowerCase()}.`);
    }

    // Check if new slot is available
    const conflicting = this.appointments.find(a =>
      a.id !== appt.id &&
      a.doctorId === appt.doctorId &&
      a.appointmentDate === newDate &&
      a.startTime === newStartTime &&
      !['CANCELLED', 'REJECTED'].includes(a.status)
    );

    if (conflicting) {
      throw new Error(`The requested new slot (${newStartTime} on ${newDate}) is already booked. Please choose another time.`);
    }

    const previousDate = appt.appointmentDate;
    const previousTime = appt.startTime;

    appt.rescheduleHistory.push({
      fromDate: previousDate,
      fromTime: previousTime,
      toDate: newDate,
      toTime: newStartTime,
      reason: reason || 'Schedule adjustment',
      timestamp: new Date().toISOString(),
      updatedBy: updatedBy || 'PATIENT'
    });

    appt.appointmentDate = newDate;
    appt.startTime = newStartTime;
    appt.status = 'RESCHEDULED';
    appt.updatedAt = new Date().toISOString();

    // Notify patient
    await this.createNotification({
      userId: appt.patientId,
      title: 'Appointment Rescheduled',
      message: `Your appointment with ${appt.doctorName} has been rescheduled to ${newDate} at ${newStartTime}. (Ref: ${appt.appointmentNumber})`,
      type: 'APPOINTMENT'
    });

    await this.logAudit({
      userId: appt.patientId,
      userName: appt.patientName,
      userRole: updatedBy || 'PATIENT',
      action: 'RESCHEDULE_APPOINTMENT',
      entityType: 'APPOINTMENT',
      entityId: appt.appointmentNumber,
      details: `Rescheduled from ${previousDate} ${previousTime} to ${newDate} ${newStartTime}. Reason: ${reason}`
    });

    return appt;
  }

  async cancelAppointment(id, { reason, cancelledBy }) {
    const appt = await this.getAppointmentById(id);
    if (!appt) throw new Error('Appointment not found');

    if (appt.status === 'CANCELLED') {
      throw new Error('Appointment is already cancelled.');
    }
    if (appt.status === 'COMPLETED') {
      throw new Error('Cannot cancel a completed consultation.');
    }

    appt.status = 'CANCELLED';
    appt.cancellationReason = reason || 'Cancelled by user';
    appt.updatedAt = new Date().toISOString();

    // Notify Patient
    await this.createNotification({
      userId: appt.patientId,
      title: 'Appointment Cancelled',
      message: `Your appointment with ${appt.doctorName} on ${appt.appointmentDate} has been cancelled. Reason: ${appt.cancellationReason}`,
      type: 'APPOINTMENT'
    });

    await this.logAudit({
      userId: appt.patientId,
      userName: appt.patientName,
      userRole: cancelledBy || 'PATIENT',
      action: 'CANCEL_APPOINTMENT',
      entityType: 'APPOINTMENT',
      entityId: appt.appointmentNumber,
      details: `Cancelled appointment on ${appt.appointmentDate}. Reason: ${reason}`
    });

    return appt;
  }

  async updateAppointmentStatus(id, { status, doctorNotes, updatedBy }) {
    const appt = await this.getAppointmentById(id);
    if (!appt) throw new Error('Appointment not found');

    const prevStatus = appt.status;
    appt.status = status;
    if (doctorNotes !== undefined) appt.doctorNotes = doctorNotes;
    appt.updatedAt = new Date().toISOString();

    // If completed or checked in, notify patient
    await this.createNotification({
      userId: appt.patientId,
      title: `Appointment Status: ${status}`,
      message: `Your appointment with ${appt.doctorName} has been updated to "${status}".`,
      type: 'APPOINTMENT'
    });

    await this.logAudit({
      userId: updatedBy || 'DOCTOR',
      userName: updatedBy || 'Staff',
      userRole: 'STAFF',
      action: 'UPDATE_APPOINTMENT_STATUS',
      entityType: 'APPOINTMENT',
      entityId: appt.appointmentNumber,
      details: `Status changed from ${prevStatus} to ${status}`
    });

    return appt;
  }

  // --- PRESCRIPTIONS ---
  async getAllPrescriptions(filter = {}) {
    let list = [...this.prescriptions];
    if (filter.patientId) list = list.filter(p => p.patientId === filter.patientId);
    if (filter.doctorId) list = list.filter(p => p.doctorId === filter.doctorId);
    if (filter.appointmentId) list = list.filter(p => p.appointmentId === filter.appointmentId);
    return list;
  }

  async createPrescription(data) {
    const id = this.generateId('pres');
    const newPres = {
      id,
      appointmentId: data.appointmentId,
      patientId: data.patientId,
      patientName: data.patientName,
      doctorId: data.doctorId,
      doctorName: data.doctorName,
      department: data.department || 'General',
      diagnosis: data.diagnosis,
      symptoms: data.symptoms || '',
      medications: data.medications || [],
      advice: data.advice || '',
      followUpDate: data.followUpDate || '',
      issuedAt: new Date().toISOString()
    };
    this.prescriptions.unshift(newPres);

    // Update appointment to COMPLETED
    if (data.appointmentId) {
      const appt = await this.getAppointmentById(data.appointmentId);
      if (appt) {
        appt.status = 'COMPLETED';
        appt.doctorNotes = appt.doctorNotes ? `${appt.doctorNotes} | Digital Prescription Created` : 'Digital Prescription Created';
      }
    }

    // Notify patient
    await this.createNotification({
      userId: data.patientId,
      title: 'Digital Prescription Issued',
      message: `${data.doctorName} has created your official prescription for consultation on ${newPres.issuedAt.split('T')[0]}.`,
      type: 'PRESCRIPTION'
    });

    await this.logAudit({
      userId: data.doctorId,
      userName: data.doctorName,
      userRole: 'DOCTOR',
      action: 'ISSUE_PRESCRIPTION',
      entityType: 'PRESCRIPTION',
      entityId: id,
      details: `Prescription issued for patient ${data.patientName}. Diagnosis: ${data.diagnosis}`
    });

    return newPres;
  }

  // --- MEDICAL RECORDS ---
  async getRecordsByPatient(patientId) {
    return this.records.filter(r => r.patientId === patientId);
  }

  async createRecord(data) {
    const id = this.generateId('rec');
    const newRecord = {
      id,
      patientId: data.patientId,
      patientName: data.patientName || '',
      fileName: data.fileName,
      fileSize: data.fileSize || '1.0 MB',
      recordType: data.recordType || 'Lab Report',
      description: data.description || '',
      fileUrl: data.fileUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      uploadedAt: new Date().toISOString().split('T')[0]
    };
    this.records.unshift(newRecord);
    return newRecord;
  }

  async deleteRecord(id) {
    this.records = this.records.filter(r => r.id !== id);
    return { success: true };
  }

  // --- NOTIFICATIONS ---
  async getNotifications(userId) {
    return this.notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async createNotification(notifData) {
    const id = this.generateId('notif');
    const notif = {
      id,
      userId: notifData.userId,
      title: notifData.title,
      message: notifData.message,
      type: notifData.type || 'APPOINTMENT',
      read: false,
      createdAt: new Date().toISOString()
    };
    this.notifications.unshift(notif);
    return notif;
  }

  async markNotificationRead(id) {
    const notif = this.notifications.find(n => n.id === id);
    if (notif) notif.read = true;
    return notif;
  }

  async markAllNotificationsRead(userId) {
    this.notifications.filter(n => n.userId === userId).forEach(n => n.read = true);
    return { success: true };
  }

  // --- AUDIT LOGS ---
  async logAudit(logData) {
    const log = {
      id: this.generateId('log'),
      userId: logData.userId || 'SYSTEM',
      userName: logData.userName || 'System',
      userRole: logData.userRole || 'SYSTEM',
      action: logData.action,
      entityType: logData.entityType,
      entityId: logData.entityId || '',
      details: logData.details || '',
      timestamp: new Date().toISOString()
    };
    this.auditLogs.unshift(log);
    return log;
  }

  async getAuditLogs(limit = 50) {
    return this.auditLogs.slice(0, limit);
  }

  // --- ANALYTICS & REPORTS ---
  async getAnalyticsOverview() {
    const totalPatients = this.users.filter(u => u.role === 'PATIENT').length;
    const totalDoctors = this.doctors.length;
    const totalAppointments = this.appointments.length;
    const totalClinics = this.clinics.length;

    // Status breakdown
    const statusCounts = {
      CONFIRMED: this.appointments.filter(a => a.status === 'CONFIRMED').length,
      PENDING: this.appointments.filter(a => a.status === 'PENDING').length,
      COMPLETED: this.appointments.filter(a => a.status === 'COMPLETED').length,
      CANCELLED: this.appointments.filter(a => a.status === 'CANCELLED').length,
      RESCHEDULED: this.appointments.filter(a => a.status === 'RESCHEDULED').length,
      CHECKED_IN: this.appointments.filter(a => a.status === 'CHECKED_IN').length
    };

    // Department Distribution
    const deptMap = {};
    this.doctors.forEach(d => {
      deptMap[d.department] = (deptMap[d.department] || 0) + 1;
    });
    const departmentStats = Object.keys(deptMap).map(name => ({
      name,
      doctorCount: deptMap[name],
      appointmentCount: this.appointments.filter(a => a.department === name).length
    }));

    // Consultation Type Distribution
    const inPersonCount = this.appointments.filter(a => a.consultationType === 'IN_PERSON').length;
    const videoCount = this.appointments.filter(a => a.consultationType === 'VIDEO').length;

    // 7-Day Trend
    const trends = [
      { date: '14 Oct', bookings: 4, completed: 2, cancelled: 1 },
      { date: '15 Oct', bookings: 6, completed: 3, cancelled: 0 },
      { date: '16 Oct', bookings: 8, completed: 5, cancelled: 1 },
      { date: '17 Oct', bookings: 12, completed: 7, cancelled: 2 },
      { date: '18 Oct', bookings: 15, completed: 10, cancelled: 1 },
      { date: '19 Oct', bookings: 18, completed: 12, cancelled: 2 },
      { date: '20 Oct', bookings: 22, completed: 16, cancelled: 1 }
    ];

    return {
      totalPatients,
      totalDoctors,
      totalAppointments,
      totalClinics,
      statusCounts,
      departmentStats,
      consultationModes: [
        { name: 'In-Person Consultation', value: inPersonCount },
        { name: 'Video Teleconsultation', value: videoCount }
      ],
      trends
    };
  }
}

export const dbStore = new DataStore();
export default dbStore;
