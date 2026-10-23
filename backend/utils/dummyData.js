// Rich Clinical Seed Data and Mock Database Store for Zero-Config Demonstration Mode

export const doctors = [
  // Cardiology
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
    availableTimeSlots: ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"],
    imageUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400",
    about: "Dr. Amit Verma is a pioneer in interventional cardiology with over 15 years of experience in angioplasty, pacemaker installations, and pediatric cardiac treatments."
  },
  {
    id: "doc_2",
    name: "Dr. Priya Deshmukh",
    email: "priya.deshmukh@saveethamedicalcollege.com",
    department: "Cardiology",
    specialization: "Heart Failure & Electrophysiology",
    experience: 12,
    fees: 750,
    rating: 4.8,
    availableDays: ["Tuesday", "Thursday", "Saturday"],
    availableTimeSlots: ["10:00 AM", "11:30 AM", "01:00 PM", "03:30 PM", "04:30 PM"],
    imageUrl: "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=400",
    about: "Dr. Priya is an expert in managing advanced heart failures and conducting electrophysiology tests with multiple publications in international journals."
  },
  {
    id: "doc_3",
    name: "Dr. Christopher Cole",
    email: "christopher.cole@saveethamedicalcollege.com",
    department: "Cardiology",
    specialization: "Cardiovascular Surgery",
    experience: 20,
    fees: 1200,
    rating: 5.0,
    availableDays: ["Monday", "Tuesday", "Thursday"],
    availableTimeSlots: ["09:30 AM", "10:30 AM", "12:00 PM", "02:30 PM", "05:00 PM"],
    imageUrl: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400",
    about: "Dr. Cole is an internationally acclaimed cardiothoracic surgeon, specializing in bypass surgeries, valve replacements, and complex coronary artery repairs."
  },

  // Orthopedics
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
    availableTimeSlots: ["10:00 AM", "11:00 AM", "12:00 PM", "03:00 PM", "04:00 PM"],
    imageUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400",
    about: "Dr. Rajesh is a highly regarded specialist in knee and hip replacements. He has performed over 3,000 successful surgeries with a rapid recovery protocol."
  },
  {
    id: "doc_5",
    name: "Dr. Sneha Reddy",
    email: "sneha.reddy@saveethamedicalcollege.com",
    department: "Orthopedics",
    specialization: "Spine Surgery & Pediatric Ortho",
    experience: 9,
    fees: 600,
    rating: 4.6,
    availableDays: ["Tuesday", "Friday", "Saturday"],
    availableTimeSlots: ["09:00 AM", "10:30 AM", "11:30 AM", "02:00 PM", "03:30 PM"],
    imageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400",
    about: "Dr. Sneha specializes in spinal deformity correction, slip discs, and pediatric orthopedic anomalies, using advanced minimally invasive techniques."
  },

  // ENT
  {
    id: "doc_6",
    name: "Dr. Sandeep Gupta",
    email: "sandeep.gupta@saveethamedicalcollege.com",
    department: "ENT",
    specialization: "Otology & Micro Ear Surgery",
    experience: 15,
    fees: 500,
    rating: 4.7,
    availableDays: ["Monday", "Tuesday", "Wednesday", "Friday"],
    availableTimeSlots: ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"],
    imageUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400",
    about: "Dr. Sandeep has exceptional command over micro-ear surgeries, cochlear implants, and treatments for chronic sinusitis and voice disorders."
  },
  {
    id: "doc_7",
    name: "Dr. Divya Nair",
    email: "divya.nair@saveethamedicalcollege.com",
    department: "ENT",
    specialization: "Rhinoplasty & Allergy Management",
    experience: 8,
    fees: 450,
    rating: 4.5,
    availableDays: ["Tuesday", "Thursday", "Saturday"],
    availableTimeSlots: ["10:30 AM", "11:30 AM", "12:30 PM", "03:00 PM", "04:00 PM"],
    imageUrl: "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=400",
    about: "Dr. Divya Nair specializes in functional rhinoplasty, snoring cures, nasal allergies, and pediatric hearing loss evaluation."
  },

  // Neurology
  {
    id: "doc_8",
    name: "Dr. Vikram Malhotra",
    email: "vikram.malhotra@saveethamedicalcollege.com",
    department: "Neurology",
    specialization: "Stroke & Epilepsy Specialist",
    experience: 22,
    fees: 1000,
    rating: 4.9,
    availableDays: ["Monday", "Wednesday", "Friday"],
    availableTimeSlots: ["09:00 AM", "10:30 AM", "12:00 PM", "02:00 PM", "03:30 PM", "05:00 PM"],
    imageUrl: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400",
    about: "Dr. Vikram Malhotra has over two decades of experience treating complex stroke emergencies, intractable epilepsy, and Parkinson's disease."
  },
  {
    id: "doc_9",
    name: "Dr. Ananya Sen",
    email: "ananya.sen@saveethamedicalcollege.com",
    department: "Neurology",
    specialization: "Neurodegenerative Diseases & Dementia",
    experience: 11,
    fees: 800,
    rating: 4.8,
    availableDays: ["Tuesday", "Thursday", "Saturday"],
    availableTimeSlots: ["10:00 AM", "11:00 AM", "01:00 PM", "03:00 PM", "04:00 PM"],
    imageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400",
    about: "Dr. Ananya Sen focuses on memory disorders, Alzheimer's treatment, neuro-immunology, and peripheral neuropathy."
  },

  // Dermatology
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
    availableTimeSlots: ["09:30 AM", "10:30 AM", "11:30 AM", "02:00 PM", "03:00 PM", "04:00 PM"],
    imageUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400",
    about: "Dr. Siddharth is highly popular for treating skin allergies, psoriasis, eczema, acne scars, and conducting advanced laser hair removals."
  },
  {
    id: "doc_11",
    name: "Dr. Kavita Rao",
    email: "kavita.rao@saveethamedicalcollege.com",
    department: "Dermatology",
    specialization: "Trichology & Anti-Aging Care",
    experience: 9,
    fees: 550,
    rating: 4.6,
    availableDays: ["Tuesday", "Thursday", "Saturday"],
    availableTimeSlots: ["10:00 AM", "11:30 AM", "12:30 PM", "03:00 PM", "04:30 PM"],
    imageUrl: "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=400",
    about: "Dr. Kavita is a trichology specialist dealing in advanced hair loss treatments (PRP), chemical peels, and botox treatments."
  },

  // Pediatrics
  {
    id: "doc_12",
    name: "Dr. Rohan Mehta",
    email: "rohan.mehta@saveethamedicalcollege.com",
    department: "Pediatrics",
    specialization: "Neonatology & Pediatric Critical Care",
    experience: 17,
    fees: 600,
    rating: 4.9,
    availableDays: ["Monday", "Tuesday", "Thursday", "Friday"],
    availableTimeSlots: ["09:00 AM", "10:00 AM", "11:00 AM", "01:30 PM", "02:30 PM", "04:00 PM"],
    imageUrl: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400",
    about: "Dr. Rohan has deep expertise in managing premature newborn complications and overseeing pediatric emergency rooms and vaccinations."
  },
  {
    id: "doc_13",
    name: "Dr. Shalini Verma",
    email: "shalini.verma@saveethamedicalcollege.com",
    department: "Pediatrics",
    specialization: "Pediatric Nutrition & Developmental Delay",
    experience: 10,
    fees: 550,
    rating: 4.7,
    availableDays: ["Wednesday", "Friday", "Saturday"],
    availableTimeSlots: ["10:30 AM", "11:30 AM", "12:30 PM", "02:30 PM", "03:30 PM", "05:00 PM"],
    imageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400",
    about: "Dr. Shalini is a compassionate pediatrician focused on childhood obesity solutions, nutritional counseling, and early growth marker checks."
  },

  // General Medicine
  {
    id: "doc_14",
    name: "Dr. Sanjay Dutt",
    email: "sanjay.dutt@saveethamedicalcollege.com",
    department: "General Medicine",
    specialization: "Infectious Diseases & Diabetes Management",
    experience: 25,
    fees: 500,
    rating: 4.9,
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    availableTimeSlots: ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"],
    imageUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400",
    about: "With 25 years of outstanding clinical experience, Dr. Sanjay Dutt is a trusted name for chronic diabetes, hypertension, and thyroid management."
  },
  {
    id: "doc_15",
    name: "Dr. Neha Kapoor",
    email: "neha.kapoor@saveethamedicalcollege.com",
    department: "General Medicine",
    specialization: "Internal Medicine & Wellness Care",
    experience: 7,
    fees: 400,
    rating: 4.6,
    availableDays: ["Monday", "Wednesday", "Saturday"],
    availableTimeSlots: ["10:00 AM", "11:30 AM", "01:00 PM", "03:00 PM", "04:30 PM"],
    imageUrl: "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=400",
    about: "Dr. Neha Kapoor specializes in preventive health check-ups, lifestyle disorders, general fevers, and medical fitness certifications."
  },

  // Add 5 more doctors to reach the target of 20!
  {
    id: "doc_16",
    name: "Dr. Robert Carter",
    email: "robert.carter@saveethamedicalcollege.com",
    department: "Neurology",
    specialization: "Spine & Neuromuscular Disorders",
    experience: 16,
    fees: 950,
    rating: 4.8,
    availableDays: ["Monday", "Tuesday", "Thursday"],
    availableTimeSlots: ["10:00 AM", "11:30 AM", "02:30 PM", "04:00 PM"],
    imageUrl: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400",
    about: "Dr. Carter manages nerve compressions, multiple sclerosis, muscular dystrophy, and performs electromyography diagnostics."
  },
  {
    id: "doc_17",
    name: "Dr. Snehal Bhatia",
    email: "snehal.bhatia@saveethamedicalcollege.com",
    department: "Dermatology",
    specialization: "Pediatric Dermatology & Eczema",
    experience: 12,
    fees: 600,
    rating: 4.7,
    availableDays: ["Monday", "Wednesday", "Friday"],
    availableTimeSlots: ["09:00 AM", "10:30 AM", "12:00 PM", "03:00 PM"],
    imageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400",
    about: "Dr. Bhatia specializes in childhood skin conditions, cradle cap, vascular birthmarks, and pediatric skin allergies."
  },
  {
    id: "doc_18",
    name: "Dr. Arvind Swamy",
    email: "arvind.swamy@saveethamedicalcollege.com",
    department: "General Medicine",
    specialization: "Geriatric Medicine & Palliative Care",
    experience: 23,
    fees: 650,
    rating: 4.9,
    availableDays: ["Monday", "Wednesday", "Thursday", "Friday"],
    availableTimeSlots: ["09:30 AM", "11:00 AM", "02:00 PM", "04:30 PM"],
    imageUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400",
    about: "Dr. Arvind provides highly focused care for elderly patients, covering age-related multiple joint aches, memory decline, and chronic medical support."
  },
  {
    id: "doc_19",
    name: "Dr. Emily Watson",
    email: "emily.watson@saveethamedicalcollege.com",
    department: "Orthopedics",
    specialization: "Sports Medicine & Arthroscopic Repairs",
    experience: 13,
    fees: 850,
    rating: 4.8,
    availableDays: ["Tuesday", "Thursday", "Saturday"],
    availableTimeSlots: ["10:00 AM", "11:30 AM", "01:00 PM", "03:00 PM", "05:00 PM"],
    imageUrl: "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=400",
    about: "Dr. Emily has served as lead physician for regional sports franchises, specializing in ACL tears, rotator cuff issues, and runner knee recovery."
  },
  {
    id: "doc_20",
    name: "Dr. Tarun Sen",
    email: "tarun.sen@saveethamedicalcollege.com",
    department: "Cardiology",
    specialization: "Preventive Cardiology & Imaging",
    experience: 10,
    fees: 700,
    rating: 4.7,
    availableDays: ["Monday", "Thursday", "Friday"],
    availableTimeSlots: ["09:00 AM", "10:30 AM", "02:00 PM", "03:30 PM"],
    imageUrl: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400",
    about: "Dr. Tarun is a specialist in 3D echocardiography, coronary calcium scoring, and building proactive cholesterol-reversing lifestyle plans."
  }
];

export const initialUsers = [
  { id: "usr_1", name: "Vinay Kumar", email: "vinay@gmail.com", role: "patient", gender: "Male", age: 24, phone: "9876543210" },
  { id: "usr_2", name: "Rahul Deshmukh", email: "rahul@gmail.com", role: "patient", gender: "Male", age: 34, phone: "9988776655" },
  { id: "usr_3", name: "Anjali Gupta", email: "anjali@gmail.com", role: "patient", gender: "Female", age: 29, phone: "9123456789" },
  { id: "doc_1", name: "Dr. Amit Verma", email: "amit.verma@saveethamedicalcollege.com", role: "doctor", docId: "doc_1" },
  { id: "doc_2", name: "Dr. Priya Deshmukh", email: "priya.deshmukh@saveethamedicalcollege.com", role: "doctor", docId: "doc_2" },
  { id: "usr_admin", name: "Admin Chief", email: "admin@gmail.com", role: "admin" }
];

export const initialAppointments = [
  {
    id: "app_1",
    patientId: "usr_1",
    patientName: "Vinay Kumar",
    doctorId: "doc_1",
    doctorName: "Dr. Amit Verma",
    department: "Cardiology",
    date: "2026-06-05",
    timeSlot: "10:00 AM",
    status: "Approved",
    symptoms: "Occasional chest tightness and shortness of breath during light jogging.",
    notes: "Patient is advised to bring prior reports.",
    createdAt: new Date("2026-05-28T09:00:00Z")
  },
  {
    id: "app_2",
    patientId: "usr_2",
    patientName: "Rahul Deshmukh",
    doctorId: "doc_4",
    doctorName: "Dr. Rajesh K. Sharma",
    department: "Orthopedics",
    date: "2026-06-03",
    timeSlot: "11:00 AM",
    status: "Pending",
    symptoms: "Chronic lower back pain radiating down to the left calf.",
    notes: "Requires posture correction examination.",
    createdAt: new Date("2026-05-30T14:30:00Z")
  },
  {
    id: "app_3",
    patientId: "usr_3",
    patientName: "Anjali Gupta",
    doctorId: "doc_10",
    doctorName: "Dr. Siddharth Roy",
    department: "Dermatology",
    date: "2026-06-04",
    timeSlot: "02:00 PM",
    status: "Approved",
    symptoms: "Severe red rashes on elbows and behind knees that itch heavily during summer.",
    notes: "",
    createdAt: new Date("2026-05-29T11:15:00Z")
  },
  {
    id: "app_4",
    patientId: "usr_1",
    patientName: "Vinay Kumar",
    doctorId: "doc_14",
    doctorName: "Dr. Sanjay Dutt",
    department: "General Medicine",
    date: "2026-05-28",
    timeSlot: "10:00 AM",
    status: "Completed",
    symptoms: "High fever (102 F) with dry cough and body chills for 3 days.",
    notes: "Recovered fully. Prescribed vitamins.",
    createdAt: new Date("2026-05-26T08:00:00Z")
  },
  {
    id: "app_5",
    patientId: "usr_2",
    patientName: "Rahul Deshmukh",
    doctorId: "doc_6",
    doctorName: "Dr. Sandeep Gupta",
    department: "ENT",
    date: "2026-06-06",
    timeSlot: "09:00 AM",
    status: "Rejected",
    symptoms: "Ear pain and partial block sensation in the right ear after swimming.",
    notes: "Doctor is unavailable on this date.",
    createdAt: new Date("2026-05-30T10:00:00Z")
  }
];

export const initialPrescriptions = [
  {
    id: "pres_1",
    appointmentId: "app_4",
    patientId: "usr_1",
    patientName: "Vinay Kumar",
    doctorId: "doc_14",
    doctorName: "Dr. Sanjay Dutt",
    date: "2026-05-28",
    diagnosis: "Seasonal Viral Influenza",
    symptoms: "High fever (102 F), dry cough, physical fatigue.",
    medicines: [
      { name: "Paracetamol 650mg", dosage: "1-0-1", duration: "5 Days", instructions: "Post Meals" },
      { name: "Amoxicillin 500mg", dosage: "1-1-1", duration: "5 Days", instructions: "Post Meals" },
      { name: "Cough Syrup (Ascoril)", dosage: "0-0-1", duration: "3 Days", instructions: "Before sleeping" }
    ],
    advice: "Complete bed rest for 3 days. Consume warm water. Keep hydration high by drinking coconut water or ORS."
  }
];

export const initialRecords = [
  {
    id: "rec_1",
    patientId: "usr_1",
    fileName: "blood_report_may2026.pdf",
    fileSize: "1.2 MB",
    uploadedAt: "2026-05-28",
    description: "Annual Routine Health Check-up Blood Panel"
  },
  {
    id: "rec_2",
    patientId: "usr_1",
    fileName: "ecg_scan.pdf",
    fileSize: "2.4 MB",
    uploadedAt: "2026-05-28",
    description: "ECG Cardiac Diagnostic Report"
  }
];

// Active state for zero-config in-memory operation
class MockStore {
  constructor() {
    this.users = [...initialUsers];
    this.doctors = [...doctors];
    this.appointments = [...initialAppointments];
    this.prescriptions = [...initialPrescriptions];
    this.records = [...initialRecords];
    this.notifications = [
      { id: "n_1", userId: "usr_1", title: "Appointment Confirmed", message: "Your appointment with Dr. Amit Verma is scheduled for 2026-06-05 at 10:00 AM.", read: false, createdAt: new Date() },
      { id: "n_2", userId: "usr_2", title: "Status Update", message: "Your booking with Dr. Sandeep Gupta was rejected due to schedule issues. Please choose another slot.", read: false, createdAt: new Date() }
    ];
  }

  // Auth Operations
  registerUser({ name, email, role, gender, age, phone, docId }) {
    const existing = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) return existing;

    const id = "usr_" + (this.users.length + 1);
    const newUser = { id, name, email, role, gender: gender || "Male", age: Number(age) || 30, phone: phone || "9999999999", docId };
    this.users.push(newUser);
    return newUser;
  }

  loginUser(email, role) {
    const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.role === role);
    return user || null;
  }

  // Appointment Operations with Smart Checks
  addAppointment({ patientId, patientName, doctorId, date, timeSlot, symptoms }) {
    const doctor = this.doctors.find(d => d.id === doctorId);
    if (!doctor) throw new Error("Doctor not found");

    // Overlap Prevention: Check if doctor has an appointment already booked at that date & time
    const overlapping = this.appointments.find(a => 
      a.doctorId === doctorId && 
      a.date === date && 
      a.timeSlot === timeSlot && 
      a.status !== "Rejected"
    );

    if (overlapping) {
      throw new Error("This time slot is already booked for this doctor. Please choose a different slot.");
    }

    const id = "app_" + (this.appointments.length + 1);
    const newAppointment = {
      id,
      patientId,
      patientName,
      doctorId,
      doctorName: doctor.name,
      department: doctor.department,
      date,
      timeSlot,
      status: "Pending",
      symptoms: symptoms || "No symptoms described.",
      notes: "",
      createdAt: new Date()
    };

    this.appointments.push(newAppointment);

    // Create Notification
    this.notifications.push({
      id: "n_" + (this.notifications.length + 1),
      userId: patientId,
      title: "New Appointment Request",
      message: `Your booking request for Dr. ${doctor.name} on ${date} at ${timeSlot} is pending approval.`,
      read: false,
      createdAt: new Date()
    });

    return newAppointment;
  }

  updateAppointmentStatus(appointmentId, status, notes) {
    const app = this.appointments.find(a => a.id === appointmentId);
    if (!app) throw new Error("Appointment not found");
    
    app.status = status;
    if (notes !== undefined) app.notes = notes;

    // Notify patient
    this.notifications.push({
      id: "n_" + (this.notifications.length + 1),
      userId: app.patientId,
      title: `Appointment ${status}`,
      message: `Your appointment with ${app.doctorName} on ${app.date} has been ${status.toLowerCase()}.${notes ? ' Note: ' + notes : ''}`,
      read: false,
      createdAt: new Date()
    });

    return app;
  }

  // Prescription Operations
  addPrescription({ appointmentId, patientId, patientName, doctorId, doctorName, diagnosis, symptoms, medicines, advice }) {
    const id = "pres_" + (this.prescriptions.length + 1);
    const date = new Date().toISOString().split('T')[0];

    const newPrescription = {
      id,
      appointmentId,
      patientId,
      patientName,
      doctorId,
      doctorName,
      date,
      diagnosis,
      symptoms,
      medicines,
      advice
    };

    this.prescriptions.push(newPrescription);

    // Update appointment status to completed
    this.updateAppointmentStatus(appointmentId, "Completed", "Digital Prescription Generated.");

    return newPrescription;
  }

  // Record upload mock
  addRecord({ patientId, fileName, fileSize, description }) {
    const id = "rec_" + (this.records.length + 1);
    const date = new Date().toISOString().split('T')[0];

    const newRecord = {
      id,
      patientId,
      fileName,
      fileSize: fileSize || "1.0 MB",
      uploadedAt: date,
      description: description || "Medical report upload"
    };

    this.records.push(newRecord);
    return newRecord;
  }

  deleteRecord(recordId) {
    this.records = this.records.filter(r => r.id !== recordId);
    return { success: true };
  }
}

export const mockDb = new MockStore();
