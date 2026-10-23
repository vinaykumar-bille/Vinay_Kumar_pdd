import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import {
  Calendar,
  Clock,
  Users,
  FileText,
  Check,
  X,
  Plus,
  Trash2,
  NotebookPen,
  Activity,
  ShieldAlert,
  Save,
  CheckCircle,
  Clock3,
  ExternalLink,
  Video,
  Printer,
  Sparkles,
  Sliders,
  CalendarDays,
  FileDigit,
  Stethoscope
} from 'lucide-react';

export const DoctorDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('appointments');

  // Doctor Clinical State
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Status handling notes
  const [noteState, setNoteState] = useState('');
  const [activeStatusApptId, setActiveStatusApptId] = useState(null);

  // Digital Prescription Creator Form State
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(null); // stores active appointment object
  const [diagnosis, setDiagnosis] = useState('');
  const [symptomsText, setSymptomsText] = useState('');
  const [advice, setAdvice] = useState('');

  // Medicines adder state
  const [medsList, setMedsList] = useState([]);
  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState('1-0-1');
  const [medDuration, setMedDuration] = useState('5 Days');
  const [medInstruction, setMedInstruction] = useState('Post Meals');
  const [presError, setPresError] = useState('');
  const [presSuccess, setPresSuccess] = useState(false);

  // Patient Records view state
  const [viewRecordsPatient, setViewRecordsPatient] = useState(null);
  const [patientRecords, setPatientRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);

  // Doctor Profile & Schedule Engine State
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [workingDays, setWorkingDays] = useState(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [slotDuration, setSlotDuration] = useState('30');
  const [breakStart, setBreakStart] = useState('13:00');
  const [breakEnd, setBreakEnd] = useState('14:00');
  const [scheduleSaved, setScheduleSaved] = useState(false);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [viewPrescriptionDetail, setViewPrescriptionDetail] = useState(null);

  useEffect(() => {
    fetchDoctorData();
  }, [user]);

  const fetchDoctorData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Find matching doctor profile based on email/docId
      const allDocs = await api.doctors.getAll();
      const myProfile = allDocs.find(d => d.email.toLowerCase() === user.email.toLowerCase()) || allDocs[0];

      if (myProfile) {
        setDoctorProfile(myProfile);
        if (myProfile.availableDays) setWorkingDays(myProfile.availableDays);
        if (myProfile.workingHours) {
          setStartTime(myProfile.workingHours.startTime || '09:00');
          setEndTime(myProfile.workingHours.endTime || '17:00');
        }
        if (myProfile.slotDurationMinutes) setSlotDuration(myProfile.slotDurationMinutes.toString());

        const [apptData, presData, patientData] = await Promise.all([
          api.appointments.getAll({ doctorId: myProfile.id }),
          api.prescriptions.getAll({ doctorId: myProfile.id }),
          api.patients.getAll()
        ]);
        setAppointments(apptData);
        setPrescriptions(presData);

        // Filter patients who have at least one booking with this doctor
        const patientIdsWithBookings = new Set(apptData.map(a => a.patientId));
        const myPatients = patientData.filter(p => patientIdsWithBookings.has(p.id));
        setPatients(myPatients);
      }
    } catch (e) {
      console.error("Error loading doctor clinical data logs", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    if (!doctorProfile) return;
    setScheduleLoading(true);
    try {
      await api.doctors.update(doctorProfile.id, {
        availableDays: workingDays,
        workingHours: { startTime, endTime },
        slotDurationMinutes: Number(slotDuration),
        breaks: [{ startTime: breakStart, endTime: breakEnd }]
      });
      setScheduleSaved(true);
      setTimeout(() => setScheduleSaved(false), 3000);
      fetchDoctorData();
    } catch (e) {
      console.error("Failed to update doctor availability", e);
    } finally {
      setScheduleLoading(false);
    }
  };

  const toggleWorkingDay = (day) => {
    if (workingDays.includes(day)) {
      if (workingDays.length === 1) return; // keep at least 1 day
      setWorkingDays(workingDays.filter(d => d !== day));
    } else {
      setWorkingDays([...workingDays, day]);
    }
  };

  const handleStatusUpdate = async (apptId, status) => {
    try {
      await api.appointments.updateStatus(apptId, status, noteState || "");
      setNoteState('');
      setActiveStatusApptId(null);
      fetchDoctorData();
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  // Add a medicine to list
  const handleAddMedicine = (e) => {
    e.preventDefault();
    if (!medName.trim()) return;

    const newMed = {
      name: medName,
      dosage: medDosage,
      duration: medDuration,
      instructions: medInstruction
    };

    setMedsList(prev => [...prev, newMed]);
    setMedName('');
    setMedInstruction('Post Meals');
  };

  const handleRemoveMedicine = (idx) => {
    setMedsList(prev => prev.filter((_, i) => i !== idx));
  };

  // Submit Prescription to EHR and complete appointment
  const handleSubmitPrescription = async (e) => {
    e.preventDefault();
    setPresError('');

    if (!diagnosis.trim()) {
      setPresError("Please specify a diagnosis.");
      return;
    }
    if (medsList.length === 0) {
      setPresError("Please add at least one medicine item.");
      return;
    }

    try {
      await api.prescriptions.create({
        appointmentId: showPrescriptionModal.id,
        patientId: showPrescriptionModal.patientId,
        patientName: showPrescriptionModal.patientName,
        doctorId: showPrescriptionModal.doctorId,
        doctorName: showPrescriptionModal.doctorName,
        diagnosis,
        symptoms: symptomsText || showPrescriptionModal.symptoms || "Routine Checkup",
        medicines: medsList,
        advice
      });

      setPresSuccess(true);
      setTimeout(() => {
        setPresSuccess(false);
        setShowPrescriptionModal(null);
        setDiagnosis('');
        setSymptomsText('');
        setAdvice('');
        setMedsList([]);
        fetchDoctorData(); // Refresh history
      }, 2000);
    } catch (err) {
      setPresError("Failed to issue prescription.");
    }
  };

  const handleViewPatientRecords = async (patient) => {
    setViewRecordsPatient(patient);
    setLoadingRecords(true);
    setPatientRecords([]);
    try {
      const recordsData = await api.records.getAll(patient.id);
      setPatientRecords(recordsData);
    } catch (e) {
      console.error("Failed to load patient records", e);
    } finally {
      setViewRecordsPatient(patient);
      setLoadingRecords(false);
    }
  };

  return (
    <div class="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main clinical canvas */}
      <main class="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full text-left">

        {loading ? (
          <div class="h-full flex items-center justify-center py-20">
            <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-clinical-600"></div>
          </div>
        ) : (
          <div class="space-y-8">

            {/* Header branding */}
            <div class="bg-gradient-to-r from-clinical-700 to-clinical-500 rounded-3xl p-8 text-white shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span class="text-xs uppercase font-extrabold tracking-widest text-clinical-200">Practitioner Workspace</span>
                <h2 class="text-3xl font-extrabold mt-1">Hello, {user?.name}!</h2>
                <p class="text-white/80 text-sm mt-1">Review active patient queue metrics and generate digital clinical reports below.</p>
              </div>
            </div>

            {/* TAB 1: APPOINTMENTS */}
            {activeTab === 'appointments' && (
              <div class="space-y-6">

                {/* Stats Widgets */}
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div class="p-3 bg-clinical-50 text-clinical-600 rounded-xl">
                      <Clock3 class="w-6 h-6" />
                    </div>
                    <div>
                      <h4 class="text-slate-400 text-xs font-bold uppercase tracking-wider">Pending Approvals</h4>
                      <p class="text-2xl font-extrabold text-slate-800">{appointments.filter(a => a.status === 'Pending').length} Bookings</p>
                    </div>
                  </div>
                  <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div class="p-3 bg-green-50 text-green-600 rounded-xl">
                      <CheckCircle class="w-6 h-6" />
                    </div>
                    <div>
                      <h4 class="text-slate-400 text-xs font-bold uppercase tracking-wider">Approved Slots</h4>
                      <p class="text-2xl font-extrabold text-slate-800">{appointments.filter(a => a.status === 'Approved').length} Active</p>
                    </div>
                  </div>
                  <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div class="p-3 bg-blue-50 text-blue-600 rounded-xl">
                      <FileText class="w-6 h-6" />
                    </div>
                    <div>
                      <h4 class="text-slate-400 text-xs font-bold uppercase tracking-wider">Completed Sessions</h4>
                      <p class="text-2xl font-extrabold text-slate-800">{appointments.filter(a => a.status === 'Completed').length} Prescribed</p>
                    </div>
                  </div>
                </div>

                {/* Queue list */}
                <div class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                  <div class="p-6 border-b border-slate-100">
                    <h3 class="font-extrabold text-lg text-slate-800">Active Patient Consult Queue</h3>
                  </div>

                  {appointments.length === 0 ? (
                    <div class="p-12 text-center text-slate-400 font-semibold text-sm">
                      No active bookings registered in your clinical roster.
                    </div>
                  ) : (
                    <div class="overflow-x-auto">
                      <table class="w-full text-left border-collapse">
                        <thead>
                          <tr class="bg-slate-50/50 text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-100">
                            <th class="p-4 pl-6">Patient Name</th>
                            <th class="p-4">Requested Date</th>
                            <th class="p-4">Schedule Time</th>
                            <th class="p-4">Triage Symptoms</th>
                            <th class="p-4">Status</th>
                            <th class="p-4 pr-6">Administrative Actions</th>
                          </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 text-sm">
                          {appointments.map((appt) => (
                            <tr key={appt.id} class="hover:bg-slate-50/50 transition-colors">
                              <td class="p-4 pl-6">
                                <span class="font-bold text-slate-800">{appt.patientName}</span>
                              </td>
                              <td class="p-4 font-semibold text-slate-700">{appt.date}</td>
                              <td class="p-4">
                                <span class="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold flex items-center gap-1 w-fit"><Clock class="w-3.5 h-3.5" /> {appt.timeSlot}</span>
                              </td>
                              <td class="p-4 max-w-xs truncate" title={appt.symptoms}>
                                <span class="text-slate-500 italic font-medium">"{appt.symptoms}"</span>
                              </td>
                              <td class="p-4">
                                <span class={`px-2.5 py-1 text-xs font-bold rounded-full ${appt.status === 'Approved' ? 'bg-green-50 text-green-700' :
                                  appt.status === 'Pending' ? 'bg-amber-50 text-amber-700' :
                                    appt.status === 'Completed' ? 'bg-blue-50 text-blue-700' :
                                      'bg-red-50 text-red-700'
                                  }`}>
                                  {appt.status}
                                </span>
                              </td>
                              <td class="p-4 pr-6">
                                {/* Actions */}
                                <div class="flex gap-2 items-center">
                                  {appt.status === 'Pending' && (
                                    <>
                                      <button
                                        onClick={() => handleStatusUpdate(appt.id, 'Approved')}
                                        class="p-2 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg transition-colors"
                                        title="Approve Slot"
                                      >
                                        <Check class="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => {
                                          setActiveStatusApptId(appt.id);
                                          setNoteState('');
                                        }}
                                        class="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                                        title="Reject Slot"
                                      >
                                        <X class="w-4 h-4" />
                                      </button>
                                    </>
                                  )}

                                  {appt.consultationType === 'VIDEO' && appt.status !== 'CANCELLED' && appt.status !== 'Rejected' && (
                                    <Link
                                      to={`/telehealth-room/${appt.id}`}
                                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-xs"
                                    >
                                      <Video className="w-3.5 h-3.5" /> Start Video
                                    </Link>
                                  )}

                                  {appt.status === 'Approved' && (
                                    <button
                                      onClick={() => {
                                        setShowPrescriptionModal(appt);
                                        setDiagnosis('');
                                        setSymptomsText(appt.symptoms);
                                        setMedsList([]);
                                        setAdvice('');
                                      }}
                                      class="px-3.5 py-1.5 bg-clinical-600 hover:bg-clinical-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-md shadow-clinical-600/10"
                                    >
                                      <NotebookPen class="w-3.5 h-3.5" /> Diagnose & Prescribe
                                    </button>
                                  )}

                                  {appt.status === 'Completed' && (
                                    <span class="text-xs text-slate-400 font-bold uppercase">✔️ Session Closed</span>
                                  )}

                                  {appt.status === 'Rejected' && (
                                    <span class="text-xs text-slate-400">Rejected</span>
                                  )}
                                </div>

                                {/* Rejection notes panel overlay */}
                                {activeStatusApptId === appt.id && (
                                  <div class="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 max-w-[220px]">
                                    <input
                                      type="text"
                                      value={noteState}
                                      onChange={(e) => setNoteState(e.target.value)}
                                      placeholder="Reason for cancellation..."
                                      class="w-full px-2 py-1 text-xs border rounded focus:outline-none"
                                    />
                                    <div class="flex gap-2.5">
                                      <button
                                        onClick={() => handleStatusUpdate(appt.id, 'Rejected')}
                                        class="px-2 py-1 bg-red-600 text-white text-[10px] font-bold rounded"
                                      >
                                        Reject Slot
                                      </button>
                                      <button
                                        onClick={() => setActiveStatusApptId(null)}
                                        class="px-2 py-1 bg-slate-200 text-slate-700 text-[10px] font-bold rounded"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                )}
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

            {/* TAB 2: MANAGE PATIENTS */}
            {activeTab === 'patients' && (
              <div class="space-y-6">
                <div class="space-y-2">
                  <h2 class="text-2xl font-extrabold text-slate-900 font-sans">Active Patient Files Registry</h2>
                  <p class="text-slate-500 text-sm">Access demographic coordinates and history profiles of patients under your current care.</p>
                </div>

                {patients.length === 0 ? (
                  <div class="bg-white rounded-3xl border border-slate-100 p-12 text-center text-slate-400">
                    No clinical patient lists active on your consult schedule.
                  </div>
                ) : (
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {patients.map((pat) => (
                      <div key={pat.id} class="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
                        <div class="flex items-center gap-3">
                          <div class="w-12 h-12 bg-clinical-50 text-clinical-600 rounded-2xl flex items-center justify-center font-bold text-lg">
                            {pat.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 class="font-bold text-slate-800 text-base">{pat.name}</h3>
                            <span class="text-xs text-slate-400">Patient ID: {pat.id}</span>
                          </div>
                        </div>

                        <div class="border-t border-slate-50 pt-3.5 grid grid-cols-2 gap-2 text-xs text-left">
                          <div>
                            <span class="text-slate-400 block font-semibold uppercase text-[9px]">Demographics</span>
                            <span class="font-bold text-slate-700">{pat.gender}, {pat.age} Years</span>
                          </div>
                          <div>
                            <span class="text-slate-400 block font-semibold uppercase text-[9px]">Contact</span>
                            <span class="font-bold text-slate-700">{pat.phone}</span>
                          </div>
                        </div>

                        <div class="bg-slate-50 rounded-xl p-3 text-left">
                          <span class="text-[10px] uppercase font-bold text-slate-400 block mb-1">Email Coordinates</span>
                          <span class="text-xs font-semibold text-slate-600 truncate block">{pat.email}</span>
                        </div>
                        <button
                          onClick={() => handleViewPatientRecords(pat)}
                          class="w-full py-2 bg-clinical-50 hover:bg-clinical-100 text-clinical-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
                        >
                          <FileText class="w-4 h-4" /> View Medical Records
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: AVAILABILITY & SCHEDULE MANAGEMENT */}
            {activeTab === 'schedule' && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <h2 className="text-2xl font-extrabold text-slate-900">Clinical Availability Engine</h2>
                  <p className="text-slate-500 text-sm">Configure your active working days, consult hours, slot duration, and lunch breaks. Patients will automatically book within these generated slots.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Schedule Form */}
                  <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-6">
                    <form onSubmit={handleSaveSchedule} className="space-y-6">
                      {scheduleSaved && (
                        <div className="p-4 bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold rounded-2xl flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-teal-600" />
                          Availability schedule updated successfully! Slot reservations are now synchronized.
                        </div>
                      )}

                      {/* Working Days */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                          Working Days Roster
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                            <button
                              key={day}
                              type="button"
                              onClick={() => toggleWorkingDay(day)}
                              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                                workingDays.includes(day)
                                  ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              {workingDays.includes(day) && <Check className="w-3.5 h-3.5" />}
                              {day}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Shift Hours */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Clinic Start Time</label>
                          <input
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Clinic End Time</label>
                          <input
                            type="time"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Slot Duration & Lunch Break */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Slot Duration</label>
                          <select
                            value={slotDuration}
                            onChange={(e) => setSlotDuration(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
                          >
                            <option value="15">15 Minutes</option>
                            <option value="20">20 Minutes</option>
                            <option value="30">30 Minutes (Recommended)</option>
                            <option value="45">45 Minutes</option>
                            <option value="60">60 Minutes</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Lunch Break Start</label>
                          <input
                            type="time"
                            value={breakStart}
                            onChange={(e) => setBreakStart(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Lunch Break End</label>
                          <input
                            type="time"
                            value={breakEnd}
                            onChange={(e) => setBreakEnd(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="pt-2 flex justify-end">
                        <button
                          type="submit"
                          disabled={scheduleLoading}
                          className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                          <Save className="w-4 h-4" />
                          {scheduleLoading ? 'Saving Schedule...' : 'Save Availability Schedule'}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Schedule Summary Card */}
                  <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-teal-400 text-xs font-extrabold uppercase tracking-widest mb-3">
                        <CalendarDays className="w-4 h-4" /> Current Active Policy
                      </div>
                      <h3 className="text-xl font-bold">{doctorProfile?.name || user?.name}</h3>
                      <p className="text-xs text-slate-400 mt-1">{doctorProfile?.specialization || 'Clinical Specialist'} • {doctorProfile?.department}</p>

                      <div className="mt-6 space-y-3 text-xs">
                        <div className="flex justify-between py-2 border-b border-slate-800">
                          <span className="text-slate-400">Working Days</span>
                          <span className="font-bold text-teal-300">{workingDays.length} Days / Week</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-slate-800">
                          <span className="text-slate-400">Hours</span>
                          <span className="font-bold">{startTime} — {endTime}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-slate-800">
                          <span className="text-slate-400">Slot Duration</span>
                          <span className="font-bold">{slotDuration} mins per patient</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-slate-800">
                          <span className="text-slate-400">Lunch Break</span>
                          <span className="font-bold text-amber-300">{breakStart} — {breakEnd}</span>
                        </div>
                        <div className="flex justify-between py-2">
                          <span className="text-slate-400">Consultation Fee</span>
                          <span className="font-bold text-white">₹{doctorProfile?.fees || 500}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/50 text-[11px] text-slate-300">
                      💡 <strong>Double-Booking Guard Active:</strong> Patients can only reserve vacant slots that don't collide with existing bookings or lunch break hours.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: ISSUED PRESCRIPTIONS */}
            {activeTab === 'prescriptions' && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <h2 className="text-2xl font-extrabold text-slate-900">Clinical Prescriptions Issued</h2>
                  <p className="text-slate-500 text-sm">Review digital prescriptions, medications, and advice records created during patient consultations.</p>
                </div>

                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 text-base">Prescription Archive</h3>
                    <span className="text-xs px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full font-bold">Total: {prescriptions.length}</span>
                  </div>

                  {prescriptions.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 text-sm">
                      No prescriptions issued yet. Approve appointments and use "Diagnose & Prescribe" to issue digital prescriptions.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50/50 text-slate-400 text-xs font-bold uppercase border-b border-slate-100">
                            <th className="p-4 pl-6">Prescription ID</th>
                            <th className="p-4">Patient Name</th>
                            <th className="p-4">Date</th>
                            <th className="p-4">Diagnosis</th>
                            <th className="p-4">Medications</th>
                            <th className="p-4 pr-6">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-700">
                          {prescriptions.map((pres) => (
                            <tr key={pres.id} className="hover:bg-slate-50/50">
                              <td className="p-4 pl-6 text-xs text-slate-400">#{pres.id}</td>
                              <td className="p-4 text-slate-900 font-bold">{pres.patientName}</td>
                              <td className="p-4 text-slate-500">{pres.date}</td>
                              <td className="p-4 text-slate-800">{pres.diagnosis}</td>
                              <td className="p-4">
                                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-xs font-bold">
                                  {pres.medicines ? pres.medicines.length : 0} Items
                                </span>
                              </td>
                              <td className="p-4 pr-6">
                                <button
                                  onClick={() => setViewPrescriptionDetail(pres)}
                                  className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg text-xs font-bold transition flex items-center gap-1"
                                >
                                  <FileDigit className="w-3.5 h-3.5" /> View / Print
                                </button>
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

            {/* TAB 5: PROFESSIONAL PROFILE */}
            {activeTab === 'profile' && (
              <div className="max-w-2xl bg-white rounded-3xl border border-slate-100 p-8 shadow-sm space-y-6">
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 bg-teal-600 text-white rounded-2xl flex items-center justify-center font-bold text-3xl shadow-lg shadow-teal-600/20">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-2xl text-slate-900">{doctorProfile?.name || user?.name}</h3>
                    <p className="text-sm font-bold text-teal-600">{doctorProfile?.specialization || 'Clinical Specialist'} • {doctorProfile?.department}</p>
                    <p className="text-xs text-slate-400 mt-0.5">MediBook AI Verified Healthcare Professional</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 block font-bold uppercase text-[9px]">Experience</span>
                    <span className="font-extrabold text-slate-800 text-sm">{doctorProfile?.experience || 12} Years Active</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold uppercase text-[9px]">Consultation Fee</span>
                    <span className="font-extrabold text-slate-800 text-sm">₹{doctorProfile?.fees || 500}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold uppercase text-[9px]">Email Coordinates</span>
                    <span className="font-semibold text-slate-700">{user?.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold uppercase text-[9px]">Affiliated Facility</span>
                    <span className="font-semibold text-slate-700">Saveetha Medical College & Hospital</span>
                  </div>
                </div>

                <div className="text-xs space-y-1">
                  <span className="text-slate-400 block font-bold uppercase text-[9px]">Professional Bio</span>
                  <p className="text-slate-600 leading-relaxed font-medium bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                    {doctorProfile?.about || "Dedicated practitioner committed to evidence-based healthcare delivery, preventive wellness, and advanced patient outcomes."}
                  </p>
                </div>
              </div>
            )}

          </div>
        )}
      </main>

      {/* Interactive Prescription Generator Modal */}
      {showPrescriptionModal && (
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div class="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden my-8">

            {/* Header */}
            <div class="bg-gradient-to-r from-clinical-700 to-clinical-600 text-white p-6 flex justify-between items-center">
              <div class="text-left">
                <span class="text-xs uppercase font-extrabold tracking-widest text-clinical-200">Electronic Health Record (EHR)</span>
                <h3 class="font-extrabold text-xl">Issue Digital Prescription</h3>
              </div>
              <button
                onClick={() => setShowPrescriptionModal(null)}
                class="text-white hover:text-clinical-200 font-bold text-sm"
              >
                ✕ Close
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitPrescription} class="p-6 sm:p-8 space-y-6 text-left max-h-[70vh] overflow-y-auto">

              {presSuccess ? (
                <div class="py-12 text-center space-y-4">
                  <div class="p-4 bg-green-50 text-green-600 rounded-full w-fit mx-auto text-3xl">
                    ✔️
                  </div>
                  <h3 class="text-2xl font-extrabold text-slate-800">Prescription Issued</h3>
                  <p class="text-sm text-slate-500">Record successfully signed and synced to Patient medical files folder.</p>
                </div>
              ) : (
                <>
                  {presError && (
                    <div class="p-3.5 bg-red-50 text-red-700 text-xs font-semibold rounded-xl text-center">
                      ⚠️ {presError}
                    </div>
                  )}

                  {/* Header Patient details */}
                  <div class="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100 font-medium">
                    <div>
                      <span class="text-slate-400 block uppercase font-bold text-[9px]">Patient Name</span>
                      <span class="font-bold text-slate-700">{showPrescriptionModal.patientName}</span>
                    </div>
                    <div>
                      <span class="text-slate-400 block uppercase font-bold text-[9px]">Symptom Logged</span>
                      <span class="font-bold text-slate-700 truncate block">{showPrescriptionModal.symptoms}</span>
                    </div>
                  </div>

                  {/* Diagnosis */}
                  <div>
                    <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Diagnosis Summary</label>
                    <input
                      type="text"
                      required
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      placeholder="e.g. Acute Bronchitis, Seasonal Viral Influenza"
                      class="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-clinical-500 text-sm font-semibold text-slate-800"
                    />
                  </div>

                  {/* Dynamic Medicine Adder Block */}
                  <div class="border border-slate-100 rounded-2xl p-4 space-y-4 bg-slate-50/50">
                    <span class="block text-xs font-bold text-slate-700 uppercase tracking-wider">Configure Medicines List</span>

                    {/* Adder Inputs */}
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label class="block text-[10px] font-bold text-slate-500 mb-1">Medicine Name</label>
                        <input
                          type="text"
                          value={medName}
                          onChange={(e) => setMedName(e.target.value)}
                          placeholder="Paracetamol 650mg, etc."
                          class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                        />
                      </div>
                      <div>
                        <label class="block text-[10px] font-bold text-slate-500 mb-1">Dosage Frequency</label>
                        <select
                          value={medDosage}
                          onChange={(e) => setMedDosage(e.target.value)}
                          class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                        >
                          <option value="1-0-1">1-0-1 (Morning, Night)</option>
                          <option value="1-1-1">1-1-1 (Morning, Afternoon, Night)</option>
                          <option value="0-0-1">0-0-1 (Night Only)</option>
                          <option value="1-0-0">1-0-0 (Morning Only)</option>
                          <option value="SOS">SOS (As and when required)</option>
                        </select>
                      </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                      <div>
                        <label class="block text-[10px] font-bold text-slate-500 mb-1">Duration</label>
                        <input
                          type="text"
                          value={medDuration}
                          onChange={(e) => setMedDuration(e.target.value)}
                          placeholder="5 Days"
                          class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                        />
                      </div>
                      <div>
                        <label class="block text-[10px] font-bold text-slate-500 mb-1">Instructions</label>
                        <input
                          type="text"
                          value={medInstruction}
                          onChange={(e) => setMedInstruction(e.target.value)}
                          placeholder="After meals"
                          class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                        />
                      </div>
                      <div class="flex items-end">
                        <button
                          type="button"
                          onClick={handleAddMedicine}
                          class="w-full py-2 bg-clinical-600 hover:bg-clinical-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 shadow"
                        >
                          <Plus class="w-3.5 h-3.5" /> Add Medicine
                        </button>
                      </div>
                    </div>

                    {/* Added List Table */}
                    {medsList.length > 0 && (
                      <div class="border border-slate-100 rounded-xl overflow-hidden bg-white">
                        <table class="w-full text-xs text-left">
                          <thead>
                            <tr class="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase">
                              <th class="p-2 pl-4">Medicine Item</th>
                              <th class="p-2">Dosage</th>
                              <th class="p-2">Duration</th>
                              <th class="p-2">Instructions</th>
                              <th class="p-2 pr-4 text-center">Delete</th>
                            </tr>
                          </thead>
                          <tbody class="divide-y divide-slate-100 font-semibold text-slate-700">
                            {medsList.map((m, idx) => (
                              <tr key={idx} class="hover:bg-slate-50/50">
                                <td class="p-2 pl-4 text-slate-900 font-bold">{m.name}</td>
                                <td class="p-2">{m.dosage}</td>
                                <td class="p-2">{m.duration}</td>
                                <td class="p-2 text-slate-500 font-normal">{m.instructions}</td>
                                <td class="p-2 pr-4 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveMedicine(idx)}
                                    class="text-red-500 hover:text-red-600 p-1"
                                  >
                                    ✕
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* General Advice */}
                  <div>
                    <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Lifestyle Clinical Advice</label>
                    <textarea
                      rows="2"
                      value={advice}
                      onChange={(e) => setAdvice(e.target.value)}
                      placeholder="e.g. Complete bed rest, consume high fluids, check back in 5 days."
                      class="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-clinical-500 text-sm"
                    ></textarea>
                  </div>

                  {/* Action submit button */}
                  <button
                    type="submit"
                    class="w-full py-4 bg-gradient-to-r from-clinical-700 to-clinical-500 text-white font-extrabold text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-1.5"
                  >
                    <Save class="w-4 h-4" /> Sign & Lock Digital Prescription
                  </button>
                </>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Patient Medical Records Modal */}
      {viewRecordsPatient && (
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto font-sans">
          <div class="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden my-8">
            {/* Header */}
            <div class="bg-gradient-to-r from-clinical-700 to-clinical-600 text-white p-6 flex justify-between items-center">
              <div class="text-left">
                <span class="text-xs uppercase font-extrabold tracking-widest text-clinical-200">Patient File Archive</span>
                <h3 class="font-extrabold text-xl">{viewRecordsPatient.name}'s Records</h3>
              </div>
              <button
                onClick={() => setViewRecordsPatient(null)}
                class="text-white hover:text-clinical-200 font-bold text-sm"
              >
                ✕ Close
              </button>
            </div>

            {/* Content */}
            <div class="p-6 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              {loadingRecords ? (
                <div class="py-12 flex flex-col items-center justify-center gap-2">
                  <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-clinical-600"></div>
                  <span class="text-xs text-slate-400 font-bold">Loading patient archives...</span>
                </div>
              ) : patientRecords.length === 0 ? (
                <div class="py-12 text-center text-slate-400 italic text-sm">
                  No medical records uploaded by this patient yet.
                </div>
              ) : (
                <div class="space-y-4">
                  {patientRecords.map((rec) => (
                    <div key={rec.id} class="flex justify-between items-center bg-slate-50 border border-slate-100 rounded-2xl p-4 hover:border-slate-200 transition-all text-left">
                      <div class="flex items-center gap-3">
                        <div class="p-2.5 bg-red-50 text-red-500 rounded-xl">
                          <Activity class="w-6 h-6" />
                        </div>
                        <div>
                          {rec.fileUrl ? (
                            <a 
                              href={rec.fileUrl} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              class="font-bold text-clinical-600 hover:text-clinical-700 hover:underline text-sm flex items-center gap-1"
                            >
                              {rec.fileName} <ExternalLink class="w-3.5 h-3.5" />
                            </a>
                          ) : (
                            <h4 class="font-bold text-slate-800 text-sm">{rec.fileName}</h4>
                          )}
                          <p class="text-xs text-slate-500 mt-0.5">{rec.description} • {rec.fileSize} • Uploaded: {rec.uploadedAt}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Doctor Digital Prescription View Modal */}
      {viewPrescriptionDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
            <div className="bg-gradient-to-r from-teal-700 to-teal-600 text-white p-6 flex justify-between items-center">
              <div>
                <span className="text-xs uppercase font-extrabold tracking-widest text-teal-200">Clinical Record</span>
                <h3 className="font-extrabold text-xl">Digital Prescription Preview</h3>
              </div>
              <button
                onClick={() => setViewPrescriptionDetail(null)}
                className="text-white hover:text-teal-200 font-extrabold text-sm"
              >
                ✕ Close
              </button>
            </div>

            <div className="p-8 space-y-6 text-left max-h-[75vh] overflow-y-auto">
              <div className="flex justify-between border-b border-slate-100 pb-4 text-xs font-medium">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-800">{viewPrescriptionDetail.doctorName || user?.name}</h4>
                  <p className="text-slate-500">Department: {doctorProfile?.department || 'Medical Services'}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-500">Date: <span className="font-bold text-slate-700">{viewPrescriptionDetail.date}</span></p>
                  <p className="text-slate-500">Receipt ID: <span className="font-bold text-slate-700">#{viewPrescriptionDetail.id}</span></p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl">
                <div>
                  <span className="text-slate-400 block uppercase font-bold text-[9px]">Patient Name</span>
                  <span className="font-bold text-slate-700">{viewPrescriptionDetail.patientName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase font-bold text-[9px]">Diagnosis Chart</span>
                  <span className="font-bold text-slate-700">{viewPrescriptionDetail.diagnosis}</span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-slate-400 block uppercase font-bold text-[10px] tracking-wider">Prescribed Medicines</span>
                <div className="border border-slate-100 rounded-2xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 font-bold uppercase text-[9px]">
                        <th className="p-3 pl-4">Medicine Item</th>
                        <th className="p-3">Dosage</th>
                        <th className="p-3">Duration</th>
                        <th className="p-3 pr-4">Instructions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {(viewPrescriptionDetail.medicines || []).map((m, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="p-3 pl-4 font-bold text-slate-800">{m.name}</td>
                          <td className="p-3">{m.dosage}</td>
                          <td className="p-3">{m.duration}</td>
                          <td className="p-3 pr-4 font-normal text-slate-500">{m.instructions || "After meals"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {viewPrescriptionDetail.advice && (
                <div className="space-y-1 text-xs">
                  <span className="text-slate-400 block uppercase font-bold text-[10px] tracking-wider">Clinical Lifestyle Advice</span>
                  <p className="text-slate-600 leading-relaxed font-semibold bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    "{viewPrescriptionDetail.advice}"
                  </p>
                </div>
              )}
            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-100 flex gap-3 justify-end">
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> Print Document
              </button>
              <button
                onClick={() => setViewPrescriptionDetail(null)}
                className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
export default DoctorDashboard;
