import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import {
  Heart, Calendar, Bot, ShieldCheck, Clock, ArrowRight, UserCheck,
  PhoneCall, CheckCircle, Users, Search, Video, MapPin, Sparkles,
  Smartphone, ChevronRight, HelpCircle, X, Stethoscope, Activity, Check,
  User, Award
} from 'lucide-react';
import { getDepartmentIcon } from '../utils/departmentIcons';

export const LandingPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const todayStr = new Date().toISOString().split('T')[0];

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
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [bookingMode, setBookingMode] = useState('IN_PERSON');
  const [bookingReason, setBookingReason] = useState('General Consultation');
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

  // Handle open booking modal with authentication check
  const handleOpenBookingModal = (doc) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { returnUrl: '/', message: 'Please sign in to schedule an appointment.' } });
      return;
    }
    setBookingModalDoctor(doc);
    setSelectedDate(todayStr);
    setBookingSuccess(null);
  };

  // Execute Appointment Booking with Authenticated Session
  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!isAuthenticated || !user) {
      alert("Please sign in to book your appointment.");
      navigate('/login');
      return;
    }
    if (!selectedSlot) {
      alert("Please choose an available time slot.");
      return;
    }
    setBookingLoading(true);
    try {
      const res = await api.appointments.create({
        patientId: user.id,
        patientName: user.name,
        doctorId: bookingModalDoctor.id,
        appointmentDate: selectedDate,
        startTime: selectedSlot,
        consultationType: bookingMode,
        reasonForVisit: bookingReason
      });
      setBookingSuccess(res);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "Failed to book appointment. Please try another slot.";
      alert(msg);
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
      a: "MediFlow AI employs atomic backend slot reservation. When a patient chooses a time slot, the engine locks the physician's schedule. If another user attempts to book the same slot concurrently, the server immediately returns a conflict notice and prompts them to pick an adjacent available time."
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
      a: "MediFlow AI features an explainable clinical decision-support engine. When you describe your symptoms, the model analyzes keywords to guide you toward the relevant clinical department (e.g. Cardiology for chest discomfort) with appropriate safety disclaimers."
    },
    {
      q: "Does the mobile application share the same database as the website?",
      a: "Yes. Both our responsive Web Application and our Expo React Native Mobile Application communicate with the exact same REST API backend, guaranteeing synchronized appointments, prescriptions, and real-time notifications."
    }
  ];

  return (
    <div className="min-h-screen bg-[#F5F7F9] flex flex-col justify-between selection:bg-[#087F8C] selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <header className="relative bg-white border-b border-slate-200 pt-14 pb-16 lg:pt-20 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 border border-slate-200 rounded-md text-xs font-semibold text-[#15324F]">
              <ShieldCheck className="w-4 h-4 text-[#087F8C]" />
              <span>Verified Clinical Practitioners • Synchronized Web & Mobile</span>
            </div>

            {/* Primary Required Headline */}
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#15324F] leading-tight">
              Find Doctors and Book Appointments Online
            </h1>

            {/* Primary Required Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl font-normal">
              Search doctors by specialization and availability, schedule consultations, and manage appointments from one secure platform.
            </p>

            {/* Primary Action Buttons (Rectangular, 6-8px border radius, clear CTAs) */}
            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href="#search-doctors"
                className="px-5 py-3 bg-[#087F8C] hover:bg-[#076f7a] text-white rounded-lg font-semibold text-sm shadow-xs transition flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                <span>Find a Doctor</span>
              </a>

              <Link
                to={isAuthenticated ? "/patient-dashboard" : "/login"}
                className="px-5 py-3 bg-[#15324F] hover:bg-[#1c3f63] text-white rounded-lg font-semibold text-sm shadow-xs transition flex items-center gap-2"
              >
                <Calendar className="w-4 h-4 text-[#087F8C]" />
                <span>View My Appointments</span>
              </Link>

              {!isAuthenticated && (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-semibold text-sm transition"
                  >
                    Sign In
                  </Link>

                  <Link
                    to="/register"
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold text-sm transition"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>

            {/* Functional Highlights */}
            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-600 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-[#087F8C]" />
                Real-Time Backend Slots
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-[#087F8C]" />
                Double-Booking Prevention
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-[#087F8C]" />
                Encrypted Telehealth Consultations
              </span>
            </div>
          </div>

          {/* Hero Right Visual Banner */}
          <div className="lg:col-span-5 relative">
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-white p-2">
              <img
                src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800"
                alt="Doctor with digital tablet"
                className="w-full h-80 sm:h-96 object-cover rounded-xl"
              />

              <div className="mt-2 p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-[#15324F] text-[#087F8C] flex items-center justify-center font-bold">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">Verified Medical Specialists</h4>
                    <p className="text-[11px] text-slate-500">Board-certified credentials and active schedules</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  ACTIVE
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Honest Functional Platform Overview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10 w-full">
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs grid grid-cols-2 lg:grid-cols-4 gap-6 p-6">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-lg bg-slate-100 text-[#15324F] flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-[#087F8C]" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{stats.doctors}</div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Verified Doctors</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-lg bg-slate-100 text-[#15324F] flex items-center justify-center">
              <Activity className="w-5 h-5 text-[#087F8C]" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{stats.specializations}</div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Clinical Specialties</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-lg bg-slate-100 text-[#15324F] flex items-center justify-center">
              <Calendar className="w-5 h-5 text-[#087F8C]" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{stats.appointments}</div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Bookings</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-lg bg-slate-100 text-[#15324F] flex items-center justify-center">
              <MapPin className="w-5 h-5 text-[#087F8C]" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{stats.clinics}</div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hospital Centers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Doctor Search & Discovery Module */}
      <section id="search-doctors" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-6">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <h2 className="text-3xl font-bold text-[#15324F]">
            Find the Right Specialist for You
          </h2>
          <p className="text-sm text-slate-600">
            Search verified physicians by specialty, review clinical qualifications and experience, and view live appointment availability.
          </p>
        </div>

        {/* Search Bar & Mode Selector */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search by physician name, specialty, or clinic..."
              value={searchDoctorQuery}
              onChange={(e) => setSearchDoctorQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#F5F7F9] border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#087F8C]"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={consultationModeFilter}
              onChange={(e) => setConsultationModeFilter(e.target.value)}
              className="px-3 py-2.5 bg-[#F5F7F9] border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#087F8C]"
            >
              <option value="ALL">All Consultation Modes</option>
              <option value="IN_PERSON">In-Person Clinic</option>
              <option value="VIDEO">Video Teleconsultation</option>
            </select>

            <button
              onClick={() => setShowAiModal(true)}
              className="px-4 py-2.5 bg-[#15324F] hover:bg-[#1c3f63] text-white rounded-lg text-sm font-semibold shadow-xs transition flex items-center gap-2 whitespace-nowrap"
            >
              <Bot className="w-4 h-4 text-[#087F8C]" />
              <span>Symptom Triage</span>
            </button>
          </div>
        </div>

        {/* Specialties Filter Horizontal Scroll */}
        <div className="flex items-center gap-2 overflow-x-auto py-2 no-scrollbar">
          <button
            onClick={() => setSelectedSpecialty('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              selectedSpecialty === 'ALL'
                ? 'bg-[#15324F] text-white'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            All Specialties
          </button>
          {specializationsList.map(spec => (
            <button
              key={spec.id}
              onClick={() => setSelectedSpecialty(spec.name)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                selectedSpecialty.toLowerCase() === spec.name.toLowerCase()
                  ? 'bg-[#15324F] text-white'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {spec.name}
            </button>
          ))}
        </div>

        {/* Doctors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {filteredDoctors.map(doc => (
            <div
              key={doc.id}
              className="bg-white rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs transition p-5 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start gap-4">
                  <img
                    src={doc.imageUrl}
                    alt={doc.name}
                    className="w-18 h-18 rounded-lg object-cover border border-slate-200 flex-shrink-0"
                  />
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{doc.name}</h3>
                    <p className="text-xs font-semibold text-[#087F8C]">{doc.specialization}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{doc.qualifications}</p>
                    <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded bg-slate-100 text-[10px] font-semibold text-slate-700">
                      <Award className="w-3 h-3 text-[#087F8C]" />
                      <span>{doc.experienceYears} Years Experience</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Department:</span>
                    <span className="font-semibold text-slate-800">{doc.department}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Consultation Fee:</span>
                    <span className="font-bold text-slate-900">₹{doc.consultationFee}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Clinic:</span>
                    <span className="font-medium text-slate-700 truncate max-w-[180px]">{doc.clinicName}</span>
                  </div>
                </div>

                {/* Consultation Modes Badges */}
                <div className="mt-3 flex items-center gap-2">
                  {(doc.consultationModes || []).includes('IN_PERSON') && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <MapPin className="w-3 h-3" /> In-Person
                    </span>
                  )}
                  {(doc.consultationModes || []).includes('VIDEO') && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                      <Video className="w-3 h-3" /> Telehealth Video
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => handleOpenBookingModal(doc)}
                  className="w-full py-2.5 bg-[#087F8C] hover:bg-[#076f7a] text-white rounded-lg text-xs font-semibold shadow-2xs transition flex items-center justify-center gap-1.5"
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
      <section id="how-it-works" className="py-16 bg-[#15324F] text-white border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-3xl font-bold text-white">
              How Appointment Booking Works
            </h2>
            <p className="text-sm text-slate-300">
              From finding specialists to post-consultation digital prescriptions in transparent, verifiable steps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { step: "01", title: "User Registration", desc: "Create your personal account to securely manage consultation history." },
              { step: "02", title: "Doctor Search", desc: "Filter by specialty, clinic, fee, or use AI symptom triage." },
              { step: "03", title: "Verified Credentials", desc: "Inspect clinical qualifications, certifications, and experience." },
              { step: "04", title: "Slot Selection", desc: "Choose your date and select from live backend calendar slots." },
              { step: "05", title: "Instant Confirmation", desc: "Receive immediate booking confirmation and reference number." },
              { step: "06", title: "Smart Notification", desc: "In-app alerts keep you informed across web and mobile." },
              { step: "07", title: "Consultation", desc: "Attend the clinic in person or join the encrypted WebRTC video room." },
              { step: "08", title: "Digital Prescription", desc: "Access official doctor advice and medication schedules anytime." }
            ].map((item, idx) => (
              <div key={idx} className="p-5 rounded-xl bg-slate-800/80 border border-slate-700 text-left space-y-2">
                <div className="text-[#087F8C] font-mono font-bold text-xs tracking-wider">{item.step}</div>
                <h3 className="text-sm font-bold text-white">{item.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Web & Mobile Synchronization Showcase */}
      <section id="mobile-app" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-[#15324F] rounded-2xl p-8 sm:p-10 text-white border border-slate-700 shadow-md grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-400/30">
              <Smartphone className="w-3.5 h-3.5 text-teal-400" />
              <span>Native iOS & Android Mobile Application</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
              MediFlow AI Mobile Application
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
              Built on React Native and Expo, our mobile app connects directly to the same backend. Bookings made on mobile instantly reflect on the web dashboard and vice versa.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-slate-200">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#087F8C] flex-shrink-0" />
                <span>Live Slot Calendar</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#087F8C] flex-shrink-0" />
                <span>Push Notifications</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#087F8C] flex-shrink-0" />
                <span>Encrypted JWT Sessions</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#087F8C] flex-shrink-0" />
                <span>Digital Prescriptions & Vitals</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center">
            <div className="w-64 bg-slate-900 p-4 rounded-3xl border-2 border-slate-700 shadow-xl text-center space-y-3">
              <div className="p-4 bg-slate-800 rounded-xl text-left space-y-2 border border-slate-700">
                <span className="text-[10px] text-teal-400 font-bold uppercase">Upcoming Appointment</span>
                <h4 className="text-xs font-bold text-white">Dr. Amit Verma</h4>
                <p className="text-[10px] text-slate-300">Cardiology • Saveetha Medical Center</p>
                <div className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[9px] font-bold rounded inline-block">
                  CONFIRMED
                </div>
              </div>
              <p className="text-[11px] text-slate-400">Synchronized with Web Platform</p>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="py-14 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#15324F]">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs transition"
            >
              <button
                onClick={() => setOpenFaqIndex(openFaqIndex === idx ? -1 : idx)}
                className="w-full p-4 text-left font-bold text-sm text-slate-900 flex items-center justify-between gap-4"
              >
                <span>{faq.q}</span>
                <span className="text-[#087F8C] font-bold text-lg">
                  {openFaqIndex === idx ? '−' : '+'}
                </span>
              </button>
              {openFaqIndex === idx && (
                <div className="px-4 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Appointment Booking Modal */}
      {bookingModalDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 relative my-8">
            <button
              onClick={() => setBookingModalDoctor(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 font-bold"
            >
              <X className="w-5 h-5" />
            </button>

            {bookingSuccess ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-xl font-bold">
                  ✓
                </div>
                <h3 className="text-xl font-bold text-slate-900">Appointment Confirmed</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Your consultation with <strong>{bookingSuccess.doctorName}</strong> on <strong>{bookingSuccess.appointmentDate}</strong> at <strong>{bookingSuccess.startTime}</strong> is confirmed.
                </p>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left space-y-1 text-xs">
                  <div><strong>Reference Number:</strong> <span className="font-mono text-[#087F8C] font-bold">{bookingSuccess.appointmentNumber}</span></div>
                  <div><strong>Consultation Mode:</strong> {bookingSuccess.consultationType}</div>
                  <div><strong>Clinic:</strong> {bookingSuccess.clinicName}</div>
                </div>
                <div className="pt-2">
                  <Link
                    to="/patient-dashboard"
                    className="w-full py-2.5 bg-[#087F8C] hover:bg-[#076f7a] text-white rounded-lg text-xs font-semibold block transition text-center"
                  >
                    View in Patient Dashboard →
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleConfirmBooking} className="space-y-4 text-left">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
                  <img src={bookingModalDoctor.imageUrl} alt={bookingModalDoctor.name} className="w-12 h-12 rounded-lg object-cover" />
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{bookingModalDoctor.name}</h3>
                    <p className="text-xs text-[#087F8C] font-semibold">{bookingModalDoctor.specialization} • Fee: ₹{bookingModalDoctor.consultationFee}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Select Date</label>
                    <input
                      type="date"
                      required
                      min={todayStr}
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Consultation Mode</label>
                    <select
                      value={bookingMode}
                      onChange={(e) => setBookingMode(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
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
                    <p className="text-xs text-amber-700 p-3 bg-amber-50 rounded-lg border border-amber-200">
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
                          className={`py-2 px-2 rounded-lg text-xs font-semibold transition ${
                            !slot.available
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed line-through'
                              : selectedSlot === slot.time
                              ? 'bg-[#087F8C] text-white shadow-xs'
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
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={bookingLoading || !selectedSlot}
                    className="w-full py-2.5 bg-[#087F8C] hover:bg-[#076f7a] disabled:opacity-50 text-white font-semibold rounded-lg text-xs shadow-xs transition"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 relative">
            <button
              onClick={() => setShowAiModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 font-bold"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-200">
              <div className="w-10 h-10 rounded-lg bg-[#15324F] text-white flex items-center justify-center font-bold">
                <Bot className="w-5 h-5 text-[#087F8C]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">AI Specialty Triage</h3>
                <p className="text-xs text-slate-500">Non-diagnostic clinical department guidance</p>
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
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#087F8C]"
                />
              </div>

              <button
                type="submit"
                disabled={aiLoading}
                className="w-full py-2 bg-[#087F8C] hover:bg-[#076f7a] text-white font-semibold text-xs rounded-lg shadow-xs transition"
              >
                {aiLoading ? 'Analyzing Clinical Keywords...' : 'Analyze Symptoms & Match Specialist'}
              </button>
            </form>

            {aiTriageResult && (
              <div className="mt-4 p-4 rounded-xl bg-teal-50 border border-teal-200 text-left space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-teal-900 uppercase">Recommended Specialty</span>
                  <span className="px-2 py-0.5 rounded bg-teal-200 text-teal-900 font-bold text-[10px]">
                    {Math.round(aiTriageResult.confidence * 100)}% Confidence
                  </span>
                </div>
                <h4 className="text-base font-bold text-teal-950">{aiTriageResult.recommendedDepartment}</h4>
                <p className="text-xs text-teal-900 leading-relaxed">{aiTriageResult.triageSummary}</p>
                <div className="text-[10px] text-teal-800 font-medium pt-1 border-t border-teal-200">
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
        className="fixed bottom-6 right-6 z-40 p-3.5 bg-[#15324F] text-white rounded-full shadow-lg hover:bg-[#1c3f63] transition flex items-center gap-2 group border-2 border-white"
        title="Open AI Symptom Assistant"
      >
        <Bot className="w-5 h-5 text-[#087F8C]" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 text-xs font-bold whitespace-nowrap">
          AI Triage
        </span>
      </button>

      <Footer />
    </div>
  );
};

export default LandingPage;
