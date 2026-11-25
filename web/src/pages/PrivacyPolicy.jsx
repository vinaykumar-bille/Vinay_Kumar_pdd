import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ShieldCheck, Lock, Eye, FileText, Database, UserCheck } from 'lucide-react';

export const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full space-y-8">
        {/* Header */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xs space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-teal-50 text-teal-700 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>MediFlow AI Compliance & Security</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Privacy Policy</h1>
          <p className="text-sm text-slate-500">
            Effective Date: October 2026 | Last Updated: November 2026
          </p>
          <p className="text-sm text-slate-600 leading-relaxed pt-2">
            At MediFlow AI, we treat the protection of your personal health information (PHI) and clinical data with the highest standard of security and ethical responsibility. This Privacy Policy details how we collect, store, safeguard, and process your information across our web portal, mobile application, and connected clinical microservices.
          </p>
        </div>

        {/* Section 1: Data Collection & Use */}
        <section className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-3 text-slate-900 font-bold text-lg">
            <Database className="w-5 h-5 text-teal-600" />
            <h2>1. Information We Collect</h2>
          </div>
          <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
            <p>We collect only the minimum necessary information required to facilitate doctor appointments, telehealth sessions, and digital prescription workflows:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Account Credentials:</strong> Full name, verified email address, phone number, role, and salted password hash.</li>
              <li><strong>Clinical Profile:</strong> Date of birth, gender, blood group, drug allergies, and past consultation history.</li>
              <li><strong>Appointment Data:</strong> Chosen healthcare specialist, department, appointment date, scheduled time slot, consultation mode (in-person or video), and stated reason for visit.</li>
              <li><strong>Medical Records:</strong> Lab reports, diagnostic images, and documents securely uploaded with explicit patient authorization.</li>
            </ul>
          </div>
        </section>

        {/* Section 2: HIPAA & GDPR Alignment */}
        <section className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-3 text-slate-900 font-bold text-lg">
            <Lock className="w-5 h-5 text-teal-600" />
            <h2>2. Regulatory Compliance & Data Security (HIPAA & GDPR)</h2>
          </div>
          <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
            <p>
              MediFlow AI implements stringent administrative, physical, and technical safeguards in alignment with the Health Insurance Portability and Accountability Act (HIPAA) security guidelines and the General Data Protection Regulation (GDPR):
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Encryption in Transit:</strong> All HTTP traffic is protected by TLS 1.3 encryption. Video consultations use peer-to-peer WebRTC encryption.</li>
              <li><strong>Encryption at Rest:</strong> Patient records and database storage utilize AES-256 cryptographic standards.</li>
              <li><strong>Role-Based Access Control (RBAC):</strong> Access to medical records is strictly partitioned. Patients access only their own charts; physicians access only patients scheduled on their clinical roster.</li>
              <li><strong>Audit Logging:</strong> All access events, prescription creations, and status modifications are recorded in immutable system audit trails.</li>
            </ul>
          </div>
        </section>

        {/* Section 3: Patient Data Ownership */}
        <section className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-3 text-slate-900 font-bold text-lg">
            <UserCheck className="w-5 h-5 text-teal-600" />
            <h2>3. Patient Data Ownership & Rights</h2>
          </div>
          <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
            <p>
              You maintain sovereign ownership of your health records. As a MediFlow AI user, you are entitled to:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Inspect and download a complete copy of your appointment history, digital prescriptions, and uploaded lab reports.</li>
              <li>Request correction of inaccurate personal demographic information.</li>
              <li>Delete discretionary uploaded medical records at any time directly through your dashboard.</li>
              <li>Request total account deactivation and removal subject to mandatory medical record retention laws.</li>
            </ul>
          </div>
        </section>

        {/* Section 4: AI & Medical Disclaimer */}
        <section className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-3 text-slate-900 font-bold text-lg">
            <Eye className="w-5 h-5 text-teal-600" />
            <h2>4. AI Assistant & Medical Data Handling</h2>
          </div>
          <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
            <p>
              The MediFlow AI interactive assistant runs securely either through our verified clinical microservice or locally on your hardware via Ollama. 
              Conversational prompts submitted to the assistant are used exclusively to provide general preventive guidance and department navigation. 
              Interactions are not sold to third-party data brokers or advertisers. 
            </p>
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed">
              <strong>Medical Notice:</strong> MediFlow AI is a scheduling and healthcare workflow coordination tool. AI-generated insights are informational and do not establish a formal physician-patient relationship or constitute medical diagnosis.
            </div>
          </div>
        </section>

        {/* Section 5: Contact Information */}
        <section className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xs space-y-3">
          <h2 className="text-slate-900 font-bold text-base">5. Contact Our Data Protection Officer</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            For privacy inquiries, data subject access requests, or security concerns, contact our Data Protection Team at <span className="font-semibold text-teal-700">privacy@mediflow.ai</span> or write to MediFlow AI Technologies, Saveetha Medical College Campus, Chennai, Tamil Nadu, India.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
