import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Scale, AlertTriangle, Video, ShieldCheck, UserCheck, Calendar } from 'lucide-react';

export const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full space-y-8">
        {/* Header */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xs space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-teal-50 text-teal-700 text-xs font-semibold">
            <Scale className="w-4 h-4 text-teal-600" />
            <span>MediFlow AI Terms of Service</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Terms and Conditions</h1>
          <p className="text-sm text-slate-500">
            Effective Date: October 2026 | Last Updated: November 2026
          </p>
          <p className="text-sm text-slate-600 leading-relaxed pt-2">
            These Terms and Conditions govern your access to and use of the MediFlow AI digital appointment scheduling platform, teleconsultation services, patient and clinical dashboards, and AI-enabled healthcare coordination tools. By registering an account or booking a consultation, you agree to comply with these terms.
          </p>
        </div>

        {/* Section 1: Medical Disclaimer */}
        <section className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-3 text-slate-900 font-bold text-lg">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h2>1. Critical Medical Disclaimer & Emergency Situations</h2>
          </div>
          <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs font-medium leading-relaxed">
              <strong>DO NOT USE THIS PLATFORM FOR MEDICAL EMERGENCIES:</strong> If you are experiencing symptoms such as severe chest pain, sudden numbness or weakness, acute shortness of breath, heavy bleeding, or loss of consciousness, immediately dial your local emergency hotline (such as 108, 112, or 911) or proceed to the nearest hospital emergency room.
            </div>
            <p>
              MediFlow AI is a scheduling, coordination, and administrative platform. AI suggestions and symptom triage responses are informational aids and cannot replace clinical judgment, in-person examination, or laboratory diagnosis by a licensed physician.
            </p>
          </div>
        </section>

        {/* Section 2: Telehealth Consent */}
        <section className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-3 text-slate-900 font-bold text-lg">
            <Video className="w-5 h-5 text-teal-600" />
            <h2>2. Informed Telehealth Consent</h2>
          </div>
          <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
            <p>By scheduling or participating in a video teleconsultation via MediFlow AI, you acknowledge and agree that:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Telehealth involves digital communication of medical data, video, and audio between patient and doctor.</li>
              <li>Remote consultations have inherent physical examination limitations. The consulting physician reserves full professional discretion to determine that an in-person physical examination or emergency referral is required.</li>
              <li>You are responsible for ensuring a private, quiet, and secure environment during your virtual visit to protect your confidential health discussions.</li>
              <li>Network dropouts or technological interruptions may occasionally occur. If disconnected, you should reconnect or contact customer support for schedule adjustments.</li>
            </ul>
          </div>
        </section>

        {/* Section 3: Appointment Scheduling, Cancellations & Rescheduling */}
        <section className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-3 text-slate-900 font-bold text-lg">
            <Calendar className="w-5 h-5 text-teal-600" />
            <h2>3. Appointments, Cancellations, and Rescheduling Policy</h2>
          </div>
          <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Real-Time Slot Reservation:</strong> Time slots are reserved atomically upon confirmed booking. Double bookings are systematically prevented.</li>
              <li><strong>Cancellations:</strong> Patients and clinic staff may cancel an appointment up to 2 hours prior to the scheduled consultation time. Cancellations must include a recorded reason.</li>
              <li><strong>Rescheduling:</strong> Appointments may be rescheduled to any available future slot within the doctor's active schedule, preserving clinical continuity.</li>
              <li><strong>Past Dates:</strong> The system strictly prohibits backdated bookings or retroactive appointments.</li>
            </ul>
          </div>
        </section>

        {/* Section 4: User Responsibilities & Conduct */}
        <section className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-3 text-slate-900 font-bold text-lg">
            <UserCheck className="w-5 h-5 text-teal-600" />
            <h2>4. User Responsibilities & Account Security</h2>
          </div>
          <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
            <ul className="list-disc pl-5 space-y-1.5">
              <li>You agree to provide true, accurate, current, and complete demographic and health information during registration and booking.</li>
              <li>You are responsible for maintaining the confidentiality of your login credentials and for all activities conducted through your authenticated account.</li>
              <li>Impersonation of another patient or healthcare provider, unauthorized access attempts, or tampering with clinical records is strictly prohibited and constitutes grounds for immediate account termination and legal action.</li>
            </ul>
          </div>
        </section>

        {/* Section 5: Governing Law & Dispute Resolution */}
        <section className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xs space-y-3">
          <h2 className="text-slate-900 font-bold text-base">5. Governing Law & Contact</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            These terms are governed by and construed in accordance with the laws of India. For questions or concerns regarding these Terms and Conditions, please contact <span className="font-semibold text-teal-700">legal@mediflow.ai</span>.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default TermsAndConditions;
