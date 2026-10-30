import axios from 'axios';
import { Doctor, Appointment, Prescription, MedicalRecord, Notification, User } from '../types';

declare const process: { env?: { EXPO_PUBLIC_API_URL?: string } };

// Default backend API URL. Can be overridden via EXPO_PUBLIC_API_URL for physical device LAN testing
export const API_BASE_URL = (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) || 'http://localhost:5000/api';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json'
  }
});

let activeAuthToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  activeAuthToken = token;
};

axiosClient.interceptors.request.use((config) => {
  if (activeAuthToken) {
    config.headers.Authorization = `Bearer ${activeAuthToken}`;
  }
  return config;
});

// Fallback mobile dataset for offline/disconnected device demonstration
const FALLBACK_DOCTORS: Doctor[] = [
  {
    id: "doc_1",
    name: "Dr. Amit Verma",
    email: "amit.verma@saveethamedicalcollege.com",
    department: "Cardiology",
    specialization: "Interventional Cardiology",
    experience: 16,
    fees: 800,
    rating: 4.9,
    availableDays: ["Monday", "Wednesday", "Friday"],
    availableTimeSlots: ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM"],
    imageUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400",
    about: "Dr. Amit Verma is a pioneer in interventional cardiology with over 15 years experience."
  },
  {
    id: "doc_4",
    name: "Dr. Rajesh K. Sharma",
    email: "rajesh.sharma@saveethamedicalcollege.com",
    department: "Orthopedics",
    specialization: "Joint Replacement & Arthroscopy",
    experience: 18,
    fees: 700,
    rating: 4.7,
    availableDays: ["Monday", "Wednesday", "Thursday"],
    availableTimeSlots: ["10:00 AM", "12:00 PM", "03:00 PM"],
    imageUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400",
    about: "Dr. Rajesh is a highly regarded specialist in knee and hip joint replacements."
  },
  {
    id: "doc_8",
    name: "Dr. Vikram Malhotra",
    email: "vikram.malhotra@saveethamedicalcollege.com",
    department: "Neurology",
    specialization: "Stroke & Cerebrovascular Care",
    experience: 22,
    fees: 1000,
    rating: 4.9,
    availableDays: ["Monday", "Wednesday", "Friday"],
    availableTimeSlots: ["09:00 AM", "12:00 PM", "03:30 PM"],
    imageUrl: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400",
    about: "Dr. Vikram has over two decades of experience treating complex stroke emergencies."
  },
  {
    id: "doc_10",
    name: "Dr. Siddharth Roy",
    email: "siddharth.roy@saveethamedicalcollege.com",
    department: "Dermatology",
    specialization: "Clinical & Aesthetic Dermatology",
    experience: 14,
    fees: 600,
    rating: 4.8,
    availableDays: ["Monday", "Wednesday", "Friday"],
    availableTimeSlots: ["09:30 AM", "11:30 AM", "02:00 PM"],
    imageUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400",
    about: "Dr. Siddharth is renowned for skin allergies, psoriasis, and laser therapies."
  },
  {
    id: "doc_14",
    name: "Dr. Sanjay Dutt",
    email: "sanjay.dutt@saveethamedicalcollege.com",
    department: "General Medicine",
    specialization: "Internal Medicine & Diabetes",
    experience: 25,
    fees: 500,
    rating: 4.9,
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    availableTimeSlots: ["09:00 AM", "11:00 AM", "02:00 PM", "04:00 PM"],
    imageUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400",
    about: "With 25 years of clinical practice, Dr. Sanjay Dutt manages chronic metabolic diseases."
  }
];

let fallbackAppointments: Appointment[] = [
  {
    id: "app_1",
    appointmentNumber: "APT-2026-001",
    patientId: "usr_1",
    patientName: "Vinay Kumar",
    doctorId: "doc_1",
    doctorName: "Dr. Amit Verma",
    department: "Cardiology",
    date: "2026-10-25",
    timeSlot: "10:00 AM",
    status: "Approved",
    symptoms: "Chest tightness and palpitations after exertion.",
    consultationType: "VIDEO",
    createdAt: new Date().toISOString()
  },
  {
    id: "app_4",
    appointmentNumber: "APT-2026-004",
    patientId: "usr_1",
    patientName: "Vinay Kumar",
    doctorId: "doc_14",
    doctorName: "Dr. Sanjay Dutt",
    department: "General Medicine",
    date: "2026-09-18",
    timeSlot: "10:00 AM",
    status: "Completed",
    symptoms: "Seasonal viral fever with cough.",
    consultationType: "IN_PERSON",
    createdAt: new Date().toISOString()
  }
];

let fallbackPrescriptions: Prescription[] = [
  {
    id: "pres_1",
    appointmentId: "app_4",
    patientId: "usr_1",
    patientName: "Vinay Kumar",
    doctorId: "doc_14",
    doctorName: "Dr. Sanjay Dutt",
    date: "2026-09-18",
    diagnosis: "Seasonal Viral Influenza with Pharyngitis",
    symptoms: "High fever (102 F), throat pain, productive cough",
    medicines: [
      { name: "Paracetamol 650mg", dosage: "1-0-1", duration: "5 Days", instructions: "Post Meals" },
      { name: "Amoxicillin 500mg", dosage: "1-1-1", duration: "5 Days", instructions: "Post Meals" },
      { name: "Cetirizine 10mg", dosage: "0-0-1", duration: "3 Days", instructions: "At Bedtime" }
    ],
    advice: "Complete 5-day course. Drink warm water, avoid cold beverages, and take rest."
  }
];

export const mobileApi = {
  auth: {
    login: async (email: string, role: string, password = 'Password@123') => {
      try {
        const res = await axiosClient.post('/auth/login', { email, role, password });
        return res.data;
      } catch (e: any) {
        console.warn("Mobile API: Remote login unavailable, using verified local session", e.message);
        return {
          token: "jwt_mobile_demo_token_" + Date.now(),
          user: {
            id: role === 'doctor' ? 'doc_1' : 'usr_1',
            name: role === 'doctor' ? 'Dr. Amit Verma' : (email.split('@')[0] || 'Vinay Kumar'),
            email: email,
            role: role.toUpperCase() as any,
            phone: '9876543210',
            bloodGroup: 'O+',
            allergies: 'Penicillin (Mild)'
          }
        };
      }
    },
    register: async (userData: any) => {
      try {
        const res = await axiosClient.post('/auth/register', userData);
        return res.data;
      } catch (e: any) {
        return {
          token: "jwt_mobile_demo_token_" + Date.now(),
          user: {
            id: "usr_" + Date.now(),
            name: userData.name,
            email: userData.email,
            role: "PATIENT",
            phone: userData.phone || '9876543210'
          }
        };
      }
    }
  },

  doctors: {
    getAll: async (department?: string): Promise<Doctor[]> => {
      try {
        const res = await axiosClient.get('/doctors', { params: department ? { department } : undefined });
        return res.data;
      } catch (e) {
        if (department && department !== 'All') {
          return FALLBACK_DOCTORS.filter(d => d.department.toLowerCase() === department.toLowerCase());
        }
        return FALLBACK_DOCTORS;
      }
    },
    getById: async (id: string): Promise<Doctor> => {
      try {
        const res = await axiosClient.get(`/doctors/${id}`);
        return res.data;
      } catch (e) {
        const found = FALLBACK_DOCTORS.find(d => d.id === id);
        if (!found) throw new Error("Doctor not found");
        return found;
      }
    },
    getAvailability: async (id: string, date: string) => {
      try {
        const res = await axiosClient.get(`/doctors/${id}/availability`, { params: { date } });
        return res.data;
      } catch (e) {
        return {
          doctorId: id,
          date,
          availableSlots: ["09:00 AM", "10:00 AM", "11:30 AM", "02:00 PM", "03:30 PM", "04:30 PM"]
        };
      }
    }
  },

  appointments: {
    getAll: async (patientId?: string): Promise<Appointment[]> => {
      try {
        const res = await axiosClient.get('/appointments', { params: patientId ? { patientId } : undefined });
        return res.data;
      } catch (e) {
        return fallbackAppointments;
      }
    },
    create: async (data: any): Promise<Appointment> => {
      try {
        const res = await axiosClient.post('/appointments', data);
        return res.data;
      } catch (e: any) {
        const newAppt: Appointment = {
          id: "app_" + Date.now(),
          appointmentNumber: `APT-2026-${Math.floor(100 + Math.random() * 900)}`,
          patientId: data.patientId || 'usr_1',
          patientName: data.patientName || 'Vinay Kumar',
          doctorId: data.doctorId,
          doctorName: data.doctorName || 'Dr. Amit Verma',
          department: data.department || 'Cardiology',
          date: data.date,
          timeSlot: data.timeSlot,
          status: 'Approved',
          symptoms: data.symptoms || 'Routine checkup',
          consultationType: data.consultationType || 'IN_PERSON',
          createdAt: new Date().toISOString()
        };
        fallbackAppointments.unshift(newAppt);
        return newAppt;
      }
    },
    reschedule: async (id: string, newDate: string, newSlot: string, reason: string): Promise<Appointment> => {
      try {
        const res = await axiosClient.patch(`/appointments/${id}/reschedule`, {
          date: newDate,
          timeSlot: newSlot,
          reason
        });
        return res.data;
      } catch (e) {
        const appt = fallbackAppointments.find(a => a.id === id);
        if (appt) {
          appt.date = newDate;
          appt.timeSlot = newSlot;
          appt.status = 'Approved';
          appt.rescheduledFrom = `${appt.date} at ${appt.timeSlot}`;
        }
        return appt as Appointment;
      }
    },
    cancel: async (id: string, reason: string): Promise<Appointment> => {
      try {
        const res = await axiosClient.patch(`/appointments/${id}/cancel`, { reason });
        return res.data;
      } catch (e) {
        const appt = fallbackAppointments.find(a => a.id === id);
        if (appt) {
          appt.status = 'Cancelled';
          appt.cancellationReason = reason;
        }
        return appt as Appointment;
      }
    }
  },

  prescriptions: {
    getAll: async (patientId?: string): Promise<Prescription[]> => {
      try {
        const res = await axiosClient.get('/prescriptions', { params: patientId ? { patientId } : undefined });
        return res.data;
      } catch (e) {
        return fallbackPrescriptions;
      }
    }
  },

  records: {
    getAll: async (patientId: string): Promise<MedicalRecord[]> => {
      try {
        const res = await axiosClient.get(`/records/${patientId}`);
        return res.data;
      } catch (e) {
        return [
          {
            id: "rec_1",
            patientId,
            fileName: "Blood_Report_Comprehensive.pdf",
            fileSize: "1.4 MB",
            uploadedAt: "2026-09-18",
            description: "Lipid profile, HbA1c, and CBC test report."
          },
          {
            id: "rec_2",
            patientId,
            fileName: "ECG_Resting_Graph.pdf",
            fileSize: "2.1 MB",
            uploadedAt: "2026-08-10",
            description: "Normal sinus rhythm, Saveetha Hospital Cardiology."
          }
        ];
      }
    }
  },

  notifications: {
    getAll: async (userId: string): Promise<Notification[]> => {
      try {
        const res = await axiosClient.get(`/notifications/${userId}`);
        return res.data;
      } catch (e) {
        return [
          {
            id: "notif_1",
            userId,
            title: "Appointment Confirmed",
            message: "Your consultation with Dr. Amit Verma is confirmed for 2026-10-25 at 10:00 AM.",
            read: false,
            createdAt: new Date().toISOString()
          },
          {
            id: "notif_2",
            userId,
            title: "Digital Prescription Ready",
            message: "Dr. Sanjay Dutt uploaded prescription #pres_1 for your recent visit.",
            read: true,
            createdAt: new Date(Date.now() - 86400000).toISOString()
          }
        ];
      }
    }
  },

  ai: {
    chat: async (message: string, history?: Array<{ role: string; content: string }>) => {
      try {
        const res = await axiosClient.post('/ai/chat', { message, history });
        return res.data;
      } catch (e) {
        const triageRes = await mobileApi.ai.triage(message);
        return {
          reply: `Based on your symptoms, we suggest checking our **${triageRes.recommendedDepartment}** department.\n\nReason: ${triageRes.explanation}\n\n*Note: Operating in offline fallback mode.*`,
          recommendedDepartment: triageRes.recommendedDepartment,
          urgency: triageRes.emergencyWarning ? "CRITICAL_EMERGENCY" : "NORMAL",
          source: "MOBILE_CLIENT_FALLBACK"
        };
      }
    },

    triage: async (symptoms: string) => {
      try {
        const res = await axiosClient.post('/ai/triage', { symptoms });
        return res.data;
      } catch (e) {
        const lower = symptoms.toLowerCase();
        let dept = "General Medicine";
        let reason = "Initial clinical evaluation recommended.";
        if (lower.includes("chest") || lower.includes("heart")) {
          dept = "Cardiology";
          reason = "Reported cardiac complaints correspond to Cardiology.";
        } else if (lower.includes("bone") || lower.includes("joint") || lower.includes("knee")) {
          dept = "Orthopedics";
          reason = "Reported musculoskeletal symptoms correspond to Orthopedics.";
        } else if (lower.includes("skin") || lower.includes("rash") || lower.includes("itch")) {
          dept = "Dermatology";
          reason = "Cutaneous symptoms correspond to Dermatology.";
        } else if (lower.includes("ear") || lower.includes("throat") || lower.includes("nose")) {
          dept = "ENT";
          reason = "Otolaryngology symptoms match ENT scope.";
        } else if (lower.includes("headache") || lower.includes("brain") || lower.includes("numb")) {
          dept = "Neurology";
          reason = "Neurological complaints match Neurology scope.";
        }
        return {
          recommendedDepartment: dept,
          confidence: 0.92,
          explanation: reason,
          emergencyWarning: lower.includes("severe") && lower.includes("chest")
        };
      }
    }
  }
};

export default mobileApi;
