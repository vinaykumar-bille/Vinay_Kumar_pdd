import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../utils/api';
import {
  Heart, Calendar, Bot, ShieldCheck, Clock, ArrowRight, UserCheck,
  PhoneCall, CheckCircle, Users, Search, Star, Video, MapPin, Sparkles,
  Smartphone, ChevronRight, HelpCircle, X, Stethoscope, Activity, Check
} from 'lucide-react';
import { getDepartmentIcon } from '../utils/departmentIcons';

export const LandingPage = () => {
  const [stats, setStats] = useState({
    doctors: 8,
    specializations: 10,
    appointments: 42,
    clinics: 2
  });
  const [doctorsList, setDoctorsList] = useState([]);
  const [specializationsList, setSpecializationsList] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState('ALL');
  const [searchDoctorQuery, setSearchDoctorQuery] = useState('');
  const [consultationModeFilter, setConsultationModeFilter] = useState('ALL');

  // Booking Modal State
  const [bookingModalDoctor, setBookingModalDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('2026-10-20');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [bookingMode, setBookingMode] = useState('IN_PERSON');
  const [bookingReason, setBookingReason] = useState('Initial consultation');
  const [bookingPatientName, setBookingPatientName] = useState('Vinay Kumar');
  const [bookingPatientEmail, setBookingPatientEmail] = useState('vinay@gmail.com');
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // Floating AI Assistant Modal State
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiSymptomsInput, setAiSymptomsInput] = useState('');
  const [aiTriageResult, setAiTriageResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [docs, specs, overview] = await Promise.all([
          api.doctors.getAll(),
          api.specializations.getAll(),
          api.analytics.getOverview()
        ]);
        setDoctorsList(docs);
        setSpecializationsList(specs);
        if (overview) {
          setStats({
            doctors: overview.totalDoctors || docs.length || 8,
            specializations: specs.length || 10,
            appointments: overview.totalAppointments || 42,
            clinics: overview.totalClinics || 2
          });
        }
      } catch (err) {
        console.error("Failed to load landing data:", err);
      }
    };
    fetchInitialData();
  }, []);

  // When booking modal opens or date changes, load slots from backend
  useEffect(() => {
    if (bookingModalDoctor && selectedDate) {
      const fetchSlots = async () => {
        try {
          const res = await api.doctors.getAvailability(bookingModalDoctor.id, selectedDate);
          if (res && res.slots) {
            setAvailableSlots(res.slots);
            const firstAvailable = res.slots.find(s => s.available);
            if (firstAvailable) setSelectedSlot(firstAvailable.time);
          }
        } catch (err) {
          console.error("Error loading slots:", err);
        }
      };
      fetchSlots();
    }
  }, [bookingModalDoctor, selectedDate]);

  // Execute Appointment Booking from Landing Page Modal
  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!selectedSlot) {
      alert("Please choose an available time slot.");
      return;
    }
    setBookingLoading(true);
    try {
      const res = await api.appointments.create({
        patientId: 'usr_pat_1',
        patientName: bookingPatientName,
        doctorId: bookingModalDoctor.id,
        appointmentDate: selectedDate,
        startTime: selectedSlot,
        consultationType: bookingMode,
        reasonForVisit: bookingReason
      });
      setBookingSuccess(res);
    } catch (err) {
      alert(err.message || "Failed to book appointment. Please try another slot.");
    } finally {
      setBookingLoading(false);
    }
  };

  // Run AI Specialty Triage
  const handleRunAiTriage = async (e) => {
    e.preventDefault();
    if (!aiSymptomsInput.trim()) return;
    setAiLoading(true);
    try {
      const res = await api.ai.specialtyGuidance(aiSymptomsInput);
      setAiTriageResult(res);
    } catch (err) {
      alert("AI Assistant temporarily unavailable.");
    } finally {
      setAiLoading(false);
    }
  };

  // Filtered Doctors List
  const filteredDoctors = doctorsList.filter(doc => {
    const matchesQuery = !searchDoctorQuery.trim() ||
      doc.name.toLowerCase().includes(searchDoctorQuery.toLowerCase()) ||
      doc.specialization.toLowerCase().includes(searchDoctorQuery.toLowerCase()) ||
      doc.clinicName.toLowerCase().includes(searchDoctorQuery.toLowerCase());

    const matchesSpecialty = selectedSpecialty === 'ALL' ||
      doc.specialization.toLowerCase() === selectedSpecialty.toLowerCase() ||
      doc.department.toLowerCase() === selectedSpecialty.toLowerCase();

    const matchesMode = consultationModeFilter === 'ALL' ||
      (doc.consultationModes || []).includes(consultationModeFilter);

    return matchesQuery && matchesSpecialty && matchesMode;
  });

  const faqs = [
    {
      q: "How does real-time slot checking prevent double booking?",
      a: "MediBook AI employs atomic backend slot reservation. When a patient chooses a time slot, the engine locks the physician's schedule. If another user attempts to book the same slot concurrently, the server immediately returns a conflict notice and prompts them to pick an adjacent available time."
    },
    {
      q: "What is the difference between In-Person and Video Teleconsultations?",
      a: "In-Person consultations take place at our participating clinics with physical examination. Video Teleconsultations are conducted via our encrypted, browser-based WebRTC video room with integrated clinical notes and digital prescription generation."
    },
    {
      q: "Can I reschedule or cancel my booked appointment?",
      a: "Yes. Patients and clinic staff can reschedule or cancel appointments up to 2 hours before the scheduled time through the Patient Dashboard or Receptionist Desk, with a recorded reason."
    },
    {
      q: "How does the AI Doctor Recommendation & Specialty Guidance work?",
      a: "MediBook AI features an explainable clinical decision-support engine. When you describe your symptoms, the model analyzes keywords to guide you toward the relevant clinical department (e.g. Cardiology for chest discomfort) with appropriate safety disclaimers."
    },
    {
      q: "Does the mobile application share the same database as the website?",
      a: "Yes! Both our responsive Web Application and our Expo React Native Mobile Application communicate with the exact same REST API backend, guaranteeing synchronized appointments, prescriptions, and real-time notifications."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <header className="relative bg-white overflow-hidden border-b border-slate-200/80 pt-16 pb-20 lg:pt-24 lg:pb-32">
        {/* Subtle Decorative Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-blue-50/60 to-transparent -z-10 pointer-events-none"></div>
        <div className="absolute top-10 right-10 w-96 h-96 bg-teal-100/30 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-50 border border-blue-200/80 rounded-full text-xs font-bold text-blue-700 tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Next-Gen Healthcare Scheduling & AI Teleconsultation</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
              Your Health. <br />
              <span className="bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                Your Time. Your Doctor.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl font-normal">
              Discover trusted doctors, check real-time availability, and book appointments online through one convenient healthcare platform. Fully integrated across web and mobile.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap gap-3.5 pt-2">
              <a
                href="#search-doctors"
                className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 transition flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                <span>Find a Doctor</span>
              </a>

              <Link
                to="/register"
                className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-sm shadow-sm transition flex items-center gap-2"
              >
                <Calendar className="w-4 h-4 text-teal-400" />
                <span>Book an Appointment</span>
              </Link>

              <a
                href="#mobile-app"
                className="px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-sm transition flex items-center gap-2"
              >
                <Smartphone className="w-4 h-4 text-slate-600" />
                <span>Mobile App</span>
              </a>
            </div>

            {/* Micro Highlights */}
            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-teal-600" />
                Instant Slot Confirmation
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-teal-600" />
                Zero Double-Booking Guarantee
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-teal-600" />
                HD WebRTC Telehealth
              </span>
            </div>
          </div>

          {/* Hero Right Visual Banner */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-2xl bg-white p-3">
              <img
                src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800"
                alt="Doctor with digital tablet"
                className="w-full h-80 sm:h-96 object-cover rounded-2xl"
              />

              {/* Floating Verified Badge */}
              <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200/90 shadow-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">Verified Medical Specialists</h4>
                    <p className="text-[11px] text-slate-500">Board-certified clinical credentials</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  ACTIVE
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Real-time Analytics Statistics Counter */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10 w-full">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-lg grid grid-cols-2 lg:grid-cols-4 gap-6 p-6 sm:p-8">
          <div className="flex items-center gap-4 justify-center sm:justify-start">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{stats.doctors}</div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Registered Doctors</p>
            </div>
          </div>

          <div className="flex items-center gap-4 justify-center sm:justify-start">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{stats.specializations}+</div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Specialties</p>
            </div>
          </div>

          <div className="flex items-center gap-4 justify-center sm:justify-start">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{stats.appointments}</div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Appointments Booked</p>
            </div>
          </div>

          <div className="flex items-center gap-4 justify-center sm:justify-start">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{stats.clinics}</div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Partner Clinics</p>
            </div>
          </div>
        </div>
      </section>

      {/* Doctor Search & Discovery Module */}
      <section id="search-doctors" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
            <Search className="w-3.5 h-3.5" />
            Real-Time Doctor Catalog
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            Find the Right Specialist for You
          </h2>
          <p className="text-sm text-slate-500">
            Search top-rated physicians, verify qualifications and experience, and view live appointment availability.
          </p>
        </div>

        {/* Search Bar & Mode Selector */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="Search by physician name, specialty, or clinic..."
              value={searchDoctorQuery}
              onChange={(e) => setSearchDoctorQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={consultationModeFilter}
              onChange={(e) => setConsultationModeFilter(e.target.value)}
              className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Consultation Modes</option>
              <option value="IN_PERSON">In-Person Clinic</option>
              <option value="VIDEO">Video Teleconsultation</option>
            </select>

            <button
              onClick={() => setShowAiModal(true)}
              className="px-4 py-3 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-2xl text-sm font-bold shadow-sm transition flex items-center gap-2 whitespace-nowrap"
            >
              <Bot className="w-4 h-4" />
              <span>AI Triage Matcher</span>
            </button>
          </div>
        </div>

        {/* Specialty Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedSpecialty('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              selectedSpecialty === 'ALL'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            All Specialties
          </button>
          {specializationsList.map((spec) => (
            <button
              key={spec.id}
              onClick={() => setSelectedSpecialty(spec.name)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                selectedSpecialty === spec.name
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {getDepartmentIcon(spec.name, "w-3.5 h-3.5")}
              <span>{spec.name}</span>
            </button>
          ))}
        </div>

        {/* Doctors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition p-6 flex flex-col justify-between space-y-5"
            >
              <div>
                <div className="flex items-start gap-4">
                  <img
                    src={doc.imageUrl}
                    alt={doc.name}
                    className="w-20 h-20 rounded-2xl object-cover border border-slate-100 shadow-xs flex-shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-1 text-amber-500 text-xs font-bold mb-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{doc.rating}</span>
                      <span className="text-slate-400 font-normal">({doc.reviewCount || 12})</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{doc.name}</h3>
                    <p className="text-xs font-semibold text-blue-600">{doc.specialization}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{doc.qualifications}</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Experience:</span>
                    <span className="font-semibold text-slate-700">{doc.experienceYears} Years</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Consultation Fee:</span>
                    <span className="font-bold text-slate-900">₹{doc.consultationFee}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Clinic:</span>
                    <span className="font-medium text-slate-700 truncate max-w-[180px]">{doc.clinicName}</span>
                  </div>
                </div>

                {/* Consultation Modes Badges */}
                <div className="mt-3 flex items-center gap-2">
                  {(doc.consultationModes || []).includes('IN_PERSON') && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <MapPin className="w-3 h-3" /> In-Person
                    </span>
                  )}
                  {(doc.consultationModes || []).includes('VIDEO') && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                      <Video className="w-3 h-3" /> Telehealth Video
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    setBookingModalDoctor(doc);
                    setBookingSuccess(null);
                  }}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center justify-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Check Availability & Book</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Workflow Timeline */}
      <section id="how-it-works" className="py-20 bg-slate-900 text-white border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-blue-400 font-extrabold text-xs uppercase tracking-widest">
              Seamless Patient Journey
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              How Appointment Booking Works
            </h2>
            <p className="text-sm text-slate-400">
              From discovering top specialists to post-consultation prescription downloads in 8 simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Patient Registration", desc: "Create your free digital patient record with basic history." },
              { step: "02", title: "Doctor Search", desc: "Filter by specialty, clinic, fee, or let AI guide your triage." },
              { step: "03", title: "Profile Review", desc: "Inspect verified qualifications, clinical experience, and ratings." },
              { step: "04", title: "Slot Selection", desc: "Choose your date and select from real-time backend slots." },
              { step: "05", title: "Instant Confirmation", desc: "Receive immediate booking confirmation and reference number." },
              { step: "06", title: "Smart Notification", desc: "In-app and SMS reminders keep you synchronized on web & mobile." },
              { step: "07", title: "Consultation", desc: "Visit the clinic in person or launch secure WebRTC video room." },
              { step: "08", title: "Digital Prescription", desc: "Download doctor recommendations and dosage schedules anytime." }
            ].map((item, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-left space-y-2.5">
                <div className="text-blue-400 font-mono font-bold text-sm tracking-widest">{item.step}</div>
                <h3 className="text-base font-bold text-white">{item.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Web & Mobile Synchronization Showcase */}
      <section id="mobile-app" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-gradient-to-tr from-blue-900 to-slate-900 rounded-3xl p-8 sm:p-12 text-white border border-blue-800/50 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-5 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30">
              <Smartphone className="w-3.5 h-3.5 text-teal-400" />
              <span>Native iOS & Android Mobile Application</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
              Book Smarter on the Go With MediBook AI Mobile
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
              Built on React Native and Expo, our mobile app connects directly to the same backend. Bookings made on mobile instantly reflect on the web dashboard and vice versa!
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2 text-xs text-slate-200">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-teal-400 flex-shrink-0" />
                <span>Native Slot Picker & Calendar</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-teal-400 flex-shrink-0" />
                <span>Expo Push Reminders</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-teal-400 flex-shrink-0" />
                <span>SecureStore Credential Safety</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-teal-400 flex-shrink-0" />
                <span>Prescriptions & Vitals Viewer</span>
              </div>
            </div>

            <div className="pt-4 flex items-center gap-3">
              <span className="px-4 py-2.5 bg-white text-slate-900 font-bold text-xs rounded-xl shadow-sm">
                Expo Development Build Ready
              </span>
              <span className="px-4 py-2.5 bg-blue-800/50 border border-blue-700 text-white font-semibold text-xs rounded-xl">
                EAS Configured for Android & iOS
              </span>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center">
            <div className="w-64 bg-slate-950 p-4 rounded-[40px] border-4 border-slate-700 shadow-2xl text-center space-y-4">
              <div className="w-20 h-4 bg-slate-800 rounded-full mx-auto"></div>
              <div className="p-4 bg-slate-900 rounded-2xl text-left space-y-2 border border-slate-800">
                <span className="text-[10px] text-teal-400 font-bold uppercase">Upcoming Slot</span>
                <h4 className="text-xs font-bold text-white">Dr. Amit Verma</h4>
                <p className="text-[10px] text-slate-400">Cardiology • 20 Oct, 10:00 AM</p>
                <div className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-[9px] font-bold rounded-md inline-block">
                  CONFIRMED
                </div>
              </div>
              <p className="text-[11px] text-slate-400">Real-time sync with Web Dashboard</p>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-8">
        <div className="text-center space-y-3">
          <span className="text-blue-600 font-extrabold text-xs uppercase tracking-widest">
            Got Questions?
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs transition"
            >
              <button
                onClick={() => setOpenFaqIndex(openFaqIndex === idx ? -1 : idx)}
                className="w-full p-5 text-left font-bold text-sm text-slate-900 flex items-center justify-between gap-4"
              >
                <span>{faq.q}</span>
                <span className="text-blue-600 font-bold text-lg">
                  {openFaqIndex === idx ? '−' : '+'}
                </span>
              </button>
              {openFaqIndex === idx && (
                <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Appointment Booking Modal */}
      {bookingModalDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-8">
            <button
              onClick={() => setBookingModalDoctor(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 font-bold"
            >
              ✕
            </button>

            {bookingSuccess ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-2xl font-bold">
                  ✓
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Appointment Confirmed!</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Your appointment with <strong>{bookingSuccess.doctorName}</strong> on <strong>{bookingSuccess.appointmentDate}</strong> at <strong>{bookingSuccess.startTime}</strong> is locked.
                </p>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-1 text-xs">
                  <div><strong>Reference ID:</strong> <span className="font-mono text-blue-600 font-bold">{bookingSuccess.appointmentNumber}</span></div>
                  <div><strong>Consultation Mode:</strong> {bookingSuccess.consultationType}</div>
                  <div><strong>Clinic:</strong> {bookingSuccess.clinicName}</div>
                </div>
                <div className="pt-2">
                  <Link
                    to="/patient-dashboard"
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold block transition"
                  >
                    View in Patient Dashboard →
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleConfirmBooking} className="space-y-4 text-left">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                  <img src={bookingModalDoctor.imageUrl} alt={bookingModalDoctor.name} className="w-12 h-12 rounded-xl object-cover" />
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{bookingModalDoctor.name}</h3>
                    <p className="text-xs text-blue-600 font-semibold">{bookingModalDoctor.specialization} • Fee: ₹{bookingModalDoctor.consultationFee}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Select Date</label>
                    <input
                      type="date"
                      required
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Consultation Mode</label>
                    <select
                      value={bookingMode}
                      onChange={(e) => setBookingMode(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                    >
                      <option value="IN_PERSON">In-Person Clinic Visit</option>
                      <option value="VIDEO">Telehealth Video Call</option>
                    </select>
                  </div>
                </div>

                {/* Available Slots */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Available Slots on {selectedDate}
                  </label>
                  {availableSlots.length === 0 ? (
                    <p className="text-xs text-amber-600 p-3 bg-amber-50 rounded-xl">
                      Doctor is not scheduled on this day. Please pick another date.
                    </p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 max-h-36 overflow-y-auto pr-1">
                      {availableSlots.map((slot, i) => (
                        <button
                          key={i}
                          type="button"
                          disabled={!slot.available}
                          onClick={() => setSelectedSlot(slot.time)}
                          className={`py-2 px-2 rounded-xl text-xs font-semibold transition ${
                            !slot.available
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed line-through'
                              : selectedSlot === slot.time
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Reason for Visit</label>
                  <input
                    type="text"
                    required
                    value={bookingReason}
                    onChange={(e) => setBookingReason(e.target.value)}
                    placeholder="e.g. Health checkup, symptom review"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={bookingLoading || !selectedSlot}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-md transition"
                  >
                    {bookingLoading ? 'Reserving Slot...' : `Confirm Booking with ${bookingModalDoctor.name}`}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Floating AI Symptom Triage Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setShowAiModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 font-bold"
            >
              ✕
            </button>

            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">AI Clinical Specialty Assistant</h3>
                <p className="text-xs text-slate-500">Non-diagnostic symptom-to-department matching</p>
              </div>
            </div>

            <form onSubmit={handleRunAiTriage} className="mt-4 space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Describe your symptoms</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. I have persistent lower back pain radiating down my left leg when walking..."
                  value={aiSymptomsInput}
                  onChange={(e) => setAiSymptomsInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <button
                type="submit"
                disabled={aiLoading}
                className="w-full py-2.5 bg-gradient-to-r from-teal-600 to-blue-600 text-white font-bold text-xs rounded-xl shadow-sm transition"
              >
                {aiLoading ? 'Analyzing Clinical Keywords...' : 'Analyze Symptoms & Match Specialist'}
              </button>
            </form>

            {aiTriageResult && (
              <div className="mt-4 p-4 rounded-2xl bg-teal-50/70 border border-teal-200 text-left space-y-2 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-teal-800 uppercase">Recommended Specialty</span>
                  <span className="px-2 py-0.5 rounded-full bg-teal-200 text-teal-900 font-bold text-[10px]">
                    {Math.round(aiTriageResult.confidence * 100)}% Confidence
                  </span>
                </div>
                <h4 className="text-base font-extrabold text-teal-950">{aiTriageResult.recommendedDepartment}</h4>
                <p className="text-xs text-teal-800 leading-relaxed">{aiTriageResult.triageSummary}</p>
                <div className="text-[10px] text-teal-700 font-medium pt-1 border-t border-teal-200/60">
                  {aiTriageResult.disclaimer}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating AI Chatbot Launcher Icon */}
      <button
        onClick={() => setShowAiModal(true)}
        className="fixed bottom-6 right-6 z-40 p-4 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-full shadow-2xl hover:scale-105 active:scale-95 transition flex items-center gap-2 group border-2 border-white"
        title="Open AI Symptom Assistant"
      >
        <Bot className="w-6 h-6 animate-pulse" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 text-xs font-bold whitespace-nowrap">
          AI Triage Assistant
        </span>
      </button>

      <Footer />
    </div>
  );
};

export default LandingPage;
