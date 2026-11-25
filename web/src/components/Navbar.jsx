import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Stethoscope, Menu, X, LogOut, User, LayoutDashboard, Smartphone } from 'lucide-react';

export const Navbar = () => {
  const { user, logout, isAuthenticated, role } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardPath = () => {
    const r = (role || '').toUpperCase();
    if (r === 'PATIENT') return '/patient-dashboard';
    if (r === 'DOCTOR') return '/doctor-dashboard';
    if (r === 'RECEPTIONIST') return '/receptionist-dashboard';
    if (r === 'ADMIN') return '/admin-dashboard';
    return '/';
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-[#15324F] border border-teal-500/30 rounded-lg text-white flex items-center justify-center shadow-xs">
                <Stethoscope className="w-5 h-5 text-[#087F8C]" />
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight text-[#15324F] flex items-center gap-1">
                  MediFlow<span className="text-[#087F8C]">AI</span>
                </span>
                <span className="hidden sm:block text-[10px] text-slate-500 font-medium tracking-tight -mt-0.5">
                  AI-Powered Healthcare Management
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-7">
            <Link
              to="/"
              className={`font-semibold text-sm transition ${isActive('/') ? 'text-[#087F8C]' : 'text-slate-700 hover:text-[#087F8C]'}`}
            >
              Home
            </Link>
            <a href="/#search-doctors" className="font-semibold text-sm text-slate-700 hover:text-[#087F8C] transition">
              Find Doctors
            </a>
            <a href="/#specializations" className="font-semibold text-sm text-slate-700 hover:text-[#087F8C] transition">
              Specialties
            </a>
            <a href="/#how-it-works" className="font-semibold text-sm text-slate-700 hover:text-[#087F8C] transition">
              How It Works
            </a>
            <a href="/#mobile-app" className="font-semibold text-sm text-slate-700 hover:text-[#087F8C] transition flex items-center gap-1">
              <Smartphone className="w-3.5 h-3.5 text-[#087F8C]" />
              Mobile App
            </a>

            {isAuthenticated ? (
              <div className="flex items-center gap-3.5 border-l border-slate-200 pl-6">
                <Link
                  to={getDashboardPath()}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#15324F] font-semibold text-sm transition"
                >
                  <LayoutDashboard className="w-4 h-4 text-[#087F8C]" />
                  <span>Dashboard</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-200 text-[10px] uppercase font-bold text-slate-800">
                    {role}
                  </span>
                </Link>

                <div className="flex items-center gap-2 text-slate-700 font-medium text-sm">
                  <div className="w-8 h-8 rounded-lg bg-[#15324F] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden lg:inline text-xs font-semibold text-slate-800">{user?.name?.split(' ')[0]}</span>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-50 transition"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 border-l border-slate-200 pl-6">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-[#087F8C] transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-[#087F8C] hover:bg-[#076f7a] rounded-lg transition shadow-xs"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-700 hover:text-slate-900 p-2"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2.5 shadow-md">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 font-semibold text-slate-700 hover:text-[#087F8C]"
          >
            Home
          </Link>
          <a
            href="/#search-doctors"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 font-semibold text-slate-700 hover:text-[#087F8C]"
          >
            Find Doctors
          </a>
          <a
            href="/#specializations"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 font-semibold text-slate-700 hover:text-[#087F8C]"
          >
            Specialties
          </a>
          <a
            href="/#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 font-semibold text-slate-700 hover:text-[#087F8C]"
          >
            How It Works
          </a>

          {isAuthenticated ? (
            <div className="border-t border-slate-200 pt-4 mt-2 space-y-3">
              <Link
                to={getDashboardPath()}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between py-2.5 px-3.5 bg-slate-100 text-[#15324F] rounded-lg font-semibold text-sm"
              >
                <div className="flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4 text-[#087F8C]" />
                  <span>Go to {role} Dashboard</span>
                </div>
                <span className="text-xs">→</span>
              </Link>
              <div className="flex items-center gap-2 px-2 text-slate-800 text-sm font-medium">
                <User className="w-4 h-4 text-[#087F8C]" />
                <span>Signed in as <strong>{user?.name}</strong></span>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left flex items-center gap-2 py-2 px-2 text-red-600 hover:bg-red-50 rounded-lg font-semibold text-sm"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="border-t border-slate-200 pt-4 mt-2 flex flex-col gap-2.5">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 border border-slate-300 rounded-lg text-slate-700 font-semibold text-sm hover:bg-slate-50"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 bg-[#087F8C] text-white rounded-lg font-semibold text-sm shadow-xs"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
