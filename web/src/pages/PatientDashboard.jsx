import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { getDepartmentIcon } from '../utils/departmentIcons';
import { supabase } from '../utils/supabase';
import { 
  Calendar, 
  Clock, 
  FileText, 
  UploadCloud, 
  Bot, 
  User, 
  ShieldAlert, 
  Activity,
  History,
  CheckCircle,
  FileDigit,
  Trash2,
  Send,
  Sparkles,
  Printer,
  ExternalLink,
  Video,
  AlertTriangle
} from 'lucide-react';

export const PatientDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Core Data State
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [records, setRecords] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Smart Scheduler Form
  const [dept, setDept] = useState('General Medicine');
  const [selectedDocId, setSelectedDocId] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingSlot, setBookingSlot] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState('');

  // AI Assistant Chatbot State
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'assistant', content: `Hello ${user?.name}! I am your AI Health Assistant at Saveetha Medical College & Hospital. \n\nHow can I help you today? You can describe any symptoms you are experiencing, and I'll suggest suitable departments and guide your appointment booking. \n\n*⚠️ Note: I am an AI assistant for guidance, not a medical emergency system. If this is a life-threatening emergency, please visit the nearest ER immediately.*` }
  ]);
  const [aiLoading, setAiLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Digital Prescription View Modal State
  const [viewPrescription, setViewPrescription] = useState(null);

  // Reschedule & Cancel Modal States
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [newRescheduleDate, setNewRescheduleDate] = useState('');
  const [newRescheduleSlot, setNewRescheduleSlot] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('Personal scheduling conflict');
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [rescheduleError, setRescheduleError] = useState('');
  const [rescheduleSlots, setRescheduleSlots] = useState([]);

  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelReason, setCancelReason] = useState('Patient personal emergency');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState('');

  // Medical Record Upload State
  const [recordName, setRecordName] = useState('');
  const [recordDesc, setRecordDesc] = useState('');
  const [recordUploadSuccess, setRecordUploadSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  // Profile State
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [allergies, setAllergies] = useState('None');
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Load patient clinical logs on mount
  useEffect(() => {
    fetchPatientData();
  }, [user]);

  // Scroll Chat to Bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const fetchPatientData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [apptData, presData, recData, docsData, notifData] = await Promise.all([
        api.appointments.getAll({ patientId: user.id }),
        api.prescriptions.getAll({ patientId: user.id }),
        api.records.getAll(user.id),
        api.doctors.getAll(),
        api.notifications.getAll(user.id)
      ]);
      setAppointments(apptData);
      setPrescriptions(presData);
      setRecords(recData);
      setDoctors(docsData);
      setNotifications(notifData);
      
      // Auto-set doctor ID for scheduler if available
      const docsInDept = docsData.filter(d => d.department === dept);
      if (docsInDept.length > 0) {
        setSelectedDocId(docsInDept[0].id);
      }
    } catch (e) {
      console.error("Error loading patient dashboard metrics", e);
    } finally {
      setLoading(false);
    }
  };

  // Sync doctor choice with department choice
  useEffect(() => {
    const docsInDept = doctors.filter(d => d.department === dept);
    if (docsInDept.length > 0) {
      setSelectedDocId(docsInDept[0].id);
    } else {
      setSelectedDocId('');
    }
    setBookingSlot('');
  }, [dept, doctors]);

  // Smart Scheduler overlaps checker
  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setBookingError('');
    setBookingSuccess(false);

    if (!selectedDocId || !bookingDate || !bookingSlot) {
      setBookingError("Please complete all scheduling choices.");
      return;
    }

    try {
      const appt = await api.appointments.create({
        patientId: user.id,
        patientName: user.name,
        doctorId: selectedDocId,
        date: bookingDate,
        timeSlot: bookingSlot,
        symptoms: symptoms || "Routine Consult"
      });

      setBookingSuccess(true);
      setSymptoms('');
      setBookingSlot('');
      setBookingDate('');
      fetchPatientData(); // Reload history
    } catch (err) {
      setBookingError(err.response?.data?.error || err.message || "Failed to schedule slot.");
    }
  };

  // Fetch slots when reschedule date is chosen
  useEffect(() => {
    if (rescheduleTarget && newRescheduleDate) {
      api.doctors.getAvailability(rescheduleTarget.doctorId, newRescheduleDate)
        .then(res => {
          if (res && res.availableSlots && res.availableSlots.length > 0) {
            setRescheduleSlots(res.availableSlots);
          } else {
            setRescheduleSlots(timeSlotOptions);
          }
        })
        .catch(() => setRescheduleSlots(timeSlotOptions));
    }
  }, [rescheduleTarget, newRescheduleDate]);

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!newRescheduleDate || !newRescheduleSlot) {
      setRescheduleError("Please choose both date and time slot.");
      return;
    }
    setRescheduleLoading(true);
    setRescheduleError('');
    try {
      await api.appointments.reschedule(rescheduleTarget.id, newRescheduleDate, newRescheduleSlot, rescheduleReason);
      setRescheduleTarget(null);
      fetchPatientData();
    } catch (err) {
      setRescheduleError(err.response?.data?.error || err.message || "Failed to reschedule appointment.");
    } finally {
      setRescheduleLoading(false);
    }
  };

  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    setCancelLoading(true);
    setCancelError('');
    try {
      await api.appointments.cancel(cancelTarget.id, cancelReason);
      setCancelTarget(null);
      fetchPatientData();
    } catch (err) {
      setCancelError(err.response?.data?.error || err.message || "Failed to cancel appointment.");
    } finally {
      setCancelLoading(false);
    }
  };

  // Chat Trigger
  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userMsg = { role: 'user', content: chatMessage };
    setChatHistory(prev => [...prev, userMsg]);
    setChatMessage('');
    setAiLoading(true);

    try {
      const chatHistoryPayload = chatHistory.map(h => ({ role: h.role, content: h.content }));
      const response = await api.ai.chat(chatMessage, chatHistoryPayload);
      
      setChatHistory(prev => [...prev, { role: 'assistant', content: response.reply, recommendedDepartment: response.recommendedDepartment }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'assistant', content: "Sorry, my healthcare model seems currently overloaded. Please seek standard clinical scheduling options." }]);
    } finally {
      setAiLoading(false);
    }
  };

  // Direct symptom suggestion click
  const triggerAIChatSuggestion = async (symptomText) => {
    const userMsg = { role: 'user', content: symptomText };
    setChatHistory(prev => [...prev, userMsg]);
    setAiLoading(true);
    try {
      const response = await api.ai.chat(symptomText, []);
      setChatHistory(prev => [...prev, { role: 'assistant', content: response.reply, recommendedDepartment: response.recommendedDepartment }]);
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  // Record actual file uploads using Supabase Storage
  const handleRecordUpload = async (e) => {
    e.preventDefault();
    if (!recordName || !selectedFile) {
      setUploadError("Please enter a name and choose a file.");
      return;
    }

    setUploading(true);
    setUploadError('');
    setRecordUploadSuccess(false);

    try {
      const fileExt = selectedFile.name.split('.').pop();
      const sanitizedFileName = `${Date.now()}_${recordName.replace(/[^a-zA-Z0-9]/g, '_')}.${fileExt}`;
      const filePath = `${user.id}/${sanitizedFileName}`;

      const { data, error: uploadErr } = await supabase.storage
        .from('medical-records')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadErr) {
        if (uploadErr.message?.includes("bucket not found") || uploadErr.message?.includes("does not exist")) {
          throw new Error("Storage bucket 'medical-records' not found. Please create a public bucket named 'medical-records' in your Supabase dashboard.");
        }
        throw uploadErr;
      }

      const { data: urlData } = supabase.storage
        .from('medical-records')
        .getPublicUrl(filePath);

      const fileUrl = urlData.publicUrl;
      const sizeInMB = (selectedFile.size / (1024 * 1024)).toFixed(1);
      const fileSizeStr = `${sizeInMB} MB`;

      await api.records.create({
        patientId: user.id,
        fileName: recordName,
        fileSize: fileSizeStr,
        description: recordDesc || "Uploaded clinical file",
        fileUrl: fileUrl
      });

      setRecordUploadSuccess(true);
      setRecordName('');
      setRecordDesc('');
      setSelectedFile(null);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      fetchPatientData();
      setTimeout(() => setRecordUploadSuccess(false), 4000);
    } catch (err) {
      console.error(err);
      setUploadError(err.message || "Failed to upload file to storage.");
    } finally {
      setUploading(false);
    }
  };

  const handleRecordDelete = async (id) => {
    if (confirm("Remove report file permanently?")) {
      await api.records.delete(id);
      fetchPatientData();
    }
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 3000);
  };

  // Find corresponding prescriptions
  const getPrescriptionForAppt = (apptId) => {
    return prescriptions.find(p => p.appointmentId === apptId);
  };

  const selectedDoctorObj = doctors.find(d => d.id === selectedDocId);

  // Available Time Slots Preset Options
  const timeSlotOptions = [
    "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"
  ];

  return (
    <div class="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Primary Workspace Window */}
      <main class="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full text-left">
        
        {/* Loading Spinner */}
        {loading ? (
          <div class="h-full flex items-center justify-center py-20">
            <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-hospital-600"></div>
          </div>
        ) : (
          <div>

            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div class="space-y-8">
                {/* Visual Banner */}
                <div class="bg-gradient-to-r from-hospital-700 to-hospital-500 rounded-3xl p-8 text-white shadow-lg shadow-hospital-700/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                  <div>
                    <h2 class="text-3xl font-extrabold tracking-tight">Welcome, {user?.name}!</h2>
                    <p class="text-white/80 text-sm mt-1">Review your upcoming healthcare schedules and medical file summaries below.</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('book')}
                    class="px-5 py-3 bg-white text-hospital-700 hover:bg-slate-100 rounded-2xl font-bold text-sm shadow-md transition-all flex items-center gap-2"
                  >
                    <Calendar class="w-4 h-4" /> Book Appointment
                  </button>
                </div>

                {/* Patient Stats Grid */}
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div class="p-3 bg-hospital-50 text-hospital-600 rounded-xl">
                      <Calendar class="w-6 h-6" />
                    </div>
                    <div>
                      <h4 class="text-slate-400 text-xs font-bold uppercase tracking-wider">Scheduled Slots</h4>
                      <p class="text-2xl font-extrabold text-slate-800">{appointments.filter(a => a.status === 'Approved').length} Active</p>
                    </div>
                  </div>
                  <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div class="p-3 bg-clinical-50 text-clinical-600 rounded-xl">
                      <FileText class="w-6 h-6" />
                    </div>
                    <div>
                      <h4 class="text-slate-400 text-xs font-bold uppercase tracking-wider">Prescriptions Issued</h4>
                      <p class="text-2xl font-extrabold text-slate-800">{prescriptions.length} Records</p>
                    </div>
                  </div>
                  <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div class="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                      <Activity class="w-6 h-6" />
                    </div>
                    <div>
                      <h4 class="text-slate-400 text-xs font-bold uppercase tracking-wider">Blood Group</h4>
                      <p class="text-2xl font-extrabold text-slate-800">{bloodGroup}</p>
                    </div>
                  </div>
                </div>

                {/* Upcoming Schedules Table */}
                <div class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                  <div class="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 class="font-extrabold text-lg text-slate-800">Your Appointment History</h3>
                    <span class="text-xs px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full font-bold uppercase tracking-wider">Total: {appointments.length}</span>
                  </div>
                  
                  {appointments.length === 0 ? (
                    <div class="p-12 text-center text-slate-400 space-y-2">
                      <p class="text-sm font-semibold">No appointment history registered.</p>
                      <button onClick={() => setActiveTab('book')} class="text-hospital-600 font-bold hover:underline text-xs">Book your initial check-up slot ⚡</button>
                    </div>
                  ) : (
                    <div class="overflow-x-auto">
                      <table class="w-full text-left border-collapse">
                        <thead>
                          <tr class="bg-slate-50/50 text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-100">
                            <th class="p-4 pl-6">Doctor Details</th>
                            <th class="p-4">Department</th>
                            <th class="p-4">Date & Time</th>
                            <th class="p-4">Symptoms</th>
                            <th class="p-4">Status</th>
                            <th class="p-4 pr-6">Action</th>
                          </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 text-sm">
                          {appointments.map((appt) => (
                            <tr key={appt.id} class="hover:bg-slate-50/50 transition-colors">
                              <td class="p-4 pl-6">
                                <span class="font-bold text-slate-800">{appt.doctorName}</span>
                              </td>
                              <td class="p-4">
                                <span class="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg">{appt.department}</span>
                              </td>
                              <td class="p-4">
                                <div class="flex flex-col">
                                  <span class="font-semibold text-slate-800">{appt.date}</span>
                                  <span class="text-slate-400 text-xs font-medium flex items-center gap-1"><Clock class="w-3 h-3" /> {appt.timeSlot}</span>
                                </div>
                              </td>
                              <td class="p-4 max-w-xs truncate" title={appt.symptoms}>
                                <span class="text-slate-500">{appt.symptoms}</span>
                              </td>
                              <td class="p-4">
                                <span class={`px-2.5 py-1 text-xs font-bold rounded-full ${
                                  appt.status === 'Approved' ? 'bg-green-50 text-green-700' :
                                  appt.status === 'Pending' ? 'bg-amber-50 text-amber-700' :
                                  appt.status === 'Completed' ? 'bg-blue-50 text-blue-700' :
                                  'bg-red-50 text-red-700'
                                }`}>
                                  {appt.status}
                                </span>
                              </td>
                              <td class="p-4 pr-6">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {appt.consultationType === 'VIDEO' && appt.status !== 'CANCELLED' && appt.status !== 'COMPLETED' && (
                                    <Link
                                      to={`/telehealth-room/${appt.id}`}
                                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-xs"
                                    >
                                      <Video className="w-3.5 h-3.5" /> Join Video
                                    </Link>
                                  )}

                                  {appt.status === 'Completed' && getPrescriptionForAppt(appt.id) ? (
                                    <button
                                      onClick={() => setViewPrescription(getPrescriptionForAppt(appt.id))}
                                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
                                    >
                                      <FileDigit className="w-3.5 h-3.5" /> Prescription
                                    </button>
                                  ) : null}

                                  {appt.status !== 'COMPLETED' && appt.status !== 'Completed' && appt.status !== 'CANCELLED' && (
                                    <>
                                      <button
                                        onClick={() => {
                                          setRescheduleTarget(appt);
                                          setNewRescheduleDate(appt.date);
                                          setNewRescheduleSlot(appt.timeSlot);
                                        }}
                                        className="px-2.5 py-1 text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg font-semibold transition"
                                      >
                                        Reschedule
                                      </button>
                                      <button
                                        onClick={() => setCancelTarget(appt)}
                                        className="px-2.5 py-1 text-xs text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-semibold transition"
                                      >
                                        Cancel
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: BOOK APPOINTMENT */}
            {activeTab === 'book' && (
              <div class="space-y-6">
                <div class="space-y-2">
                  <h2 class="text-2xl font-extrabold text-slate-900">Smart Slot Booking</h2>
                  <p class="text-slate-500 text-sm">Select department, choose practitioners, and schedule real-time overlap-checked clinical slots.</p>
                </div>

                {bookingSuccess ? (
                  <div class="bg-white border border-slate-100 rounded-3xl p-8 text-center max-w-lg mx-auto shadow-xl space-y-4">
                    <div class="p-4 bg-green-50 text-green-600 rounded-full w-fit mx-auto text-3xl">
                      ✔️
                    </div>
                    <h3 class="text-2xl font-extrabold text-slate-800 font-sans">Booking Successful!</h3>
                    <p class="text-slate-500 text-sm">Your appointment request has been recorded. The corresponding doctor is notified and can review it immediately.</p>
                    <div class="pt-4 flex gap-4 justify-center">
                      <button 
                        onClick={() => {
                          setBookingSuccess(false);
                          setActiveTab('overview');
                        }}
                        class="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-all"
                      >
                        View in Overview
                      </button>
                      <button 
                        onClick={() => setBookingSuccess(false)}
                        class="px-6 py-3 bg-hospital-600 hover:bg-hospital-700 text-white font-bold rounded-xl text-sm shadow-md transition-all"
                      >
                        Book Another Slot
                      </button>
                    </div>
                  </div>
                ) : (
                  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Scheduling Selection Form */}
                    <form onSubmit={handleBookAppointment} class="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 space-y-6">
                      {bookingError && (
                        <div class="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-xs text-red-700 font-medium">
                          <ShieldAlert class="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500" />
                          <span>{bookingError}</span>
                        </div>
                      )}

                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* 1. Department */}
                        <div>
                          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">Medical Specialty</label>
                          <select
                            value={dept}
                            onChange={(e) => setDept(e.target.value)}
                            class="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-hospital-500 text-sm bg-white font-medium"
                          >
                            <option value="Cardiology">Cardiology</option>
                            <option value="Orthopedics">Orthopedics</option>
                            <option value="ENT">ENT</option>
                            <option value="Neurology">Neurology</option>
                            <option value="Dermatology">Dermatology</option>
                            <option value="Pediatrics">Pediatrics</option>
                            <option value="General Medicine">General Medicine</option>
                          </select>
                        </div>

                        {/* 2. Doctor List */}
                        <div>
                          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">Select Clinical Consultant</label>
                          <select
                            value={selectedDocId}
                            onChange={(e) => setSelectedDocId(e.target.value)}
                            required
                            class="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-hospital-500 text-sm bg-white font-semibold text-slate-800"
                          >
                            <option value="" disabled>-- Select Doctor --</option>
                            {doctors
                              .filter(d => d.department === dept)
                              .map(d => (
                                <option key={d.id} value={d.id}>{d.name} ({d.specialization})</option>
                              ))
                            }
                          </select>
                        </div>
                      </div>

                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* 3. Booking Date */}
                        <div>
                          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">Consultation Date</label>
                          <input
                            type="date"
                            required
                            value={bookingDate}
                            onChange={(e) => setBookingDate(e.target.value)}
                            class="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-hospital-500 text-sm"
                          />
                        </div>

                        {/* 4. Scheduling Slots */}
                        <div>
                          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">Preferred Slot (AI Recommend)</label>
                          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {timeSlotOptions.map((slot, idx) => {
                              const isSelected = bookingSlot === slot;
                              return (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => setBookingSlot(slot)}
                                  class={`py-2 rounded-xl text-xs font-bold border transition-all ${
                                    isSelected
                                      ? 'bg-hospital-600 text-white border-hospital-600 shadow-md shadow-hospital-600/10'
                                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                  }`}
                                >
                                  {slot}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Symptoms input */}
                      <div>
                        <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">Describe Symptoms & Notes</label>
                        <textarea
                          rows="3"
                          value={symptoms}
                          onChange={(e) => setSymptoms(e.target.value)}
                          placeholder="Please specify details (e.g. slight chest discomfort, dry cough, etc.)"
                          class="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-hospital-500 text-sm"
                        ></textarea>
                      </div>

                      <button
                        type="submit"
                        class="w-full py-4 bg-hospital-600 hover:bg-hospital-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-hospital-600/10 transition-all flex items-center justify-center gap-2"
                      >
                        ⚡ Confirm Appointment Details
                      </button>
                    </form>

                    {/* Doctor Mini Profile Card Preview */}
                    <div class="space-y-6">
                      {selectedDoctorObj ? (
                        <div class="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4 text-center">
                          <img
                            src={selectedDoctorObj.imageUrl}
                            alt={selectedDoctorObj.name}
                            class="w-24 h-24 rounded-2xl mx-auto object-cover border border-slate-100 shadow-sm"
                          />
                          <div>
                            <h3 class="font-extrabold text-lg text-slate-800">{selectedDoctorObj.name}</h3>
                            <p class="text-xs text-hospital-600 font-bold uppercase tracking-wider">{selectedDoctorObj.department}</p>
                          </div>
                          
                          <div class="border-t border-b border-slate-100 py-3 grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span class="text-slate-400 block">Experience</span>
                              <span class="font-bold text-slate-700">{selectedDoctorObj.experience} Years</span>
                            </div>
                            <div>
                              <span class="text-slate-400 block">Consult Fee</span>
                              <span class="font-bold text-slate-700">₹{selectedDoctorObj.fees}</span>
                            </div>
                          </div>

                          <p class="text-xs text-slate-500 leading-normal italic">
                            "{selectedDoctorObj.about}"
                          </p>

                          <div class="bg-slate-50 rounded-xl p-3 text-left">
                            <span class="text-[10px] uppercase font-bold text-slate-400 block mb-1">Availability</span>
                            <span class="text-xs font-bold text-slate-600 block">{selectedDoctorObj.availableDays.join(', ')}</span>
                          </div>
                        </div>
                      ) : (
                        <div class="bg-slate-100 rounded-3xl p-12 text-center text-slate-400 border border-dashed border-slate-200">
                          Select department and doctor to preview credentials.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: PRESCRIPTIONS & HISTORY */}
            {activeTab === 'history' && (
              <div class="space-y-6">
                <div class="space-y-2">
                  <h2 class="text-2xl font-extrabold text-slate-900 font-sans">Prescriptions File Record</h2>
                  <p class="text-slate-500 text-sm">Browse your clinical diagnoses and retrieve digital practitioner prescriptions.</p>
                </div>

                {prescriptions.length === 0 ? (
                  <div class="bg-white rounded-3xl border border-slate-100 p-12 text-center text-slate-400">
                    No active prescriptions registered in your medical history chart.
                  </div>
                ) : (
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {prescriptions.map((pres) => (
                      <div key={pres.id} class="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
                        <div class="flex justify-between items-start">
                          <div>
                            <span class="text-[10px] px-2 py-0.5 bg-clinical-50 text-clinical-700 rounded-md font-bold uppercase tracking-wider">{pres.date}</span>
                            <h3 class="font-bold text-lg text-slate-800 mt-1">{pres.diagnosis}</h3>
                            <p class="text-xs text-slate-500">Consultant: <span class="font-semibold text-slate-700">{pres.doctorName}</span></p>
                          </div>
                          <button
                            onClick={() => setViewPrescription(pres)}
                            class="p-2.5 bg-hospital-50 text-hospital-600 hover:bg-hospital-100 rounded-xl transition-all"
                            title="View Printable Copy"
                          >
                            <Printer class="w-5 h-5" />
                          </button>
                        </div>

                        <div class="border-t border-slate-50 pt-3 text-xs space-y-2 text-left">
                          <div>
                            <span class="text-slate-400 block font-bold uppercase tracking-wider text-[9px]">Symptom Logged</span>
                            <p class="text-slate-600 italic font-medium">"{pres.symptoms}"</p>
                          </div>
                          <div>
                            <span class="text-slate-400 block font-bold uppercase tracking-wider text-[9px] mb-1">Prescribed Medicines</span>
                            <div class="space-y-1">
                              {pres.medicines.map((m, i) => (
                                <div key={i} class="flex justify-between bg-slate-50 rounded-lg p-2 font-medium">
                                  <span class="text-slate-800 font-bold">{m.name}</span>
                                  <span class="text-slate-500 font-light">{m.dosage} ({m.duration})</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: MEDICAL REPORTS */}
            {activeTab === 'records' && (
              <div class="space-y-6">
                <div class="space-y-2">
                  <h2 class="text-2xl font-extrabold text-slate-900 font-sans">Medical Records Vault</h2>
                  <p class="text-slate-500 text-sm">Upload, manage, and store patient diagnostic reports (Blood panels, scans, physical tests) securely.</p>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Upload Form */}
                  <div class="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
                    <h3 class="font-extrabold text-base text-slate-800 flex items-center gap-2">
                      <UploadCloud class="w-5 h-5 text-hospital-600" />
                      Add Medical Report
                    </h3>

                    {recordUploadSuccess && (
                      <div class="p-3.5 bg-green-50 text-green-700 text-xs font-semibold rounded-xl text-center font-sans">
                        ✔️ Document saved to storage vault!
                      </div>
                    )}

                    {uploadError && (
                      <div class="p-3.5 bg-red-50 text-red-700 text-xs font-semibold rounded-xl text-center flex items-center justify-center gap-2">
                        <ShieldAlert class="w-4 h-4 text-red-500 flex-shrink-0" />
                        <span class="text-left leading-normal">{uploadError}</span>
                      </div>
                    )}

                    <form onSubmit={handleRecordUpload} class="space-y-4 text-left">
                      <div>
                        <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Report Document Name</label>
                        <input
                          type="text"
                          required
                          value={recordName}
                          onChange={(e) => setRecordName(e.target.value)}
                          placeholder="e.g. ECG Scan Report"
                          class="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-hospital-500 text-sm font-semibold text-slate-800"
                        />
                      </div>
                      <div>
                        <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Report Description</label>
                        <textarea
                          rows="2"
                          value={recordDesc}
                          onChange={(e) => setRecordDesc(e.target.value)}
                          placeholder="Specify diagnostic details..."
                          class="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-hospital-500 text-sm"
                        ></textarea>
                      </div>
                      <div>
                        <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Choose File (PDF/Image)</label>
                        <input
                          type="file"
                          ref={fileInputRef}
                          required
                          onChange={(e) => setSelectedFile(e.target.files[0])}
                          class="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-hospital-50 file:text-hospital-700 hover:file:bg-hospital-100 border border-slate-200 rounded-2xl p-2.5 bg-white cursor-pointer"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={uploading}
                        class="w-full py-3.5 bg-hospital-600 hover:bg-hospital-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {uploading ? (
                          <>
                            <div class="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                            Uploading to Vault...
                          </>
                        ) : (
                          "Upload PDF Document"
                        )}
                      </button>
                    </form>
                  </div>

                  {/* List of files */}
                  <div class="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                    <h3 class="font-extrabold text-base text-slate-800 mb-4">Secure Storage Folder</h3>

                    {records.length === 0 ? (
                      <div class="p-12 text-center text-slate-400 italic">No medical records uploaded yet.</div>
                    ) : (
                      <div class="space-y-3">
                        {records.map((rec) => (
                          <div key={rec.id} class="flex justify-between items-center bg-slate-50 border border-slate-100 rounded-2xl p-4 hover:border-slate-200 transition-all text-left">
                            <div class="flex items-center gap-3">
                              <div class="p-2.5 bg-red-50 text-red-500 rounded-xl">
                                <FileDigit class="w-6 h-6" />
                              </div>
                              <div>
                                {rec.fileUrl ? (
                                  <a 
                                    href={rec.fileUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    class="font-bold text-hospital-600 hover:text-hospital-700 hover:underline text-sm flex items-center gap-1"
                                  >
                                    {rec.fileName} <ExternalLink class="w-3.5 h-3.5" />
                                  </a>
                                ) : (
                                  <h4 class="font-bold text-slate-800 text-sm">{rec.fileName}</h4>
                                )}
                                <p class="text-xs text-slate-500 mt-0.5">{rec.description} • {rec.fileSize}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleRecordDelete(rec.id)}
                              class="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 class="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: AI HEALTH ASSISTANT CHATBOT */}
            {activeTab === 'ai-chat' && (
              <div class="space-y-6">
                <div class="space-y-2">
                  <h2 class="text-2xl font-extrabold text-slate-900 font-sans flex items-center gap-2">
                    <Bot class="w-6 h-6 text-hospital-600 animate-bounce-slow" />
                    AI Symptom Triage Coordinator
                  </h2>
                  <p class="text-slate-500 text-sm">Outline symptoms to analyze. The assistant parses them, refers appropriate clinics, and assists scheduling.</p>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                  
                  {/* Quick Triage Symptoms presets */}
                  <div class="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                    <h4 class="font-extrabold text-xs uppercase tracking-wider text-slate-400">Quick Diagnostics Prompts</h4>
                    <div class="flex flex-col gap-2.5">
                      <button
                        onClick={() => triggerAIChatSuggestion("I have sharp chest pains radiating to my left arm, along with shortness of breath.")}
                        class="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 text-left border border-slate-100 transition-colors"
                      >
                        🫀 Chest Pain / Cardiology Symptoms
                      </button>
                      <button
                        onClick={() => triggerAIChatSuggestion("My ear has been aching and feeling completely blocked since swimming yesterday.")}
                        class="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 text-left border border-slate-100 transition-colors"
                      >
                        👂 Earache & Throat Irritation
                      </button>
                      <button
                        onClick={() => triggerAIChatSuggestion("I have intense migraines with dizziness and nerve numbness in my fingers.")}
                        class="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 text-left border border-slate-100 transition-colors"
                      >
                        🧠 Migraines & Dizziness concerns
                      </button>
                    </div>

                    <div class="p-4 bg-amber-50/50 border border-amber-200 rounded-2xl text-[10px] text-amber-800 leading-relaxed font-semibold">
                      ⚠️ EMERGENCY DISCLAIMER: Triage outputs are for recommendation guidance only. Always review clinical issues with real medical practitioners.
                    </div>
                  </div>

                  {/* Chat interface */}
                  <div class="lg:col-span-3 bg-white border border-slate-100 rounded-3xl shadow-sm flex flex-col h-[520px] overflow-hidden">
                    {/* Chat Bubble Logs */}
                    <div class="flex-1 p-6 overflow-y-auto space-y-4">
                      {chatHistory.map((chat, idx) => {
                        const isAssistant = chat.role === 'assistant';
                        return (
                          <div 
                            key={idx}
                            class={`flex items-start gap-3 text-sm ${isAssistant ? 'justify-start' : 'justify-end'}`}
                          >
                            {isAssistant && (
                              <div class="w-8 h-8 rounded-lg bg-hospital-600 text-white flex items-center justify-center flex-shrink-0 mt-1 shadow-md shadow-hospital-600/10">
                                <Bot class="w-4 h-4" />
                              </div>
                            )}
                            <div class={`p-4 rounded-2xl max-w-xl text-left shadow-sm ${
                              isAssistant
                                ? 'bg-slate-100 text-slate-800 rounded-tl-none font-medium'
                                : 'bg-hospital-600 text-white rounded-tr-none font-semibold'
                            }`}>
                              <p class="whitespace-pre-wrap leading-relaxed">{chat.content}</p>

                              {/* Interactive routing action inside chat! */}
                              {isAssistant && chat.recommendedDepartment && (
                                <div class="mt-4 pt-3 border-t border-slate-200/50 flex flex-wrap gap-2.5 items-center">
                                  <span class="text-[10px] text-slate-400 font-bold uppercase">Clinical Suggestion:</span>
                                  <button
                                    onClick={() => {
                                      setDept(chat.recommendedDepartment);
                                      setActiveTab('book');
                                    }}
                                    class="px-3 py-1.5 bg-hospital-600 hover:bg-hospital-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                                  >
                                    <Sparkles class="w-3 h-3" /> Book in {chat.recommendedDepartment}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      
                      {aiLoading && (
                        <div class="flex items-center gap-2 text-slate-400 font-semibold text-xs text-left">
                          <div class="animate-bounce h-2 w-2 bg-slate-400 rounded-full"></div>
                          <div class="animate-bounce h-2 w-2 bg-slate-400 rounded-full [animation-delay:0.2s]"></div>
                          <div class="animate-bounce h-2 w-2 bg-slate-400 rounded-full [animation-delay:0.4s]"></div>
                          <span>AI Triage checking clinics availability...</span>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    {/* Input message form */}
                    <form onSubmit={handleSendChat} class="p-4 border-t border-slate-100 flex gap-2">
                      <input
                        type="text"
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        placeholder="Describe symptoms here..."
                        class="flex-1 px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-hospital-500 text-sm font-semibold"
                      />
                      <button
                        type="submit"
                        class="p-3 bg-hospital-600 hover:bg-hospital-700 text-white rounded-2xl shadow-md shadow-hospital-600/10 hover:shadow-hospital-600/20 transition-all flex items-center justify-center"
                      >
                        <Send class="w-5 h-5" />
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: MY PROFILE */}
            {activeTab === 'profile' && (
              <div class="max-w-2xl bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                <div class="space-y-1">
                  <h2 class="text-2xl font-extrabold text-slate-900">Demographic Registry Card</h2>
                  <p class="text-slate-500 text-sm">Edit clinical demographic tags in the database.</p>
                </div>

                {profileSuccess && (
                  <div class="p-3.5 bg-green-50 text-green-700 text-xs font-semibold rounded-xl text-center">
                    ✔️ Card updated in local registry files successfully!
                  </div>
                )}

                <form onSubmit={handleProfileSubmit} class="space-y-4 text-left">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Patient Name</label>
                      <input
                        type="text"
                        disabled
                        value={user?.name}
                        class="w-full px-4 py-3 rounded-2xl border border-slate-100 bg-slate-50 text-slate-500 text-sm cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Email Address</label>
                      <input
                        type="text"
                        disabled
                        value={user?.email}
                        class="w-full px-4 py-3 rounded-2xl border border-slate-100 bg-slate-50 text-slate-500 text-sm cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Blood Group Specialty</label>
                      <select
                        value={bloodGroup}
                        onChange={(e) => setBloodGroup(e.target.value)}
                        class="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-hospital-500 text-sm bg-white font-medium"
                      >
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Allergy & Drug Alerts</label>
                      <input
                        type="text"
                        value={allergies}
                        onChange={(e) => setAllergies(e.target.value)}
                        class="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-hospital-500 text-sm"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    class="px-6 py-3.5 bg-hospital-600 hover:bg-hospital-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-hospital-600/10"
                  >
                    Save Changes
                  </button>
                </form>
              </div>
            )}

          </div>
        )}
      </main>

      {/* digital prescription PDF Modal */}
      {viewPrescription && (
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div class="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
            
            {/* Header print area */}
            <div class="bg-gradient-to-r from-hospital-700 to-hospital-600 text-white p-6 flex justify-between items-center">
              <div class="text-left">
                <span class="text-xs uppercase font-extrabold tracking-widest text-hospital-200">Electronic Clinic Record</span>
                <h3 class="font-extrabold text-xl">Digital Prescription</h3>
              </div>
              <button 
                onClick={() => setViewPrescription(null)}
                class="text-white hover:text-hospital-200 font-extrabold text-sm"
              >
                ✕ Close
              </button>
            </div>

            {/* Content to display */}
            <div class="p-8 space-y-6 text-left max-h-[75vh] overflow-y-auto" id="printable-pres-area">
              {/* Doctor Details */}
              <div class="flex justify-between border-b border-slate-100 pb-4 text-xs font-medium">
                <div>
                  <h4 class="font-extrabold text-sm text-slate-800">{viewPrescription.doctorName}</h4>
                  <p class="text-slate-500">Saveetha Hospital Medical Lead</p>
                </div>
                <div class="text-right">
                  <p class="text-slate-500">Date: <span class="font-bold text-slate-700">{viewPrescription.date}</span></p>
                  <p class="text-slate-500">Receipt ID: <span class="font-bold text-slate-700">#{viewPrescription.id}</span></p>
                </div>
              </div>

              {/* Patient Details */}
              <div class="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl">
                <div>
                  <span class="text-slate-400 block uppercase font-bold text-[9px]">Patient Name</span>
                  <span class="font-bold text-slate-700">{viewPrescription.patientName}</span>
                </div>
                <div>
                  <span class="text-slate-400 block uppercase font-bold text-[9px]">Diagnosis Chart</span>
                  <span class="font-bold text-slate-700">{viewPrescription.diagnosis}</span>
                </div>
              </div>

              {/* Meds List */}
              <div class="space-y-2">
                <span class="text-slate-400 block uppercase font-bold text-[10px] tracking-wider">Meds & Posology (Dosage instructions)</span>
                <div class="border border-slate-100 rounded-2xl overflow-hidden">
                  <table class="w-full text-xs text-left">
                    <thead>
                      <tr class="bg-slate-50/50 border-b border-slate-100 text-slate-400 font-bold uppercase text-[9px]">
                        <th class="p-3 pl-4">Medicine Item</th>
                        <th class="p-3">Dosage Details</th>
                        <th class="p-3">Duration</th>
                        <th class="p-3 pr-4">Instructions</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 font-semibold text-slate-700">
                      {viewPrescription.medicines.map((m, idx) => (
                        <tr key={idx} class="hover:bg-slate-50/50">
                          <td class="p-3 pl-4 font-bold text-slate-800">{m.name}</td>
                          <td class="p-3">{m.dosage}</td>
                          <td class="p-3">{m.duration}</td>
                          <td class="p-3 pr-4 font-normal text-slate-500">{m.instructions || "After meals"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Clinical Advice */}
              {viewPrescription.advice && (
                <div class="space-y-1 text-xs">
                  <span class="text-slate-400 block uppercase font-bold text-[10px] tracking-wider">Clinical Lifestyle Advice</span>
                  <p class="text-slate-600 leading-relaxed font-semibold bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    "{viewPrescription.advice}"
                  </p>
                </div>
              )}

              {/* Footer */}
              <div class="border-t border-slate-100 pt-6 flex justify-between items-center text-[10px] text-slate-400 font-medium">
                <span>🩺 Issued Digitally by Saveetha Hospital EHR Portal</span>
                <span class="uppercase tracking-widest text-[9px] font-bold text-clinical-600 bg-clinical-50 px-2 py-0.5 rounded">Verified Signature</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div class="bg-slate-50 p-4 border-t border-slate-100 flex gap-3 justify-end">
              <button
                onClick={() => window.print()}
                class="px-5 py-2.5 bg-hospital-600 hover:bg-hospital-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center gap-1.5"
              >
                <Printer class="w-4 h-4" /> Print Document
              </button>
              <button
                onClick={() => setViewPrescription(null)}
                class="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Reschedule Appointment Modal */}
      {rescheduleTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-150">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white p-6 flex justify-between items-center">
              <div>
                <span className="text-xs uppercase font-extrabold tracking-widest text-blue-200">Appointment Management</span>
                <h3 className="font-extrabold text-xl">Reschedule Appointment</h3>
              </div>
              <button
                onClick={() => setRescheduleTarget(null)}
                className="text-white hover:text-blue-200 font-extrabold text-sm"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleRescheduleSubmit} className="p-6 space-y-4 text-left">
              {rescheduleError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
                  {rescheduleError}
                </div>
              )}

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs space-y-1">
                <p className="text-slate-500">Doctor: <span className="font-bold text-slate-800">{rescheduleTarget.doctorName}</span></p>
                <p className="text-slate-500">Current Slot: <span className="font-bold text-slate-800">{rescheduleTarget.date} at {rescheduleTarget.timeSlot}</span></p>
                <p className="text-slate-500">Specialty: <span className="font-semibold text-slate-700">{rescheduleTarget.department}</span></p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">New Appointment Date</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={newRescheduleDate}
                  onChange={(e) => {
                    setNewRescheduleDate(e.target.value);
                    setNewRescheduleSlot('');
                  }}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select New Time Slot</label>
                <div className="grid grid-cols-3 gap-2">
                  {(rescheduleSlots.length > 0 ? rescheduleSlots : timeSlotOptions).map(slot => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setNewRescheduleSlot(slot)}
                      className={`py-2 px-3 text-xs font-bold rounded-xl border transition ${
                        newRescheduleSlot === slot
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reason for Rescheduling</label>
                <input
                  type="text"
                  required
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  placeholder="e.g. Schedule clash, medical delay"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setRescheduleTarget(null)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rescheduleLoading}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {rescheduleLoading ? 'Updating Slot...' : 'Confirm Reschedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Appointment Modal */}
      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-150">
            <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white p-6 flex justify-between items-center">
              <div>
                <span className="text-xs uppercase font-extrabold tracking-widest text-red-200">Cancellation Policy</span>
                <h3 className="font-extrabold text-xl">Cancel Appointment</h3>
              </div>
              <button
                onClick={() => setCancelTarget(null)}
                className="text-white hover:text-red-200 font-extrabold text-sm"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleCancelSubmit} className="p-6 space-y-4 text-left">
              {cancelError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
                  {cancelError}
                </div>
              )}

              <p className="text-xs text-slate-600 leading-relaxed">
                Are you sure you want to cancel your appointment with <strong className="text-slate-800">{cancelTarget.doctorName}</strong> on <strong className="text-slate-800">{cancelTarget.date} ({cancelTarget.timeSlot})</strong>? The slot will be released for other patients immediately.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reason for Cancellation</label>
                <textarea
                  rows={2}
                  required
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Please state the reason for cancellation..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setCancelTarget(null)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Keep Appointment
                </button>
                <button
                  type="submit"
                  disabled={cancelLoading}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {cancelLoading ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
export default PatientDashboard;
