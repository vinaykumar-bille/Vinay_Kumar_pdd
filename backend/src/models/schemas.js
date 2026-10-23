import mongoose from 'mongoose';

// User Schema
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, default: '' },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['ADMIN', 'DOCTOR', 'PATIENT', 'RECEPTIONIST'], default: 'PATIENT' },
  accountStatus: { type: String, enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'], default: 'ACTIVE' },
  gender: { type: String, default: 'Not Specified' },
  dateOfBirth: { type: String, default: '' },
  city: { type: String, default: 'Chennai' },
  avatar: { type: String, default: '' },
  docId: { type: String, default: '' }
}, { timestamps: true });

// Patient Schema
const PatientSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  bloodGroup: { type: String, default: 'O+' },
  allergies: { type: [String], default: [] },
  chronicConditions: { type: [String], default: [] },
  emergencyContactName: { type: String, default: '' },
  emergencyContactPhone: { type: String, default: '' },
  medicalHistoryNotes: { type: String, default: '' }
}, { timestamps: true });

// Doctor Schema
const DoctorSchema = new mongoose.Schema({
  userId: { type: String, default: '' },
  name: { type: String, required: true },
  email: { type: String, required: true, lowercase: true },
  specialization: { type: String, required: true },
  department: { type: String, required: true },
  qualifications: { type: String, default: 'MBBS, MD' },
  experienceYears: { type: Number, default: 5 },
  bio: { type: String, default: '' },
  languages: { type: [String], default: ['English'] },
  consultationFee: { type: Number, required: true, default: 500 },
  clinicId: { type: String, default: 'clinic_1' },
  clinicName: { type: String, default: 'MediBook AI Central Clinic' },
  rating: { type: Number, default: 4.8 },
  reviewCount: { type: Number, default: 12 },
  verificationStatus: { type: String, enum: ['VERIFIED', 'PENDING', 'REJECTED'], default: 'VERIFIED' },
  consultationModes: { type: [String], default: ['IN_PERSON', 'VIDEO'] },
  imageUrl: { type: String, default: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400' },
  availableDays: { type: [String], default: ['Monday', 'Wednesday', 'Friday'] },
  availableTimeSlots: { type: [String], default: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'] }
}, { timestamps: true });

// Clinic / Hospital Schema
const ClinicSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  departments: { type: [String], default: [] },
  operatingHours: { type: String, default: '08:00 AM - 08:00 PM' },
  consultationModes: { type: [String], default: ['IN_PERSON', 'VIDEO'] }
}, { timestamps: true });

// Specialization Schema
const SpecializationSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  icon: { type: String, default: 'Stethoscope' },
  active: { type: Boolean, default: true },
  doctorCount: { type: Number, default: 0 }
}, { timestamps: true });

// Doctor Availability Schema
const DoctorAvailabilitySchema = new mongoose.Schema({
  doctorId: { type: String, required: true, unique: true },
  clinicId: { type: String, default: 'clinic_1' },
  workingDays: { type: [String], default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] },
  startTime: { type: String, default: '09:00 AM' },
  endTime: { type: String, default: '05:00 PM' },
  slotDurationMinutes: { type: Number, default: 30 },
  breaks: { type: [{ start: String, end: String, title: String }], default: [{ start: '01:00 PM', end: '02:00 PM', title: 'Lunch Break' }] },
  leaveDates: { type: [String], default: [] },
  consultationModes: { type: [String], default: ['IN_PERSON', 'VIDEO'] }
}, { timestamps: true });

// Appointment Schema
const AppointmentSchema = new mongoose.Schema({
  appointmentNumber: { type: String, required: true, unique: true },
  patientId: { type: String, required: true },
  patientName: { type: String, required: true },
  patientEmail: { type: String, default: '' },
  patientPhone: { type: String, default: '' },
  doctorId: { type: String, required: true },
  doctorName: { type: String, required: true },
  department: { type: String, required: true },
  clinicId: { type: String, default: 'clinic_1' },
  clinicName: { type: String, default: 'MediBook AI Central Clinic' },
  appointmentDate: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, default: '' },
  consultationType: { type: String, enum: ['IN_PERSON', 'VIDEO'], default: 'IN_PERSON' },
  reasonForVisit: { type: String, default: 'General Consultation' },
  status: { 
    type: String, 
    enum: ['PENDING', 'CONFIRMED', 'RESCHEDULED', 'CANCELLED', 'REJECTED', 'CHECKED_IN', 'IN_CONSULTATION', 'COMPLETED', 'NO_SHOW'],
    default: 'CONFIRMED'
  },
  videoMeetingUrl: { type: String, default: '' },
  cancellationReason: { type: String, default: '' },
  doctorNotes: { type: String, default: '' },
  rescheduleHistory: { type: Array, default: [] }
}, { timestamps: true });

// Prescription Schema
const PrescriptionSchema = new mongoose.Schema({
  appointmentId: { type: String, required: true },
  patientId: { type: String, required: true },
  patientName: { type: String, required: true },
  doctorId: { type: String, required: true },
  doctorName: { type: String, required: true },
  department: { type: String, required: true },
  diagnosis: { type: String, required: true },
  symptoms: { type: String, default: '' },
  medications: { type: [{
    name: String,
    dosage: String,
    duration: String,
    instructions: String
  }], default: [] },
  advice: { type: String, default: '' },
  followUpDate: { type: String, default: '' },
  issuedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Medical Record Schema
const MedicalRecordSchema = new mongoose.Schema({
  patientId: { type: String, required: true },
  patientName: { type: String, default: '' },
  fileName: { type: String, required: true },
  fileSize: { type: String, default: '1.2 MB' },
  recordType: { type: String, default: 'Lab Report' },
  description: { type: String, default: '' },
  fileUrl: { type: String, default: '' },
  uploadedAt: { type: String, default: '' }
}, { timestamps: true });

// Notification Schema
const NotificationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['APPOINTMENT', 'PRESCRIPTION', 'SYSTEM', 'REMINDER'], default: 'APPOINTMENT' },
  read: { type: Boolean, default: false }
}, { timestamps: true });

// Audit Log Schema
const AuditLogSchema = new mongoose.Schema({
  userId: { type: String, default: 'SYSTEM' },
  userName: { type: String, default: 'System Event' },
  userRole: { type: String, default: 'SYSTEM' },
  action: { type: String, required: true },
  entityType: { type: String, required: true },
  entityId: { type: String, default: '' },
  details: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

export const MongoModels = {
  User: mongoose.models.User || mongoose.model('User', UserSchema),
  Patient: mongoose.models.Patient || mongoose.model('Patient', PatientSchema),
  Doctor: mongoose.models.Doctor || mongoose.model('Doctor', DoctorSchema),
  Clinic: mongoose.models.Clinic || mongoose.model('Clinic', ClinicSchema),
  Specialization: mongoose.models.Specialization || mongoose.model('Specialization', SpecializationSchema),
  DoctorAvailability: mongoose.models.DoctorAvailability || mongoose.model('DoctorAvailability', DoctorAvailabilitySchema),
  Appointment: mongoose.models.Appointment || mongoose.model('Appointment', AppointmentSchema),
  Prescription: mongoose.models.Prescription || mongoose.model('Prescription', PrescriptionSchema),
  MedicalRecord: mongoose.models.MedicalRecord || mongoose.model('MedicalRecord', MedicalRecordSchema),
  Notification: mongoose.models.Notification || mongoose.model('Notification', NotificationSchema),
  AuditLog: mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema)
};
