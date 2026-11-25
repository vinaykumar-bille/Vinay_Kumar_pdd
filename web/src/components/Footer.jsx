import React from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, Mail, MapPin, ShieldAlert, Smartphone } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-[#15324F] border border-teal-500/40 rounded-xl text-teal-400 flex items-center justify-center shadow-md">
                <Stethoscope className="w-5 h-5 text-teal-400" />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">
                MediFlow<span className="text-[#087F8C]"> AI</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              <strong>Find Doctors and Book Appointments Online.</strong><br />
              Enterprise-grade digital appointment scheduling, teleconsultation coordination, and clinical management for modern healthcare.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Web & Mobile Synchronized Platform</span>
            </div>
          </div>

          {/* Quick Specialties */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3.5">Clinical Specialties</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="/#search-doctors" className="hover:text-teal-400 transition">Cardiology & Heart Care</a></li>
              <li><a href="/#search-doctors" className="hover:text-teal-400 transition">Orthopedics & Joint Surgery</a></li>
              <li><a href="/#search-doctors" className="hover:text-teal-400 transition">Neurology & Stroke Clinic</a></li>
              <li><a href="/#search-doctors" className="hover:text-teal-400 transition">Dermatology & Skin Aesthetics</a></li>
              <li><a href="/#search-doctors" className="hover:text-teal-400 transition">ENT & Micro Ear Surgery</a></li>
              <li><a href="/#search-doctors" className="hover:text-teal-400 transition">Pediatrics & Neonatal Care</a></li>
            </ul>
          </div>

          {/* Portals & Navigation */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3.5">Integrated Portals</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/login" className="hover:text-teal-400 transition">Patient Booking Portal</Link></li>
              <li><Link to="/login" className="hover:text-teal-400 transition">Doctor Schedule & Prescriptions</Link></li>
              <li><Link to="/login" className="hover:text-teal-400 transition">Receptionist Front Desk Queue</Link></li>
              <li><Link to="/login" className="hover:text-teal-400 transition">Hospital Admin Analytics</Link></li>
              <li><a href="/#mobile-app" className="hover:text-teal-400 transition flex items-center gap-1"><Smartphone className="w-3 h-3 text-teal-400" /> Expo Mobile App (iOS/Android)</a></li>
            </ul>
          </div>

          {/* Contact Details & Emergency */}
          <div className="space-y-3 text-xs">
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3.5">Emergency & Clinic Support</h4>
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-900/60 text-red-300">
              <div className="flex items-center gap-1.5 font-bold text-red-200">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                Emergency Hotline
              </div>
              <div className="text-sm font-extrabold text-white mt-1">Dial 108 / 112 or +91 44 2626 5500</div>
              <p className="text-[10px] text-red-400 mt-1">For acute chest pain, trauma, or breathing distress.</p>
            </div>
            <div className="flex items-start gap-2 text-slate-400">
              <Mail className="w-3.5 h-3.5 text-teal-400 mt-0.5 flex-shrink-0" />
              <span>support@mediflow.ai</span>
            </div>
            <div className="flex items-start gap-2 text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-teal-400 mt-0.5 flex-shrink-0" />
              <span>No. 12, Healthway Boulevard, Saveetha Campus, Chennai, Tamil Nadu, India</span>
            </div>
          </div>
        </div>

        {/* Mandatory Medical and Legal Disclaimer Box */}
        <div className="border-t border-slate-800/80 mt-8 pt-6">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
            <strong className="text-slate-300 block mb-1">Medical and Legal Disclaimer:</strong>
            MediFlow AI is a digital appointment scheduling and healthcare coordination platform. AI-assisted recommendations and specialty guidance are informational and do not constitute medical diagnosis or treatment. Patients should consult qualified healthcare professionals for medical advice. In an emergency, seek immediate local emergency medical assistance rather than waiting for an online appointment. Clinical records and prescriptions may only be created or finalized by appropriately authorized healthcare professionals.
          </div>

          <div className="mt-4 flex flex-col md:flex-row justify-between items-center gap-2 text-[11px] text-slate-500">
            <p>&copy; {new Date().getFullYear()} MediFlow AI Technologies. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link to="/privacy-policy" className="hover:text-teal-400 transition">Privacy Policy</Link>
              <Link to="/terms-and-conditions" className="hover:text-teal-400 transition">Terms and Conditions</Link>
              <span>Security Audits</span>
              <span className="text-teal-400 font-semibold">Production Ready</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
