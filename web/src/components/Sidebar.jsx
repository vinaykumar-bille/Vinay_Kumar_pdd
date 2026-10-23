import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  PlusCircle,
  FileText,
  FolderHeart,
  MessageSquareHeart,
  User,
  Users,
  LineChart,
  UserSquare2,
  ListTodo,
  LogOut,
  Stethoscope,
  Clock,
  Sparkles,
  ShieldCheck,
  Building,
  ClipboardList
} from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();
  const role = (user?.role || '').toUpperCase();

  const patientTabs = [
    { id: 'overview', name: 'Overview', icon: Calendar },
    { id: 'book', name: 'Book Appointment', icon: PlusCircle },
    { id: 'history', name: 'Prescriptions & History', icon: FileText },
    { id: 'records', name: 'Medical Records', icon: FolderHeart },
    { id: 'ai-chat', name: 'AI Health Assistant', icon: MessageSquareHeart },
    { id: 'profile', name: 'My Profile', icon: User }
  ];

  const doctorTabs = [
    { id: 'appointments', name: 'Appointments Queue', icon: ListTodo },
    { id: 'schedule', name: 'Availability & Schedule', icon: Clock },
    { id: 'prescriptions', name: 'Issued Prescriptions', icon: FileText },
    { id: 'patients', name: 'My Patients & History', icon: Users },
    { id: 'profile', name: 'Professional Profile', icon: UserSquare2 }
  ];

  const adminTabs = [
    { id: 'analytics', name: 'Analytics & Reports', icon: LineChart },
    { id: 'doctors', name: 'Doctor Registry', icon: Stethoscope },
    { id: 'specializations', name: 'Specialties Manager', icon: Sparkles },
    { id: 'patients', name: 'Patient Directory', icon: Users },
    { id: 'appointments', name: 'All Appointments', icon: Calendar },
    { id: 'audit', name: 'System Audit Logs', icon: ClipboardList }
  ];

  const getTabs = () => {
    if (role === 'PATIENT') return patientTabs;
    if (role === 'DOCTOR') return doctorTabs;
    if (role === 'ADMIN') return adminTabs;
    return [];
  };

  const getRoleHeader = () => {
    if (role === 'PATIENT') return { title: "Patient Area", subtitle: user?.email, color: "from-blue-600 to-indigo-600" };
    if (role === 'DOCTOR') return { title: "Doctor Clinical Portal", subtitle: "Practitioner Access", color: "from-teal-600 to-blue-600" };
    if (role === 'ADMIN') return { title: "Platform Administration", subtitle: "Super Admin", color: "from-slate-800 to-slate-950" };
    return { title: "MediBook AI", subtitle: "", color: "from-blue-600 to-teal-600" };
  };

  const tabs = getTabs();
  const header = getRoleHeader();

  return (
    <aside className="w-full md:w-64 bg-white border-r border-slate-200/80 flex flex-col min-h-screen shadow-xs">
      {/* Sidebar Header Account Visualizer */}
      <div className={`p-6 bg-gradient-to-br ${header.color} text-white`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/10 font-bold text-lg shadow-sm">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <h3 className="font-bold text-sm truncate">{user?.name}</h3>
            <p className="text-[11px] text-white/80 font-medium truncate">{header.title}</p>
          </div>
        </div>
      </div>

      {/* Tabs Menu Navigation */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition ${
                isSelected
                  ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 pl-3 font-bold'
                  : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
              <span className="truncate">{tab.name}</span>
            </button>
          );
        })}
      </nav>

      {/* Logout Footer anchor */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <button
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-semibold text-xs text-red-600 hover:bg-red-50 hover:text-red-700 transition"
        >
          <LogOut className="w-4 h-4 text-red-500" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
