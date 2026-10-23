import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
  Users, Calendar, Clock, CheckCircle, AlertCircle, PlusCircle, Search,
  Phone, UserCheck, ArrowRight, XCircle, RefreshCw, MapPin, Stethoscope, Video
} from 'lucide-react';

export const ReceptionistDashboard = () => {
  const { user } = useAuth();
  const [queueData, setQueueData] = useState({
    summary: { waitingCount: 0, inConsultationCount: 0, upcomingCount: 0, completedCount: 0 },
    checkedIn: [],
    inConsultation: [],
    upcoming: [],
    completed: []
  });
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('waiting'); // 'waiting', 'in_consultation', 'upcoming', 'completed'
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [notificationMsg, setNotificationMsg] = useState(null);

  // Walk-in Booking Modal State
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [walkInForm, setWalkInForm] = useState({
    name: '',
    phone: '',
    gender: 'Male',
    doctorId: '',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '10:00 AM',
    consultationType: 'IN_PERSON',
    reasonForVisit: 'Walk-in Clinic Consultation'
  });

  // Reschedule & Cancel Modals
  const [rescheduleModal, setRescheduleModal] = useState(null);
  const [cancelModal, setCancelModal] = useState(null);
  const [rescheduleData, setRescheduleData] = useState({ date: '', time: '', reason: '' });
  const [cancelReason, setCancelReason] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [queueRes, docRes] = await Promise.all([
        api.receptionist.getQueue('clinic_1'),
        api.doctors.getAll()
      ]);
      setQueueData(queueRes);
      setDoctors(docRes);
      if (docRes.length > 0 && !walkInForm.doctorId) {
        setWalkInForm(prev => ({ ...prev, doctorId: docRes[0].id }));
      }
    } catch (err) {
      console.error("Error loading receptionist queue:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  const handleCheckIn = async (appointmentId) => {
    try {
      setActionLoading(appointmentId);
      await api.receptionist.checkIn(appointmentId);
      showToast('Patient marked as Checked In and queued for consultation.');
      await loadData();
    } catch (err) {
      alert(err.message || 'Check-in failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCallIn = async (appointmentId) => {
    try {
      setActionLoading(appointmentId);
      await api.receptionist.callIn(appointmentId);
      showToast('Patient moved into Active Doctor Consultation.');
      await loadData();
    } catch (err) {
      alert(err.message || 'Call-in failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleWalkInSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.receptionist.bookWalkIn({
        name: walkInForm.name,
        phone: walkInForm.phone,
        gender: walkInForm.gender,
        doctorId: walkInForm.doctorId,
        appointmentDate: walkInForm.date,
        startTime: walkInForm.timeSlot,
        consultationType: walkInForm.consultationType,
        reasonForVisit: walkInForm.reasonForVisit
      });
      setShowWalkInModal(false);
      showToast(`Walk-in appointment booked for ${walkInForm.name}!`);
      setWalkInForm({
        name: '',
        phone: '',
        gender: 'Male',
        doctorId: doctors[0]?.id || '',
        date: new Date().toISOString().split('T')[0],
        timeSlot: '10:00 AM',
        consultationType: 'IN_PERSON',
        reasonForVisit: 'Walk-in Clinic Consultation'
      });
      await loadData();
    } catch (err) {
      alert(err.message || 'Failed to book walk-in appointment.');
    }
  };

  const handleRescheduleSubmit = async () => {
    if (!rescheduleData.date || !rescheduleData.time) {
      alert('Please select both a new date and time slot.');
      return;
    }
    try {
      await api.appointments.reschedule(
        rescheduleModal.id,
        rescheduleData.date,
        rescheduleData.time,
        rescheduleData.reason || 'Reception desk schedule adjustment'
      );
      setRescheduleModal(null);
      showToast(`Appointment rescheduled to ${rescheduleData.date} at ${rescheduleData.time}.`);
      await loadData();
    } catch (err) {
      alert(err.message || 'Rescheduling failed.');
    }
  };

  const handleCancelSubmit = async () => {
    if (!cancelReason.trim()) {
      alert('Please enter a cancellation reason.');
      return;
    }
    try {
      await api.appointments.cancel(cancelModal.id, cancelReason);
      setCancelModal(null);
      setCancelReason('');
      showToast('Appointment successfully cancelled and slot released.');
      await loadData();
    } catch (err) {
      alert(err.message || 'Cancellation failed.');
    }
  };

  // Filter list according to tab and search
  const getCurrentList = () => {
    let list = [];
    if (activeTab === 'waiting') list = queueData.checkedIn || [];
    else if (activeTab === 'in_consultation') list = queueData.inConsultation || [];
    else if (activeTab === 'upcoming') list = queueData.upcoming || [];
    else if (activeTab === 'completed') list = queueData.completed || [];

    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(item =>
      (item.patientName || '').toLowerCase().includes(q) ||
      (item.appointmentNumber || '').toLowerCase().includes(q) ||
      (item.doctorName || '').toLowerCase().includes(q)
    );
  };

  const currentList = getCurrentList();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Toast Notification */}
        {notificationMsg && (
          <div className="mb-6 p-4 bg-teal-50 border border-teal-200 text-teal-800 rounded-xl flex items-center justify-between shadow-sm animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-teal-600" />
              <span className="font-medium text-sm">{notificationMsg}</span>
            </div>
            <button onClick={() => setNotificationMsg(null)} className="text-teal-600 hover:text-teal-800 font-bold">✕</button>
          </div>
        )}

        {/* Header Banner */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
              <Stethoscope className="w-3.5 h-3.5" />
              Clinic Front Desk Management System
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Reception Desk Queue & Check-In
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Welcome, <span className="font-semibold text-slate-700">{user?.name || 'Reception Coordinator'}</span>. Manage arriving patients, track waiting rooms, and book walk-in appointments.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              className="p-2.5 text-slate-600 hover:text-blue-600 hover:bg-slate-50 border border-slate-200 rounded-xl transition flex items-center gap-1.5 text-sm font-medium"
              title="Refresh Queue"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => setShowWalkInModal(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition flex items-center gap-2 text-sm font-semibold"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Book Walk-In</span>
            </button>
          </div>
        </div>

        {/* Live Clinic Metric Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div
            onClick={() => setActiveTab('waiting')}
            className={`p-5 rounded-2xl border cursor-pointer transition ${
              activeTab === 'waiting'
                ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-400'
                : 'bg-white border-slate-200 hover:border-amber-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Waiting Room</span>
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 font-bold text-sm">
                ⏳
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900">{queueData.summary.waitingCount}</div>
            <p className="text-xs text-slate-500 mt-1">Checked in & waiting for doctor</p>
          </div>

          <div
            onClick={() => setActiveTab('in_consultation')}
            className={`p-5 rounded-2xl border cursor-pointer transition ${
              activeTab === 'in_consultation'
                ? 'bg-blue-50/70 border-blue-300 ring-2 ring-blue-400'
                : 'bg-white border-slate-200 hover:border-blue-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">In Consultation</span>
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                🩺
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900">{queueData.summary.inConsultationCount}</div>
            <p className="text-xs text-slate-500 mt-1">Currently inside cabin</p>
          </div>

          <div
            onClick={() => setActiveTab('upcoming')}
            className={`p-5 rounded-2xl border cursor-pointer transition ${
              activeTab === 'upcoming'
                ? 'bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-400'
                : 'bg-white border-slate-200 hover:border-indigo-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Upcoming Bookings</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                📅
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900">{queueData.summary.upcomingCount}</div>
            <p className="text-xs text-slate-500 mt-1">Confirmed for today</p>
          </div>

          <div
            onClick={() => setActiveTab('completed')}
            className={`p-5 rounded-2xl border cursor-pointer transition ${
              activeTab === 'completed'
                ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-400'
                : 'bg-white border-slate-200 hover:border-emerald-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Completed</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-sm">
                ✓
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900">{queueData.summary.completedCount}</div>
            <p className="text-xs text-slate-500 mt-1">Finished consultations today</p>
          </div>
        </div>

        {/* Tab Controls and Search Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            {/* Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
              <button
                onClick={() => setActiveTab('waiting')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition whitespace-nowrap ${
                  activeTab === 'waiting'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Waiting Room ({queueData.checkedIn?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('in_consultation')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition whitespace-nowrap ${
                  activeTab === 'in_consultation'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                In Consultation ({queueData.inConsultation?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition whitespace-nowrap ${
                  activeTab === 'upcoming'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Upcoming Arrivals ({queueData.upcoming?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition whitespace-nowrap ${
                  activeTab === 'completed'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Completed ({queueData.completed?.length || 0})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search patient or Ref #..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* List Content */}
          <div className="mt-6">
            {loading ? (
              <div className="py-16 text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-slate-500 text-sm mt-3">Refreshing clinic queue...</p>
              </div>
            ) : currentList.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3 text-2xl">
                  📋
                </div>
                <h3 className="text-base font-semibold text-slate-800">No Patients in this Queue Segment</h3>
                <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto">
                  {searchQuery
                    ? `No matching appointments found for "${searchQuery}".`
                    : 'Queue is clear. New check-ins and appointments will appear here in real-time.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="text-xs uppercase bg-slate-50 text-slate-500 border-y border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Ref Number</th>
                      <th className="py-3 px-4">Patient Name</th>
                      <th className="py-3 px-4">Scheduled Doctor</th>
                      <th className="py-3 px-4">Slot Time</th>
                      <th className="py-3 px-4">Mode</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentList.map((appt) => (
                      <tr key={appt.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4 font-mono font-semibold text-blue-600 text-xs">
                          {appt.appointmentNumber || appt.id}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-900">
                          {appt.patientName}
                          {appt.patientPhone && (
                            <div className="text-xs text-slate-400 font-normal flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3" />
                              {appt.patientPhone}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-800">{appt.doctorName}</div>
                          <div className="text-xs text-slate-500">{appt.department}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {appt.startTime}
                          </div>
                          <div className="text-xs text-slate-400">{appt.appointmentDate}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          {appt.consultationType === 'VIDEO' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                              <Video className="w-3 h-3" />
                              Telehealth
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <MapPin className="w-3 h-3" />
                              In-Person
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              appt.status === 'CHECKED_IN'
                                ? 'bg-amber-100 text-amber-800'
                                : appt.status === 'IN_CONSULTATION'
                                ? 'bg-blue-100 text-blue-800 animate-pulse'
                                : appt.status === 'COMPLETED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {appt.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Check In Action for upcoming appointments */}
                            {['CONFIRMED', 'PENDING', 'RESCHEDULED'].includes(appt.status) && (
                              <button
                                onClick={() => handleCheckIn(appt.id)}
                                disabled={actionLoading === appt.id}
                                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold shadow-sm transition flex items-center gap-1"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>Check In</span>
                              </button>
                            )}

                            {/* Call In Action for waiting patients */}
                            {appt.status === 'CHECKED_IN' && (
                              <button
                                onClick={() => handleCallIn(appt.id)}
                                disabled={actionLoading === appt.id}
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition flex items-center gap-1"
                              >
                                <ArrowRight className="w-3.5 h-3.5" />
                                <span>Call In</span>
                              </button>
                            )}

                            {/* Reschedule Button */}
                            {appt.status !== 'COMPLETED' && appt.status !== 'CANCELLED' && (
                              <button
                                onClick={() => {
                                  setRescheduleModal(appt);
                                  setRescheduleData({ date: appt.appointmentDate, time: appt.startTime, reason: '' });
                                }}
                                className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition"
                                title="Reschedule"
                              >
                                <RefreshCw className="w-4 h-4" />
                              </button>
                            )}

                            {/* Cancel Button */}
                            {appt.status !== 'COMPLETED' && appt.status !== 'CANCELLED' && (
                              <button
                                onClick={() => setCancelModal(appt)}
                                className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Cancel"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
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

        {/* Walk-in Booking Modal */}
        {showWalkInModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    +
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Walk-In Patient Registration</h3>
                    <p className="text-xs text-slate-500">Book slot immediately on behalf of front-desk patient</p>
                  </div>
                </div>
                <button onClick={() => setShowWalkInModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>

              <form onSubmit={handleWalkInSubmit} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Patient Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Chandra"
                    value={walkInForm.name}
                    onChange={(e) => setWalkInForm({ ...walkInForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
                    <input
                      type="text"
                      placeholder="+91 98765 00000"
                      value={walkInForm.phone}
                      onChange={(e) => setWalkInForm({ ...walkInForm, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                    <select
                      value={walkInForm.gender}
                      onChange={(e) => setWalkInForm({ ...walkInForm, gender: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Select Physician *</label>
                  <select
                    value={walkInForm.doctorId}
                    onChange={(e) => setWalkInForm({ ...walkInForm, doctorId: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name} — {d.specialization} (Fee: ₹{d.consultationFee})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Appointment Date</label>
                    <input
                      type="date"
                      value={walkInForm.date}
                      onChange={(e) => setWalkInForm({ ...walkInForm, date: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Time Slot</label>
                    <select
                      value={walkInForm.timeSlot}
                      onChange={(e) => setWalkInForm({ ...walkInForm, timeSlot: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="09:00 AM">09:00 AM</option>
                      <option value="09:30 AM">09:30 AM</option>
                      <option value="10:00 AM">10:00 AM</option>
                      <option value="10:30 AM">10:30 AM</option>
                      <option value="11:00 AM">11:00 AM</option>
                      <option value="11:30 AM">11:30 AM</option>
                      <option value="02:00 PM">02:00 PM</option>
                      <option value="02:30 PM">02:30 PM</option>
                      <option value="03:00 PM">03:00 PM</option>
                      <option value="03:30 PM">03:30 PM</option>
                      <option value="04:00 PM">04:00 PM</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Visit / Symptoms</label>
                  <textarea
                    rows={2}
                    value={walkInForm.reasonForVisit}
                    onChange={(e) => setWalkInForm({ ...walkInForm, reasonForVisit: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowWalkInModal(false)}
                    className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition"
                  >
                    Confirm & Queue Patient
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Reschedule Modal */}
        {rescheduleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-1">Reschedule Appointment</h3>
              <p className="text-xs text-slate-500 mb-4">
                Ref: {rescheduleModal.appointmentNumber} | Patient: {rescheduleModal.patientName}
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">New Date</label>
                  <input
                    type="date"
                    value={rescheduleData.date}
                    onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">New Time Slot</label>
                  <select
                    value={rescheduleData.time}
                    onChange={(e) => setRescheduleData({ ...rescheduleData, time: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="03:00 PM">03:00 PM</option>
                    <option value="04:00 PM">04:00 PM</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Rescheduling</label>
                  <input
                    type="text"
                    placeholder="e.g. Patient delayed in traffic"
                    value={rescheduleData.reason}
                    onChange={(e) => setRescheduleData({ ...rescheduleData, reason: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-5 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setRescheduleModal(null)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Close
                </button>
                <button
                  onClick={handleRescheduleSubmit}
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl"
                >
                  Save Reschedule
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cancel Modal */}
        {cancelModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-1">Cancel Appointment</h3>
              <p className="text-xs text-slate-500 mb-4">
                Ref: {cancelModal.appointmentNumber} | Patient: {cancelModal.patientName}
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mandatory Cancellation Reason *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Record why this appointment is being cancelled..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="flex justify-end gap-2 mt-5 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setCancelModal(null)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Keep Appointment
                </button>
                <button
                  onClick={handleCancelSubmit}
                  className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm"
                >
                  Confirm Cancellation
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ReceptionistDashboard;
