import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { 
  Users, 
  Stethoscope, 
  Calendar, 
  Plus, 
  Trash2, 
  Edit, 
  LineChart, 
  ShieldAlert, 
  CheckCircle, 
  Search,
  User,
  Heart,
  TrendingUp,
  Sliders,
  Sparkles,
  Download,
  ClipboardList,
  Building2,
  Check
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  Legend
} from 'recharts';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('analytics');

  // Admin Data State
  const [analytics, setAnalytics] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [apptSearch, setApptSearch] = useState('');
  const [docSearch, setDocSearch] = useState('');

  // Specialization CRUD state
  const [showSpecModal, setShowSpecModal] = useState(false);
  const [specName, setSpecName] = useState('');
  const [specDept, setSpecDept] = useState('General Medicine');
  const [specDesc, setSpecDesc] = useState('');
  const [specError, setSpecError] = useState('');
  const [specSuccess, setSpecSuccess] = useState(false);

  // Doctor CRUD state
  const [showDoctorModal, setShowDoctorModal] = useState(false); // true/false
  const [editingDocId, setEditingDocId] = useState(null); // id or null
  const [docName, setDocName] = useState('');
  const [docEmail, setDocEmail] = useState('');
  const [docDept, setDocDept] = useState('General Medicine');
  const [docSpec, setDocSpec] = useState('');
  const [docExp, setDocExp] = useState('');
  const [docFees, setDocFees] = useState('500');
  const [docAbout, setDocAbout] = useState('');
  const [docImage, setDocImage] = useState('');
  const [crudError, setCrudError] = useState('');
  const [crudSuccess, setCrudSuccess] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, [user]);

  const fetchAdminData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [stats, docsList, patsList, apptsList, specsList, logsList] = await Promise.all([
        api.analytics.get(),
        api.doctors.getAll(),
        api.patients.getAll(),
        api.appointments.getAll(),
        api.doctors.getSpecializations().catch(() => []),
        api.analytics.getAuditLogs(50).catch(() => [])
      ]);
      setAnalytics(stats);
      setDoctors(docsList);
      setPatients(patsList);
      setAppointments(apptsList);
      setSpecializations(specsList || []);
      setAuditLogs(logsList || []);
    } catch (e) {
      console.error("Error loading administration details", e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddDoctor = () => {
    setEditingDocId(null);
    setDocName('');
    setDocEmail('');
    setDocDept('General Medicine');
    setDocSpec('');
    setDocExp('');
    setDocFees('500');
    setDocAbout('');
    setDocImage('');
    setCrudError('');
    setCrudSuccess(false);
    setShowDoctorModal(true);
  };

  const handleOpenEditDoctor = (doc) => {
    setEditingDocId(doc.id);
    setDocName(doc.name);
    setDocEmail(doc.email);
    setDocDept(doc.department);
    setDocSpec(doc.specialization);
    setDocExp(doc.experience.toString());
    setDocFees(doc.fees.toString());
    setDocAbout(doc.about || '');
    setDocImage(doc.imageUrl || '');
    setCrudError('');
    setCrudSuccess(false);
    setShowDoctorModal(true);
  };

  const handleDoctorSubmit = async (e) => {
    e.preventDefault();
    setCrudError('');
    setCrudSuccess(false);

    if (!docName || !docEmail || !docSpec) {
      setCrudError("Please fill out Name, Email and Specialization.");
      return;
    }

    const payload = {
      name: docName,
      email: docEmail,
      department: docDept,
      specialization: docSpec,
      experience: Number(docExp) || 5,
      fees: Number(docFees) || 500,
      about: docAbout || "Healthcare Specialist",
      imageUrl: docImage || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400"
    };

    try {
      if (editingDocId) {
        await api.doctors.update(editingDocId, payload);
      } else {
        // Mock add weekdays availability
        payload.availableDays = ["Monday", "Wednesday", "Friday"];
        payload.availableTimeSlots = ["09:00 AM", "11:00 AM", "02:00 PM", "04:00 PM"];
        await api.doctors.create(payload);
      }

      setCrudSuccess(true);
      setTimeout(() => {
        setShowDoctorModal(false);
        fetchAdminData();
      }, 1500);
    } catch (err) {
      setCrudError("Failed to save doctor details in registry.");
    }
  };

  const handleDoctorDelete = async (id) => {
    if (confirm("Permanently delete this doctor profile from registry files?")) {
      try {
        await api.doctors.delete(id);
        fetchAdminData();
      } catch (err) {
        alert("Failed to delete record.");
      }
    }
  };

  const departments = [
    "Cardiology", "Orthopedics", "ENT", "Neurology", "Dermatology", "Pediatrics", "General Medicine"
  ];

  const handleCreateSpecialization = async (e) => {
    e.preventDefault();
    if (!specName || !specDept) {
      setSpecError("Specialization name and department are required.");
      return;
    }
    setSpecError('');
    try {
      const created = await api.doctors.createSpecialization({
        name: specName,
        department: specDept,
        description: specDesc || `${specName} specialist care and consultations.`
      });
      setSpecializations(prev => [...prev, created]);
      setSpecSuccess(true);
      setTimeout(() => {
        setSpecSuccess(false);
        setShowSpecModal(false);
        setSpecName('');
        setSpecDesc('');
      }, 1500);
    } catch (err) {
      setSpecError(err.response?.data?.error || err.message || "Failed to add specialization.");
    }
  };

  // Recharts Custom Styling Color
  const barColors = ['#0ea5e9', '#0d9488', '#6366f1', '#ec4899', '#f59e0b', '#8b5cf6', '#ef4444'];

  return (
    <div class="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Panel Area */}
      <main class="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full text-left">
        
        {loading ? (
          <div class="h-full flex items-center justify-center py-20">
            <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-700"></div>
          </div>
        ) : (
          <div class="space-y-8">
            
            {/* Header Visualizer */}
            <div class="bg-gradient-to-r from-slate-800 to-slate-900 rounded-3xl p-8 text-white shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span class="text-xs uppercase font-extrabold tracking-widest text-slate-400">System Admin Control Room</span>
                <h2 class="text-3xl font-extrabold mt-1">Hello, Chief Admin!</h2>
                <p class="text-slate-400 text-sm mt-1">Oversee global scheduling trends, manage medical practitioners, and verify patient metrics.</p>
              </div>
            </div>

            {/* TAB 1: ANALYTICS BOARD */}
            {activeTab === 'analytics' && (
              <div class="space-y-8">
                {/* Stats Widgets */}
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div class="p-3 bg-blue-50 text-blue-600 rounded-xl">
                      <Users class="w-6 h-6" />
                    </div>
                    <div>
                      <h4 class="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Patients</h4>
                      <p class="text-2xl font-extrabold text-slate-800">{analytics?.totalPatients} Files</p>
                    </div>
                  </div>
                  <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div class="p-3 bg-teal-50 text-teal-600 rounded-xl">
                      <Stethoscope class="w-6 h-6" />
                    </div>
                    <div>
                      <h4 class="text-slate-400 text-xs font-bold uppercase tracking-wider">On-Duty Doctors</h4>
                      <p class="text-2xl font-extrabold text-slate-800">{analytics?.totalDoctors} Active</p>
                    </div>
                  </div>
                  <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div class="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                      <Calendar class="w-6 h-6" />
                    </div>
                    <div>
                      <h4 class="text-slate-400 text-xs font-bold uppercase tracking-wider">Appointments Logged</h4>
                      <p class="text-2xl font-extrabold text-slate-800">{analytics?.totalAppointments} Total</p>
                    </div>
                  </div>
                </div>

                {/* Recharts Graphical Section */}
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Line/Area Chart Trend */}
                  <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                    <h3 class="font-extrabold text-base text-slate-800 flex items-center gap-2">
                      <TrendingUp class="w-5 h-5 text-hospital-600" />
                      Weekly Bookings & Check-ups Trend
                    </h3>
                    <div class="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={analytics?.trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorAppts" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                          <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                          <Area type="monotone" dataKey="appointments" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorAppts)" strokeWidth={2.5} name="Total Appointments" />
                          <Area type="monotone" dataKey="completed" stroke="#10b981" fillOpacity={1} fill="url(#colorComp)" strokeWidth={2.5} name="Completed Sessions" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Specialty Distribution Bar Chart */}
                  <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                    <h3 class="font-extrabold text-base text-slate-800 flex items-center gap-2">
                      <Heart class="w-5 h-5 text-clinical-600" />
                      Physicians Split by Department
                    </h3>
                    <div class="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analytics?.departmentStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                          <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                          <Bar dataKey="value" name="Doctors Count" radius={[6, 6, 0, 0]}>
                            {analytics?.departmentStats.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: MANAGE DOCTORS */}
            {activeTab === 'doctors' && (
              <div class="space-y-6">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div class="space-y-1">
                    <h2 class="text-2xl font-extrabold text-slate-900">Physicians Registry Files</h2>
                    <p class="text-slate-500 text-sm">Add clinical staff, edit experience tags, or archive profiles.</p>
                  </div>
                  <button
                    onClick={handleOpenAddDoctor}
                    class="px-5 py-3 bg-hospital-600 hover:bg-hospital-700 text-white rounded-2xl font-bold text-sm shadow-md transition-all flex items-center gap-1.5"
                  >
                    <Plus class="w-4 h-4" /> Add New Doctor
                  </button>
                </div>

                {/* Search Bar */}
                <div class="relative max-w-md">
                  <Search class="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={docSearch}
                    onChange={(e) => setDocSearch(e.target.value)}
                    placeholder="Search doctor by name or specialty..."
                    class="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-hospital-500 text-sm font-semibold"
                  />
                </div>

                {/* Grid Lists */}
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {doctors
                    .filter(d => d.name.toLowerCase().includes(docSearch.toLowerCase()) || d.specialization.toLowerCase().includes(docSearch.toLowerCase()))
                    .map((doc) => (
                      <div key={doc.id} class="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4 text-center relative overflow-hidden">
                        <span class="absolute top-4 right-4 text-[9px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-bold uppercase">{doc.id}</span>
                        <img
                          src={doc.imageUrl}
                          alt={doc.name}
                          class="w-20 h-20 rounded-2xl mx-auto object-cover border shadow-inner"
                        />
                        <div>
                          <h3 class="font-extrabold text-slate-800 text-base">{doc.name}</h3>
                          <p class="text-xs text-hospital-600 font-bold uppercase tracking-wider">{doc.department}</p>
                          <span class="text-xs text-slate-400 font-medium">{doc.specialization}</span>
                        </div>

                        <div class="border-t border-b border-slate-50 py-3 grid grid-cols-2 gap-2 text-xs text-slate-500 font-medium">
                          <div>
                            <span>Experience</span>
                            <p class="font-bold text-slate-800">{doc.experience} Years</p>
                          </div>
                          <div>
                            <span>Consult Fee</span>
                            <p class="font-bold text-slate-800">₹{doc.fees}</p>
                          </div>
                        </div>

                        {/* Roster Actions */}
                        <div class="flex gap-2">
                          <button
                            onClick={() => handleOpenEditDoctor(doc)}
                            class="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1"
                          >
                            <Edit class="w-3.5 h-3.5" /> Edit Profile
                          </button>
                          <button
                            onClick={() => handleDoctorDelete(doc.id)}
                            class="p-2.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-xl transition-all"
                            title="Delete Doctor"
                          >
                            <Trash2 class="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            )}

            {/* TAB 3: VIEW PATIENTS */}
            {activeTab === 'patients' && (
              <div class="space-y-6">
                <div class="space-y-1 text-left">
                  <h2 class="text-2xl font-extrabold text-slate-900">Patients demographic index</h2>
                  <p class="text-slate-500 text-sm">View full list of patients registered in the clinical directory files.</p>
                </div>

                <div class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                  <div class="p-6 border-b border-slate-100">
                    <h3 class="font-bold text-slate-800 text-base">Registered Demographics</h3>
                  </div>

                  {patients.length === 0 ? (
                    <div class="p-12 text-center text-slate-400">No patients logged in records folder.</div>
                  ) : (
                    <div class="overflow-x-auto">
                      <table class="w-full text-left border-collapse">
                        <thead>
                          <tr class="bg-slate-50/50 text-slate-400 text-xs font-bold uppercase border-b border-slate-100">
                            <th class="p-4 pl-6">Patient ID</th>
                            <th class="p-4">Patient Name</th>
                            <th class="p-4">Email Coordinates</th>
                            <th class="p-4">Gender</th>
                            <th class="p-4">Age</th>
                            <th class="p-4 pr-6">Contact Number</th>
                          </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 text-sm font-semibold text-slate-700">
                          {patients.map((pat) => (
                            <tr key={pat.id} class="hover:bg-slate-50/50">
                              <td class="p-4 pl-6 text-slate-400 text-xs">{pat.id}</td>
                              <td class="p-4 text-slate-900 font-bold">{pat.name}</td>
                              <td class="p-4 text-slate-500 font-normal">{pat.email}</td>
                              <td class="p-4">{pat.gender}</td>
                              <td class="p-4">{pat.age} Years</td>
                              <td class="p-4 pr-6 font-mono text-xs">{pat.phone}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: ALL APPOINTMENTS */}
            {activeTab === 'appointments' && (
              <div class="space-y-6">
                <div class="space-y-1 text-left">
                  <h2 class="text-2xl font-extrabold text-slate-900">System Appointments Log</h2>
                  <p class="text-slate-500 text-sm">Review full lists of scheduled consult slots across Cardiology, Orthopedics, ENT, Pediatrics, General Medicine, Neurology, and Dermatology.</p>
                </div>

                {/* Filter Search & CSV Export */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="relative max-w-md w-full">
                    <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={apptSearch}
                      onChange={(e) => setApptSearch(e.target.value)}
                      placeholder="Search appointment by patient or doctor..."
                      className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-hospital-500 text-sm font-semibold"
                    />
                  </div>
                  <a
                    href={api.analytics.exportAppointmentsUrl}
                    download="medibook_appointments.csv"
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                  >
                    <Download className="w-4 h-4" /> Export CSV Report
                  </a>
                </div>

                <div class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                  <div class="p-6 border-b border-slate-100">
                    <h3 class="font-bold text-slate-800 text-base">Global Appointment Ledger</h3>
                  </div>

                  {appointments.length === 0 ? (
                    <div class="p-12 text-center text-slate-400">No appointments registered.</div>
                  ) : (
                    <div class="overflow-x-auto">
                      <table class="w-full text-left border-collapse">
                        <thead>
                          <tr class="bg-slate-50/50 text-slate-400 text-xs font-bold uppercase border-b border-slate-100">
                            <th class="p-4 pl-6">ID</th>
                            <th class="p-4">Patient Name</th>
                            <th class="p-4">Assigned Doctor</th>
                            <th class="p-4">Specialty</th>
                            <th class="p-4">Date & Time</th>
                            <th class="p-4 pr-6">Status</th>
                          </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 text-sm font-semibold text-slate-700">
                          {appointments
                            .filter(a => a.patientName.toLowerCase().includes(apptSearch.toLowerCase()) || a.doctorName.toLowerCase().includes(apptSearch.toLowerCase()))
                            .map((appt) => (
                              <tr key={appt.id} class="hover:bg-slate-50/50">
                                <td class="p-4 pl-6 text-slate-400 text-xs">{appt.id}</td>
                                <td class="p-4 text-slate-900 font-bold">{appt.patientName}</td>
                                <td class="p-4 text-slate-800">{appt.doctorName}</td>
                                <td class="p-4">
                                  <span class="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">{appt.department}</span>
                                </td>
                                <td class="p-4">
                                  <span class="block">{appt.date}</span>
                                  <span class="text-xs text-slate-400 font-normal">{appt.timeSlot}</span>
                                </td>
                                <td class="p-4 pr-6">
                                  <span class={`px-2 py-0.5 text-xs font-bold rounded-full ${
                                    appt.status === 'Approved' ? 'bg-green-50 text-green-700' :
                                    appt.status === 'Pending' ? 'bg-amber-50 text-amber-700' :
                                    appt.status === 'Completed' ? 'bg-blue-50 text-blue-700' :
                                    'bg-red-50 text-red-700'
                                  }`}>
                                    {appt.status}
                                  </span>
                                </td>
                              </tr>
                            ))
                          }
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 5: SPECIALIZATIONS MANAGEMENT */}
            {activeTab === 'specializations' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-extrabold text-slate-900">Medical Specializations</h2>
                    <p className="text-slate-500 text-sm">Configure clinical departments, specialization branches, and treatment categories.</p>
                  </div>
                  <button
                    onClick={() => setShowSpecModal(true)}
                    className="px-5 py-3 bg-hospital-600 hover:bg-hospital-700 text-white rounded-2xl font-bold text-sm shadow-md transition flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Add Specialization
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {specializations.map((spec) => (
                    <div key={spec.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-bold text-xl">
                          {spec.icon || '🩺'}
                        </div>
                        <div>
                          <h3 className="font-extrabold text-slate-900 text-base">{spec.name}</h3>
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-md">
                            {spec.department}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {spec.description}
                      </p>
                      <div className="border-t border-slate-50 pt-3 flex justify-between text-xs text-slate-400">
                        <span>Active Specialists</span>
                        <span className="font-bold text-slate-700">
                          {doctors.filter(d => d.department === spec.department || d.specialization === spec.name).length} Doctors
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 6: SYSTEM AUDIT LOGS */}
            {activeTab === 'audit' && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <h2 className="text-2xl font-extrabold text-slate-900">System Security Audit Logs</h2>
                  <p className="text-slate-500 text-sm">Immutable chronological trace of appointments, slot locks, cancellations, prescriptions, and administrative updates.</p>
                </div>

                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 text-base">Security & Activity Ledger</h3>
                    <span className="text-xs px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full font-bold">
                      Recent {auditLogs.length} Events
                    </span>
                  </div>

                  {auditLogs.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 text-sm">No audit logs recorded yet.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50/50 text-slate-400 text-xs font-bold uppercase border-b border-slate-100">
                            <th className="p-4 pl-6">Timestamp</th>
                            <th className="p-4">Action</th>
                            <th className="p-4">Entity Type</th>
                            <th className="p-4">Performed By</th>
                            <th className="p-4 pr-6">Activity Details</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                          {auditLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-slate-50/50 font-mono">
                              <td className="p-4 pl-6 text-slate-400">
                                {new Date(log.timestamp).toLocaleString()}
                              </td>
                              <td className="p-4">
                                <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                                  log.action.includes('BOOK') ? 'bg-blue-50 text-blue-700' :
                                  log.action.includes('CANCEL') ? 'bg-red-50 text-red-700' :
                                  log.action.includes('RESCHEDULE') ? 'bg-amber-50 text-amber-700' :
                                  log.action.includes('PRESCRIPTION') ? 'bg-teal-50 text-teal-700' :
                                  'bg-slate-100 text-slate-700'
                                }`}>
                                  {log.action}
                                </span>
                              </td>
                              <td className="p-4 font-semibold text-slate-800">{log.entityType}</td>
                              <td className="p-4 text-slate-600">{log.performedBy || 'System'}</td>
                              <td className="p-4 pr-6 text-slate-600 font-sans">{log.details}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        )}
      </main>

      {/* Doctor CRUD overlay Modal */}
      {showDoctorModal && (
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div class="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden my-8">
            
            {/* Header */}
            <div class="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-6 flex justify-between items-center">
              <div class="text-left">
                <span class="text-xs uppercase font-extrabold tracking-widest text-slate-400">Clinical Directory Operations</span>
                <h3 class="font-extrabold text-xl">{editingDocId ? 'Modify Doctor Profile' : 'Add New Physician Profile'}</h3>
              </div>
              <button 
                onClick={() => setShowDoctorModal(false)}
                class="text-white hover:text-slate-300 font-bold text-sm"
              >
                ✕ Close
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleDoctorSubmit} class="p-6 sm:p-8 space-y-4 text-left max-h-[70vh] overflow-y-auto">
              
              {crudSuccess ? (
                <div class="py-12 text-center space-y-4">
                  <div class="p-4 bg-green-50 text-green-600 rounded-full w-fit mx-auto text-3xl">
                    ✔️
                  </div>
                  <h3 class="text-2xl font-extrabold text-slate-800">Registry Updated</h3>
                  <p class="text-sm text-slate-500">The physician credentials have been written successfully to the system.</p>
                </div>
              ) : (
                <>
                  {crudError && (
                    <div class="p-3.5 bg-red-50 text-red-700 text-xs font-semibold rounded-xl text-center">
                      ⚠️ {crudError}
                    </div>
                  )}

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Physician Full Name</label>
                      <input
                        type="text"
                        required
                        value={docName}
                        onChange={(e) => setDocName(e.target.value)}
                        placeholder="e.g. Dr. Rohan Mehta"
                        class="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-700 text-sm font-semibold"
                      />
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Email Coordinates</label>
                      <input
                        type="email"
                        required
                        value={docEmail}
                        onChange={(e) => setDocEmail(e.target.value)}
                        placeholder="name@gmail.com"
                        class="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-700 text-sm"
                      />
                    </div>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Department Specialty</label>
                      <select
                        value={docDept}
                        onChange={(e) => setDocDept(e.target.value)}
                        class="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-700 text-sm bg-white font-medium text-slate-800"
                      >
                        {departments.map((d, i) => (
                          <option key={i} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Detailed Specialization</label>
                      <input
                        type="text"
                        required
                        value={docSpec}
                        onChange={(e) => setDocSpec(e.target.value)}
                        placeholder="e.g. Pediatric Critical Care"
                        class="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-700 text-sm"
                      />
                    </div>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Experience (Years)</label>
                      <input
                        type="number"
                        required
                        value={docExp}
                        onChange={(e) => setDocExp(e.target.value)}
                        placeholder="10"
                        min="1"
                        class="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-700 text-sm"
                      />
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Consultation Fee (INR)</label>
                      <input
                        type="number"
                        required
                        value={docFees}
                        onChange={(e) => setDocFees(e.target.value)}
                        placeholder="600"
                        min="100"
                        class="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-700 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Visual Image URL</label>
                    <input
                      type="url"
                      value={docImage}
                      onChange={(e) => setDocImage(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-xxxxx..."
                      class="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-700 text-sm"
                    />
                  </div>

                  <div>
                    <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Bio / Professional Summary</label>
                    <textarea
                      rows="3"
                      value={docAbout}
                      onChange={(e) => setDocAbout(e.target.value)}
                      placeholder="Outline physician credentials and expertise bio..."
                      class="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-700 text-sm"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    class="w-full py-4 bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-sm rounded-2xl shadow-lg transition-all"
                  >
                    {editingDocId ? 'Save Doctor Changes' : 'Append Doctor Record'}
                  </button>
                </>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Add Specialization Modal */}
      {showSpecModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
            <div className="bg-gradient-to-r from-hospital-700 to-hospital-600 text-white p-6 flex justify-between items-center">
              <div>
                <span className="text-xs uppercase font-extrabold tracking-widest text-hospital-200">Catalog Management</span>
                <h3 className="font-extrabold text-xl">New Specialization</h3>
              </div>
              <button
                onClick={() => setShowSpecModal(false)}
                className="text-white hover:text-hospital-200 font-extrabold text-sm"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleCreateSpecialization} className="p-6 space-y-4 text-left">
              {specSuccess ? (
                <div className="p-4 bg-green-50 text-green-700 text-xs font-bold rounded-xl text-center">
                  Specialization registered successfully!
                </div>
              ) : (
                <>
                  {specError && (
                    <div className="p-3 bg-red-50 text-red-700 text-xs font-bold rounded-xl">
                      {specError}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Specialization Name
                    </label>
                    <input
                      type="text"
                      required
                      value={specName}
                      onChange={(e) => setSpecName(e.target.value)}
                      placeholder="e.g. Interventional Cardiology, Pediatric Neurology"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-hospital-500 focus:outline-none font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Parent Department
                    </label>
                    <select
                      value={specDept}
                      onChange={(e) => setSpecDept(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-hospital-500 focus:outline-none font-semibold bg-white"
                    >
                      {departments.map((d, i) => (
                        <option key={i} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Clinical Scope & Description
                    </label>
                    <textarea
                      rows={3}
                      value={specDesc}
                      onChange={(e) => setSpecDesc(e.target.value)}
                      placeholder="Describe conditions treated and medical scope..."
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-hospital-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex gap-3 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setShowSpecModal(false)}
                      className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-hospital-600 hover:bg-hospital-700 text-white font-bold text-xs rounded-xl shadow-md transition"
                    >
                      Save Specialization
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
export default AdminDashboard;
