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

// Safe API caller wrapper
const apiRequest = async (method, url, data = null, params = null) => {
  try {
    const config = { method, url };
    if (data) config.data = data;
    if (params) config.params = params;
    const response = await axiosInstance(config);
    return response.data;
  } catch (error) {
    console.warn(`Backend connection unavailable for ${url}. Executing on-the-fly client state integration!`, error);

    // Simulate API logic locally using local storage!
    const db = getMockDb();

    // 1. Auth Mock API
    if (url === '/auth/login') {
      const user = db.users.find(u => u.email.toLowerCase() === data.email.toLowerCase() && u.role === data.role);
      if (!user) throw new Error("Invalid credentials or role.");
      return user;
    }

    if (url === '/auth/register') {
      const existing = db.users.find(u => u.email.toLowerCase() === data.email.toLowerCase());
      if (existing) return existing;
      const id = "usr_" + (db.users.length + 1);
      const newUser = { id, ...data };
      db.users.push(newUser);
      saveMockDb(db);
      return newUser;
    }

    // 2. Doctors Mock API
    if (url === '/doctors') {
      if (method === 'get') {
        if (params && params.department) {
          return db.doctors.filter(d => d.department.toLowerCase() === params.department.toLowerCase());
        }
        return db.doctors;
      }
      if (method === 'post') {
        const id = "doc_" + (db.doctors.length + 1);
        const newDoc = { id, ...data, rating: 4.8, imageUrl: data.imageUrl || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400" };
        db.doctors.push(newDoc);
        db.users.push({ id, name: newDoc.name, email: newDoc.email, role: 'doctor', docId: id });
        saveMockDb(db);
        return newDoc;
      }
    }

    if (url.startsWith('/doctors/')) {
      const id = url.split('/').pop();
      if (method === 'put') {
        const idx = db.doctors.findIndex(d => d.id === id);
        if (idx !== -1) {
          db.doctors[idx] = { ...db.doctors[idx], ...data };
          saveMockDb(db);
          return db.doctors[idx];
        }
      }
      if (method === 'delete') {
        db.doctors = db.doctors.filter(d => d.id !== id);
        db.users = db.users.filter(u => u.id !== id);
        saveMockDb(db);
        return { success: true };
      }
    }

    // 3. Patients Mock API
    if (url === '/patients') {
      return db.users.filter(u => u.role === 'patient');
    }

    // 4. Appointments Mock API
    if (url === '/appointments') {
      if (method === 'get') {
        let list = db.appointments;
        if (params) {
          if (params.patientId) list = list.filter(a => a.patientId === params.patientId);
          if (params.doctorId) list = list.filter(a => a.doctorId === params.doctorId);
        }
        return list;
      }
      if (method === 'post') {
        // Smart Check: Avoid overlapping appointments
        const doctor = db.doctors.find(d => d.id === data.doctorId);
        const overlapping = db.appointments.find(a =>
          a.doctorId === data.doctorId &&
          a.date === data.date &&
          a.timeSlot === data.timeSlot &&
          a.status !== "Rejected"
        );
        if (overlapping) {
          throw new Error("Overlap Detected! This specific slot is already reserved by another patient. Please choose an alternative slot.");
        }

        const id = "app_" + (db.appointments.length + 1);
        const newApp = {
          id,
          patientId: data.patientId,
          patientName: data.patientName,
          doctorId: data.doctorId,
          doctorName: doctor ? doctor.name : "Selected Doctor",
          department: doctor ? doctor.department : "General",
          date: data.date,
          timeSlot: data.timeSlot,
          status: "Pending",
          symptoms: data.symptoms || "General Checkup",
          notes: "",
          createdAt: new Date().toISOString()
        };
        db.appointments.push(newApp);

        // Notify
        db.notifications.push({
          id: "n_" + (db.notifications.length + 1),
          userId: data.patientId,
          title: "Appointment Booked",
          message: `Your booking request for Dr. ${doctor ? doctor.name : 'Doctor'} on ${data.date} is successfully logged and pending approval.`,
          read: false,
          createdAt: new Date().toISOString()
        });

        saveMockDb(db);
        return newApp;
      }
    }

    if (url.startsWith('/appointments/') && url.endsWith('/status')) {
      const id = url.split('/')[2];
      const appIdx = db.appointments.findIndex(a => a.id === id);
      if (appIdx !== -1) {
        db.appointments[appIdx].status = data.status;
        if (data.notes) db.appointments[appIdx].notes = data.notes;

        db.notifications.push({
          id: "n_" + (db.notifications.length + 1),
          userId: db.appointments[appIdx].patientId,
          title: `Appointment ${data.status}`,
          message: `Your appointment with ${db.appointments[appIdx].doctorName} on ${db.appointments[appIdx].date} has been ${data.status.toLowerCase()}.`,
          read: false,
          createdAt: new Date().toISOString()
        });

        saveMockDb(db);
        return db.appointments[appIdx];
      }
    }

    // 5. Prescriptions Mock API
    if (url === '/prescriptions') {
      if (method === 'get') {
        let list = db.prescriptions;
        if (params) {
          if (params.patientId) list = list.filter(p => p.patientId === params.patientId);
          if (params.doctorId) list = list.filter(p => p.doctorId === params.doctorId);
        }
        return list;
      }
      if (method === 'post') {
        const id = "pres_" + (db.prescriptions.length + 1);
        const newPres = { id, date: new Date().toISOString().split('T')[0], ...data };
        db.prescriptions.push(newPres);

        // Complete appointment
        const appIdx = db.appointments.findIndex(a => a.id === data.appointmentId);
        if (appIdx !== -1) {
          db.appointments[appIdx].status = "Completed";
          db.appointments[appIdx].notes = "Digital Prescription Created.";
        }

        saveMockDb(db);
        return newPres;
      }
    }

    // 6. Medical Records Mock API
    if (url.startsWith('/records/')) {
      const pId = url.split('/').pop();
      return db.records.filter(r => r.patientId === pId);
    }
    if (url === '/records' && method === 'post') {
      const id = "rec_" + (db.records.length + 1);
      const newRec = { id, uploadedAt: new Date().toISOString().split('T')[0], ...data };
      db.records.push(newRec);
      saveMockDb(db);
      return newRec;
    }
    if (url.startsWith('/records/') && method === 'delete') {
      const id = url.split('/').pop();
      db.records = db.records.filter(r => r.id !== id);
      saveMockDb(db);
      return { success: true };
    }

    // 7. Notifications Mock API
    if (url.startsWith('/notifications/') && url.endsWith('/read')) {
      const uId = url.split('/')[2];
      db.notifications.filter(n => n.userId === uId).forEach(n => n.read = true);
      saveMockDb(db);
      return { success: true };
    }
    if (url.startsWith('/notifications/')) {
      const uId = url.split('/').pop();
      return db.notifications.filter(n => n.userId === uId);
    }

    // 8. AI Assistant Triage Chatbot Logic Fallback
    if (url === '/ai/chat') {
      const query = data.message.toLowerCase();
      let department = "General Medicine";
      let textAnalysis = "Consult with a health specialist.";

      if (query.includes("heart") || query.includes("chest") || query.includes("cardiac") || query.includes("pulse")) {
        department = "Cardiology";
        textAnalysis = "Your description indicates a cardiac system check. Please visit **Cardiology**.";
      } else if (query.includes("bone") || query.includes("joint") || query.includes("fracture") || query.includes("spine")) {
        department = "Orthopedics";
        textAnalysis = "This indicates a bone or joint distress. Recommend our expert **Orthopedics** team.";
      } else if (query.includes("ear") || query.includes("nose") || query.includes("throat") || query.includes("hearing") || query.includes("throat")) {
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
        reply: `Hi! I'm the Saveetha Clinical Bot. ${textAnalysis} \n\nI recommend scheduling a consultation slot in our **${department}** department.\n\n*⚠️ Emergency Notice: If this is an critical health emergency, proceed to the nearest emergency room immediately.*`,
        recommendedDepartment: department
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
    forecast: (days = 7) => apiRequest('get', '/ai/forecast', null, { days })
  },
  analytics: {
    get: () => apiRequest('get', '/analytics/overview'),
    getOverview: () => apiRequest('get', '/analytics/overview'),
    getAuditLogs: (limit = 50) => apiRequest('get', '/analytics/audit-logs', null, { limit }),
    exportAppointmentsUrl: `${API_BASE_URL}/analytics/export/appointments`
  }
};
export default api;
