import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Stethoscope, Key, Mail, ShieldAlert, ArrowLeft, CheckCircle, Sparkles } from 'lucide-react';

export const Login = () => {
  const [role, setRole] = useState('patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Password@123');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const demoAccounts = {
    patient: { name: "Vinay Kumar (Patient)", email: "vinay@gmail.com" },
    doctor: { name: "Dr. Amit Verma (Cardiology)", email: "amit.verma@medibook.ai" },
    receptionist: { name: "Kavita Nair (Front Desk)", email: "receptionist@medibook.ai" },
    admin: { name: "Administrator Chief", email: "admin@medibook.ai" }
  };

  const handleLogin = async (e, devEmail = null) => {
    if (e) e.preventDefault();
    setLocalError('');
    setLoading(true);

    const loginEmail = devEmail || email || demoAccounts[role].email;
    const loginPassword = password || 'Password@123';

    try {
      const user = await login(loginEmail, role, loginPassword);
      const userRole = (user.role || role).toUpperCase();

      // Redirect to correct dashboard
      if (userRole === 'PATIENT') navigate('/patient-dashboard');
      else if (userRole === 'DOCTOR') navigate('/doctor-dashboard');
      else if (userRole === 'RECEPTIONIST') navigate('/receptionist-dashboard');
      else if (userRole === 'ADMIN') navigate('/admin-dashboard');
      else navigate('/');
    } catch (err) {
      setLocalError(err.message || "Invalid credentials for this role in demo database.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl -z-10"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-200/40 rounded-full blur-3xl -z-10"></div>

      {/* Back Button */}
      <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-slate-500 hover:text-blue-600 font-semibold text-sm transition">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <div className="w-full max-w-md bg-white border border-slate-200 shadow-xl rounded-3xl p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-teal-500 text-white rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Stethoscope className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">MediBook AI Portal</h2>
          <p className="text-slate-500 text-xs sm:text-sm">Select your role and sign in with JWT authentication</p>
        </div>

        {/* Role Selector Tabs (Patient, Doctor, Receptionist, Admin) */}
        <div className="grid grid-cols-4 gap-1 p-1.5 bg-slate-100 rounded-2xl">
          {['patient', 'doctor', 'receptionist', 'admin'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => {
                setRole(r);
                setEmail(demoAccounts[r].email);
                setLocalError('');
              }}
              className={`py-2 rounded-xl text-[11px] font-extrabold uppercase tracking-wider transition ${
                role === r
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {r === 'receptionist' ? 'Recep' : r}
            </button>
          ))}
        </div>

        {/* Display Errors */}
        {localError && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-xs text-red-700 font-medium animate-shake">
            <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500" />
            <span>{localError}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={(e) => handleLogin(e)} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={demoAccounts[role].email}
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Password</label>
              <span className="text-[11px] text-blue-600 hover:underline cursor-pointer" onClick={() => alert("For demonstration testing, default test password is: Password@123")}>
                Default: Password@123
              </span>
            </div>
            <div className="relative">
              <Key className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 flex items-center justify-center gap-2 text-sm"
          >
            {loading ? 'Authenticating...' : `Sign In as ${role.toUpperCase()}`}
          </button>
        </form>

        {/* One-Click Quick Login Triggers for Presentation & Review */}
        <div className="border-t border-slate-100 pt-5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              ⚡ 1-Click Quick Demo Login
            </span>
            <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 text-[10px] font-semibold border border-amber-200">
              Exam/Viva Ready
            </span>
          </div>
          <button
            onClick={() => {
              setEmail(demoAccounts[role].email);
              handleLogin(null, demoAccounts[role].email);
            }}
            className="w-full py-3 bg-gradient-to-r from-blue-50 to-teal-50 border border-blue-100 text-blue-700 hover:from-blue-100 hover:to-teal-100 font-bold text-xs rounded-2xl transition flex items-center justify-center gap-2 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Login as: {demoAccounts[role].name}</span>
          </button>
        </div>

        {/* Patient Registration Redirect */}
        <div className="text-center pt-1 border-t border-slate-100">
          <p className="text-xs text-slate-500 font-medium">
            New to MediBook AI?{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-700 font-bold underline">
              Create a free Patient account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
