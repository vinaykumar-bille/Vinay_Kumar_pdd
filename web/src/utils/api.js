import axios from 'axios';

// Base URL for the Express API
const API_BASE_URL = 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Auto-attach JWT auth token from localStorage if present
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('medibook_jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Standalone Fallback Store for Client-Only demonstration in case backend server is not running
const MOCK_STORAGE_KEY = 'healthnet_mock_db';

const getMockDb = () => {
  let db = localStorage.getItem(MOCK_STORAGE_KEY);
  if (!db) {
    // Populate with baseline data matching dummyData.js
    const baseline = {
      users: [
        { id: "usr_1", name: "Vinay Kumar", email: "vinay@gmail.com", role: "patient", gender: "Male", age: 24, phone: "9876543210" },
        { id: "usr_2", name: "Rahul Deshmukh", email: "rahul@gmail.com", role: "patient", gender: "Male", age: 34, phone: "9988776655" },
        { id: "usr_3", name: "Anjali Gupta", email: "anjali@gmail.com", role: "patient", gender: "Female", age: 29, phone: "9123456789" },
        { id: "doc_1", name: "Dr. Amit Verma", email: "amit.verma@saveethamedicalcollege.com", role: "doctor", docId: "doc_1" },
        { id: "doc_2", name: "Dr. Priya Deshmukh", email: "priya.deshmukh@saveethamedicalcollege.com", role: "doctor", docId: "doc_2" },
        { id: "usr_admin", name: "Admin Chief", email: "admin@gmail.com", role: "admin" }
      ],
      doctors: [
        { id: "doc_1", name: "Dr. Amit Verma", email: "amit.verma@saveethamedicalcollege.com", department: "Cardiology", specialization: "Interventional Cardiology", experience: 16, fees: 800, rating: 4.9, availableDays: ["Monday", "Wednesday", "Friday"], availableTimeSlots: ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM"], imageUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400", about: "Dr. Amit Verma is a pioneer in interventional cardiology with over 15 years of experience in angioplasty." },
        { id: "doc_2", name: "Dr. Priya Deshmukh", email: "priya.deshmukh@saveethamedicalcollege.com", department: "Cardiology", specialization: "Heart Failure", experience: 12, fees: 750, rating: 4.8, availableDays: ["Tuesday", "Thursday"], availableTimeSlots: ["10:00 AM", "01:00 PM", "03:30 PM"], imageUrl: "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=400", about: "Dr. Priya is an expert in managing advanced heart failures and conducting electrophysiology tests." },
        { id: "doc_3", name: "Dr. Christopher Cole", email: "christopher.cole@saveethamedicalcollege.com", department: "Cardiology", specialization: "Cardiovascular Surgery", experience: 20, fees: 1200, rating: 5.0, availableDays: ["Monday", "Tuesday", "Thursday"], availableTimeSlots: ["09:30 AM", "12:00 PM", "02:30 PM"], imageUrl: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400", about: "Dr. Cole is an internationally acclaimed cardiothoracic surgeon, specializing in bypass surgeries." },
        { id: "doc_4", name: "Dr. Rajesh K. Sharma", email: "rajesh.sharma@saveethamedicalcollege.com", department: "Orthopedics", specialization: "Joint Replacement", experience: 18, fees: 700, rating: 4.7, availableDays: ["Monday", "Wednesday", "Thursday"], availableTimeSlots: ["10:00 AM", "12:00 PM", "03:00 PM"], imageUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400", about: "Dr. Rajesh is a highly regarded specialist in knee and hip replacements with 18 years experience." },
        { id: "doc_5", name: "Dr. Sneha Reddy", email: "sneha.reddy@saveethamedicalcollege.com", department: "Orthopedics", specialization: "Spine Surgery", experience: 9, fees: 600, rating: 4.6, availableDays: ["Tuesday", "Friday", "Saturday"], availableTimeSlots: ["09:00 AM", "11:30 AM", "02:00 PM"], imageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400", about: "Dr. Sneha Reddy specializes in spinal deformity correction using minimally invasive techniques." },
        { id: "doc_6", name: "Dr. Sandeep Gupta", email: "sandeep.gupta@saveethamedicalcollege.com", department: "ENT", specialization: "Micro Ear Surgery", experience: 15, fees: 500, rating: 4.7, availableDays: ["Monday", "Tuesday", "Wednesday"], availableTimeSlots: ["09:00 AM", "11:00 AM", "03:00 PM"], imageUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400", about: "Dr. Sandeep has exceptional command over micro-ear surgeries and sinus disorders." },
        { id: "doc_7", name: "Dr. Divya Nair", email: "divya.nair@saveethamedicalcollege.com", department: "ENT", specialization: "Rhinoplasty Specialist", experience: 8, fees: 450, rating: 4.5, availableDays: ["Tuesday", "Thursday", "Saturday"], availableTimeSlots: ["10:30 AM", "12:30 PM", "03:00 PM"], imageUrl: "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=400", about: "Dr. Divya Nair specializes in functional rhinoplasty, snoring cures, and pediatric hearing tests." },
        { id: "doc_8", name: "Dr. Vikram Malhotra", email: "vikram.malhotra@saveethamedicalcollege.com", department: "Neurology", specialization: "Stroke Specialist", experience: 22, fees: 1000, rating: 4.9, availableDays: ["Monday", "Wednesday", "Friday"], availableTimeSlots: ["09:00 AM", "12:00 PM", "03:30 PM"], imageUrl: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400", about: "Dr. Vikram Malhotra has over two decades of experience treating complex stroke emergencies." },
        { id: "doc_9", name: "Dr. Ananya Sen", email: "ananya.sen@saveethamedicalcollege.com", department: "Neurology", specialization: "Neurodegenerative Diseases", experience: 11, fees: 800, rating: 4.8, availableDays: ["Tuesday", "Thursday", "Saturday"], availableTimeSlots: ["10:00 AM", "01:00 PM", "03:00 PM"], imageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400", about: "Dr. Ananya Sen focuses on memory disorders, Alzheimer's treatment, and neuro-immunology." },
        { id: "doc_10", name: "Dr. Siddharth Roy", email: "siddharth.roy@saveethamedicalcollege.com", department: "Dermatology", specialization: "Clinical & Aesthetic Dermatology", experience: 14, fees: 600, rating: 4.8, availableDays: ["Monday", "Wednesday", "Friday"], availableTimeSlots: ["09:30 AM", "11:30 AM", "02:00 PM"], imageUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400", about: "Dr. Siddharth is highly popular for treating skin allergies, psoriasis, and conducting laser therapies." },
        { id: "doc_11", name: "Dr. Kavita Rao", email: "kavita.rao@saveethamedicalcollege.com", department: "Dermatology", specialization: "Trichology", experience: 9, fees: 550, rating: 4.6, availableDays: ["Tuesday", "Thursday"], availableTimeSlots: ["10:00 AM", "12:30 PM", "03:00 PM"], imageUrl: "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=400", about: "Dr. Kavita is a trichology specialist dealing in advanced hair loss treatments and anti-aging care." },
        { id: "doc_12", name: "Dr. Rohan Mehta", email: "rohan.mehta@saveethamedicalcollege.com", department: "Pediatrics", specialization: "Neonatal Care", experience: 17, fees: 600, rating: 4.9, availableDays: ["Monday", "Tuesday", "Thursday"], availableTimeSlots: ["09:00 AM", "11:00 AM", "01:30 PM"], imageUrl: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400", about: "Dr. Rohan has deep expertise in managing premature newborn complications." },
        { id: "doc_13", name: "Dr. Shalini Verma", email: "shalini.verma@saveethamedicalcollege.com", department: "Pediatrics", specialization: "Developmental Delay", experience: 10, fees: 550, rating: 4.7, availableDays: ["Wednesday", "Friday", "Saturday"], availableTimeSlots: ["10:30 AM", "12:30 PM", "02:30 PM"], imageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400", about: "Dr. Shalini is a pediatrician focused on childhood developmental growth markers." },
        { id: "doc_14", name: "Dr. Sanjay Dutt", email: "sanjay.dutt@saveethamedicalcollege.com", department: "General Medicine", specialization: "Diabetes Management", experience: 25, fees: 500, rating: 4.9, availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], availableTimeSlots: ["09:00 AM", "11:00 AM", "02:00 PM", "04:00 PM"], imageUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400", about: "With 25 years of clinical experience, Dr. Sanjay Dutt manages chronic diabetes and thyroid." },
        { id: "doc_15", name: "Dr. Neha Kapoor", email: "neha.kapoor@saveethamedicalcollege.com", department: "General Medicine", specialization: "Internal Medicine", experience: 7, fees: 400, rating: 4.6, availableDays: ["Monday", "Wednesday", "Saturday"], availableTimeSlots: ["10:00 AM", "01:00 PM", "03:00 PM"], imageUrl: "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=400", about: "Dr. Neha Kapoor specializes in preventive health check-ups and general medical fitness." },
        { id: "doc_16", name: "Dr. Robert Carter", email: "robert.carter@saveethamedicalcollege.com", department: "Neurology", specialization: "Neuromuscular Disorders", experience: 16, fees: 950, rating: 4.8, availableDays: ["Monday", "Tuesday", "Thursday"], availableTimeSlots: ["10:00 AM", "02:30 PM"], imageUrl: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400", about: "Dr. Carter manages nerve compressions and performs detailed diagnostics." },
        { id: "doc_17", name: "Dr. Snehal Bhatia", email: "snehal.bhatia@saveethamedicalcollege.com", department: "Dermatology", specialization: "Eczema Specialist", experience: 12, fees: 600, rating: 4.7, availableDays: ["Monday", "Wednesday", "Friday"], availableTimeSlots: ["09:00 AM", "12:00 PM", "03:00 PM"], imageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400", about: "Dr. Bhatia specializes in childhood skin conditions and pediatric skin allergies." },
        { id: "doc_18", name: "Dr. Arvind Swamy", email: "arvind.swamy@saveethamedicalcollege.com", department: "General Medicine", specialization: "Geriatric Specialist", experience: 23, fees: 650, rating: 4.9, availableDays: ["Monday", "Wednesday", "Thursday"], availableTimeSlots: ["09:30 AM", "02:00 PM", "04:30 PM"], imageUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400", about: "Dr. Arvind provides focused clinical care for joint aches and memory decline in elders." },
        { id: "doc_19", name: "Dr. Emily Watson", email: "emily.watson@saveethamedicalcollege.com", department: "Orthopedics", specialization: "Sports Medicine", experience: 13, fees: 850, rating: 4.8, availableDays: ["Tuesday", "Thursday", "Saturday"], availableTimeSlots: ["10:00 AM", "01:00 PM", "03:00 PM"], imageUrl: "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=400", about: "Dr. Emily has served as a lead physician for sports franchises, treating sprains and tears." },
        { id: "doc_20", name: "Dr. Tarun Sen", email: "tarun.sen@saveethamedicalcollege.com", department: "Cardiology", specialization: "Imaging", experience: 10, fees: 700, rating: 4.7, availableDays: ["Monday", "Thursday"], availableTimeSlots: ["09:00 AM", "02:00 PM"], imageUrl: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400", about: "Dr. Tarun specializes in cardiac imaging and preventive lifestyle planning." }
      ],
      appointments: [
        { id: "app_1", patientId: "usr_1", patientName: "Vinay Kumar", doctorId: "doc_1", doctorName: "Dr. Amit Verma", department: "Cardiology", date: "2026-06-05", timeSlot: "10:00 AM", status: "Approved", symptoms: "Occasional chest tightness and shortness of breath.", notes: "Bring prior records.", createdAt: new Date().toISOString() },
        { id: "app_2", patientId: "usr_2", patientName: "Rahul Deshmukh", doctorId: "doc_4", doctorName: "Dr. Rajesh K. Sharma", department: "Orthopedics", date: "2026-06-03", timeSlot: "11:00 AM", status: "Pending", symptoms: "Chronic lower back pain.", notes: "", createdAt: new Date().toISOString() },
        { id: "app_3", patientId: "usr_3", patientName: "Anjali Gupta", doctorId: "doc_10", doctorName: "Dr. Siddharth Roy", department: "Dermatology", date: "2026-06-04", timeSlot: "02:00 PM", status: "Approved", symptoms: "Severe red rashes on elbows.", notes: "", createdAt: new Date().toISOString() },
        { id: "app_4", patientId: "usr_1", patientName: "Vinay Kumar", doctorId: "doc_14", doctorName: "Dr. Sanjay Dutt", department: "General Medicine", date: "2026-05-28", timeSlot: "10:00 AM", status: "Completed", symptoms: "High fever with dry cough for 3 days.", notes: "Recovered fully.", createdAt: new Date().toISOString() }
      ],
      prescriptions: [
        {
          id: "pres_1",
          appointmentId: "app_4",
          patientId: "usr_1",
          patientName: "Vinay Kumar",
          doctorId: "doc_14",
          doctorName: "Dr. Sanjay Dutt",
          date: "2026-05-28",
          diagnosis: "Seasonal Viral Influenza",
          symptoms: "High fever (102 F), dry cough.",
          medicines: [
            { name: "Paracetamol 650mg", dosage: "1-0-1", duration: "5 Days", instructions: "Post Meals" },
            { name: "Amoxicillin 500mg", dosage: "1-1-1", duration: "5 Days", instructions: "Post Meals" }
          ],
          advice: "Complete bed rest for 3 days. Consume warm fluids."
        }
      ],
      records: [
        { id: "rec_1", patientId: "usr_1", fileName: "blood_report_may2026.pdf", fileSize: "1.2 MB", uploadedAt: "2026-05-28", description: "Blood Panel Report" }
      ],
      notifications: [
        { id: "n_1", userId: "usr_1", title: "Appointment Confirmed", message: "Your appointment with Dr. Amit Verma is scheduled for 2026-06-05.", read: false, createdAt: new Date().toISOString() }
      ]
    };
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(baseline));
    return baseline;
  }
  return JSON.parse(db);
};

const saveMockDb = (db) => {
  localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(db));
};

const apiRequest = async (method, url, data = null, params = null) => {
  try {
    const config = { method, url, data, params };
    const response = await axiosInstance(config);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw error;
    }

    console.warn(`[Client Fallback] Backend unreachable at ${url}. Operating in local demo store.`);
    const db = getMockDb();

    // 1. Auth Login Fallback
    if (url === '/auth/login') {
      const { email, password, role } = data;
      const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (user) {
        return {
          token: "mock_jwt_token_sample_2026",
          user: { ...user, token: "mock_jwt_token_sample_2026" }
        };
      }
      const newMockUser = {
        id: `usr_${Date.now()}`,
        name: email.split('@')[0],
        email,
        role: role || 'patient',
        gender: "Not specified",
        age: 30
      };
      db.users.push(newMockUser);
      saveMockDb(db);
      return {
        token: "mock_jwt_token_sample_2026",
        user: { ...newMockUser, token: "mock_jwt_token_sample_2026" }
      };
    }

    // 2. Auth Register Fallback
    if (url === '/auth/register') {
      const newPatient = {
        id: `usr_${Date.now()}`,
        ...data,
        role: data.role || 'patient'
      };
      db.users.push(newPatient);
      saveMockDb(db);
      return {
        token: "mock_jwt_token_sample_2026",
        user: { ...newPatient, token: "mock_jwt_token_sample_2026" }
      };
    }

    // 3. Doctors Fallback
    if (url === '/doctors' || url.startsWith('/doctors?')) {
      if (params && params.department && params.department !== 'All') {
        return db.doctors.filter(d => d.department.toLowerCase() === params.department.toLowerCase());
      }
      return db.doctors;
    }
    if (url.startsWith('/doctors/') && url.includes('/availability')) {
      return {
        date: params?.date || new Date().toISOString().split('T')[0],
        availableSlots: ["09:00 AM", "10:00 AM", "11:30 AM", "02:00 PM", "03:30 PM", "04:30 PM"]
      };
    }
    if (url.startsWith('/doctors/')) {
      const id = url.split('/')[2];
      const doc = db.doctors.find(d => d.id === id);
      if (doc) return doc;
      return db.doctors[0];
    }

    // 4. Appointments Fallback
    if (url === '/appointments' && method === 'get') {
      if (params && params.patientId) {
        return db.appointments.filter(a => a.patientId === params.patientId);
      }
      if (params && params.doctorId) {
        return db.appointments.filter(a => a.doctorId === params.doctorId);
      }
      return db.appointments;
    }
    if (url === '/appointments' && method === 'post') {
      const newAppt = {
        id: `app_${Date.now()}`,
        ...data,
        status: 'Approved',
        createdAt: new Date().toISOString()
      };
      db.appointments.unshift(newAppt);
      saveMockDb(db);
      return newAppt;
    }
    if (url.includes('/reschedule')) {
      const id = url.split('/')[2];
      const appt = db.appointments.find(a => a.id === id);
      if (appt) {
        appt.date = data.date;
        appt.timeSlot = data.timeSlot;
        appt.status = 'Approved';
        saveMockDb(db);
        return appt;
      }
    }
    if (url.includes('/cancel')) {
      const id = url.split('/')[2];
      const appt = db.appointments.find(a => a.id === id);
      if (appt) {
        appt.status = 'Cancelled';
        saveMockDb(db);
        return appt;
      }
    }
    if (url.includes('/status')) {
      const id = url.split('/')[2];
      const appt = db.appointments.find(a => a.id === id);
      if (appt) {
        appt.status = data.status;
        saveMockDb(db);
        return appt;
      }
    }

    // 5. Prescriptions Fallback
    if (url === '/prescriptions' && method === 'get') {
      if (params && params.patientId) {
        return db.prescriptions.filter(p => p.patientId === params.patientId);
      }
      return db.prescriptions;
    }
    if (url === '/prescriptions' && method === 'post') {
      const newPres = {
        id: `pres_${Date.now()}`,
        ...data,
        date: new Date().toISOString().split('T')[0]
      };
      db.prescriptions.unshift(newPres);
      saveMockDb(db);
      return newPres;
    }

    // 6. Medical Records Fallback
    if (url.startsWith('/records/')) {
      const pId = url.split('/')[2];
      return db.records.filter(r => r.patientId === pId);
    }
    if (url === '/records' && method === 'post') {
      const newRec = {
        id: `rec_${Date.now()}`,
        ...data,
        uploadedAt: new Date().toISOString().split('T')[0]
      };
      db.records.unshift(newRec);
      saveMockDb(db);
      return newRec;
    }
    if (url.startsWith('/records/') && method === 'delete') {
      const rId = url.split('/')[2];
      db.records = db.records.filter(r => r.id !== rId);
      saveMockDb(db);
      return { success: true };
    }

    // 7. Notifications Fallback
    if (url.includes('/notifications') && url.includes('/read')) {
      const uId = url.split('/')[2];
      db.notifications.forEach(n => {
        if (n.userId === uId) n.read = true;
      });
      saveMockDb(db);
      return { success: true };
    }
    if (url.startsWith('/notifications/')) {
      const uId = url.split('/').pop();
      return db.notifications.filter(n => n.userId === uId);
    }

    // 8. AI Assistant Triage Chatbot Logic Fallback
    if (url === '/ai/chat') {
      const query = (data?.message || '').toLowerCase();
      let department = "General Medicine";
      let textAnalysis = "Consult with a health specialist.";

      if (query.includes("heart") || query.includes("chest") || query.includes("cardiac") || query.includes("pulse")) {
        department = "Cardiology";
        textAnalysis = "Your description indicates a cardiac system check. Please visit **Cardiology**.";
      } else if (query.includes("bone") || query.includes("joint") || query.includes("fracture") || query.includes("spine")) {
        department = "Orthopedics";
        textAnalysis = "This indicates a bone or joint distress. Recommend our expert **Orthopedics** team.";
      } else if (query.includes("ear") || query.includes("nose") || query.includes("throat") || query.includes("hearing")) {
        department = "ENT";
        textAnalysis = "These nasal or auditory complaints match the scope of **ENT** services.";
      } else if (query.includes("brain") || query.includes("headache") || query.includes("nerve") || query.includes("paralysis")) {
        department = "Neurology";
        textAnalysis = "Persistent head pain or numbness corresponds to the **Neurology** clinic.";
      } else if (query.includes("skin") || query.includes("rash") || query.includes("acne") || query.includes("itch")) {
        department = "Dermatology";
        textAnalysis = "A cutaneous allergy or spot matches our **Dermatology** specialized department.";
      } else if (query.includes("child") || query.includes("baby") || query.includes("kid") || query.includes("pediatric")) {
        department = "Pediatrics";
        textAnalysis = "Infant wellness and childhood symptoms belong with our expert **Pediatrics** physicians.";
      } else if (query.includes("fever") || query.includes("cold") || query.includes("cough") || query.includes("diabetes") || query.includes("bp")) {
        department = "General Medicine";
        textAnalysis = "Typical seasonal illness or lifestyle management should start at **General Medicine**.";
      }

      return {
        reply: `Hi! I'm the MediBook AI Clinical Bot. ${textAnalysis} \n\nI recommend scheduling a consultation slot in our **${department}** department.\n\n*⚠️ Emergency Notice: If this is a critical health emergency, proceed to the nearest emergency room immediately.*`,
        recommendedDepartment: department,
        source: 'CLIENT_FALLBACK'
      };
    }

    // 8b. Ollama Status Fallback
    if (url === '/ai/ollama/status') {
      return {
        status: 'UNAVAILABLE',
        configuredModel: 'llama3.2:3b',
        isModelAvailable: false,
        availableModels: [],
        message: 'Running in demonstration fallback mode'
      };
    }

    // 9. Analytics Mock API
    if (url === '/analytics') {
      const totalPatients = db.users.filter(u => u.role === 'patient').length;
      const totalDoctors = db.doctors.length;
      const totalAppointments = db.appointments.length;

      const deptSplit = {};
      db.doctors.forEach(d => {
        deptSplit[d.department] = (deptSplit[d.department] || 0) + 1;
      });
      const departmentStats = Object.keys(deptSplit).map(name => ({
        name,
        value: deptSplit[name]
      }));

      const trends = [
        { date: "26 May", appointments: 3, completed: 1 },
        { date: "27 May", appointments: 5, completed: 2 },
        { date: "28 May", appointments: 8, completed: 4 },
        { date: "29 May", appointments: 12, completed: 6 },
        { date: "30 May", appointments: 15, completed: 9 }
      ];

      return { totalPatients, totalDoctors, totalAppointments, departmentStats, trends };
    }

    throw new Error(`Fallback handling not configured for path ${url}`);
  }
};

export const api = {
  auth: {
    login: (email, role, password) => apiRequest('post', '/auth/login', { email, role, password }),
    register: (userData) => apiRequest('post', '/auth/register', userData)
  },
  doctors: {
    getAll: (params) => apiRequest('get', '/doctors', null, typeof params === 'string' ? { department: params } : params),
    getById: (id) => apiRequest('get', `/doctors/${id}`),
    getAvailability: (id, date) => apiRequest('get', `/doctors/${id}/availability`, null, date ? { date } : null),
    getSpecializations: () => apiRequest('get', '/doctors/specializations'),
    createSpecialization: (data) => apiRequest('post', '/doctors/specializations', data),
    create: (docData) => apiRequest('post', '/doctors', docData),
    update: (id, docData) => apiRequest('put', `/doctors/${id}`, docData),
    delete: (id) => apiRequest('delete', `/doctors/${id}`)
  },
  patients: {
    getAll: () => apiRequest('get', '/patients')
  },
  appointments: {
    getAll: (params) => apiRequest('get', '/appointments', null, params),
    getById: (id) => apiRequest('get', `/appointments/${id}`),
    create: (appData) => apiRequest('post', '/appointments', appData),
    updateStatus: (id, status, notes) => apiRequest('put', `/appointments/${id}/status`, { status, notes }),
    reschedule: (id, date, timeSlot, reason) => apiRequest('patch', `/appointments/${id}/reschedule`, { date, timeSlot, reason }),
    cancel: (id, reason) => apiRequest('patch', `/appointments/${id}/cancel`, { reason }),
    checkIn: (id) => apiRequest('patch', `/appointments/${id}/status`, { status: 'CHECKED_IN' })
  },
  prescriptions: {
    getAll: (params) => apiRequest('get', '/prescriptions', null, params),
    create: (presData) => apiRequest('post', '/prescriptions', presData)
  },
  records: {
    getAll: (patientId) => apiRequest('get', `/records/${patientId}`),
    create: (recordData) => apiRequest('post', '/records', recordData),
    delete: (id) => apiRequest('delete', `/records/${id}`)
  },
  notifications: {
    getAll: (userId) => apiRequest('get', `/notifications/${userId}`),
    markAsRead: (userId) => apiRequest('put', `/notifications/${userId}/read`)
  },
  receptionist: {
    getQueue: () => apiRequest('get', '/receptionist/queue'),
    checkIn: (id) => apiRequest('post', `/receptionist/check-in/${id}`),
    callIn: (id) => apiRequest('post', `/receptionist/call-in/${id}`),
    walkIn: (data) => apiRequest('post', '/receptionist/walk-in', data)
  },
  ai: {
    chat: (message, history) => apiRequest('post', '/ai/chat', { message, history }),
    triage: (symptoms, patientAge, gender) => apiRequest('post', '/ai/triage', { symptoms, patientAge, gender }),
    recommend: (preferences) => apiRequest('post', '/ai/recommend', preferences),
    forecast: (days = 7) => apiRequest('get', '/ai/forecast', null, { days }),
    getOllamaStatus: () => apiRequest('get', '/ai/ollama/status')
  },
  analytics: {
    get: () => apiRequest('get', '/analytics/overview'),
    getOverview: () => apiRequest('get', '/analytics/overview'),
    getAuditLogs: (limit = 50) => apiRequest('get', '/analytics/audit-logs', null, { limit }),
    exportAppointmentsUrl: `${API_BASE_URL}/analytics/export/appointments`
  }
};
export default api;
