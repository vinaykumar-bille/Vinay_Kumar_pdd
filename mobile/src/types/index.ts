export type Role = 'PATIENT' | 'DOCTOR' | 'RECEPTIONIST' | 'ADMIN';

export type AppointmentStatus = 
  | 'PENDING'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'IN_CONSULTATION'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'RESCHEDULED'
  | 'REJECTED'
  | 'NO_SHOW'
  | 'Pending'
  | 'Approved'
  | 'Completed'
  | 'Cancelled'
  | 'Rejected';

export type ConsultationType = 'IN_PERSON' | 'VIDEO' | 'In-Person' | 'Video Call';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  gender?: string;
  age?: number;
  dateOfBirth?: string;
  city?: string;
  bloodGroup?: string;
  allergies?: string;
}

export interface Doctor {
  id: string;
  name: string;
  email: string;
  department: string;
  specialization: string;
  experience: number;
  fees: number;
  rating: number;
  availableDays: string[];
  availableTimeSlots: string[];
  imageUrl: string;
  about: string;
  clinicId?: string;
  clinicName?: string;
  consultationModes?: ConsultationType[];
}

export interface Appointment {
  id: string;
  appointmentNumber?: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  department: string;
  date: string;
  timeSlot: string;
  status: AppointmentStatus;
  symptoms: string;
  consultationType?: ConsultationType;
  notes?: string;
  cancellationReason?: string;
  rescheduledFrom?: string;
  createdAt?: string;
}

export interface Medicine {
  name: string;
  dosage: string;
  duration: string;
  instructions: string;
}

export interface Prescription {
  id: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  diagnosis: string;
  symptoms: string;
  medicines: Medicine[];
  advice?: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  fileName: string;
  fileSize: string;
  uploadedAt: string;
  description: string;
  fileUrl?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface Specialization {
  id: string;
  name: string;
  department: string;
  description: string;
  icon?: string;
}
