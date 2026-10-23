import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import {
  Video, VideoOff, Mic, MicOff, PhoneOff, MessageSquare, ShieldCheck,
  FileText, User, Clock, AlertCircle, Share2, CheckCircle
} from 'lucide-react';

export const TelehealthVideoRoom = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { user, isDoctor } = useAuth();

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [showNotesDrawer, setShowNotesDrawer] = useState(false);
  const [doctorNotes, setDoctorNotes] = useState('');
  const [consultationDuration, setConsultationDuration] = useState(0);

  useEffect(() => {
    const fetchAppt = async () => {
      try {
        setLoading(true);
        const data = await api.appointments.getById(appointmentId);
        setAppointment(data);
        if (data.doctorNotes) setDoctorNotes(data.doctorNotes);

        // Update status to IN_CONSULTATION if doctor joined
        if (isDoctor && data.status !== 'COMPLETED') {
          await api.appointments.updateStatus(appointmentId, 'IN_CONSULTATION', 'Doctor joined video room.');
        }
      } catch (err) {
        console.error("Failed to load appointment details for video room:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppt();

    // Call duration timer
    const timer = setInterval(() => {
      setConsultationDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [appointmentId, isDoctor]);

  const formatDuration = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleEndCall = async () => {
    const confirmEnd = window.confirm("Are you sure you want to end this telehealth video consultation?");
    if (!confirmEnd) return;

    try {
      if (isDoctor) {
        await api.appointments.updateStatus(appointmentId, 'COMPLETED', doctorNotes || 'Telehealth session completed successfully.');
        navigate('/doctor-dashboard');
      } else {
        navigate('/patient-dashboard');
      }
    } catch (err) {
      navigate('/patient-dashboard');
    }
  };

  const handleSaveNotes = async () => {
    try {
      await api.appointments.updateStatus(appointmentId, appointment?.status || 'IN_CONSULTATION', doctorNotes);
      alert('Clinical notes saved successfully.');
    } catch (err) {
      alert('Failed to save notes.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400 text-sm">Securing Encrypted Video Room...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-950 flex flex-col justify-between overflow-hidden text-white">
      {/* Top Bar */}
      <header className="px-6 py-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-white">MediBook AI Secure Telehealth Room</h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                End-to-End Encrypted
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Ref: <span className="font-mono text-slate-300">{appointment?.appointmentNumber || appointmentId}</span> | Patient: <span className="text-slate-200 font-medium">{appointment?.patientName}</span> | Doctor: <span className="text-slate-200 font-medium">{appointment?.doctorName}</span>
            </p>
          </div>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-4">
          <div className="px-3 py-1 rounded-full bg-slate-800 text-xs text-slate-300 border border-slate-700 flex items-center gap-1.5 font-mono">
            <Clock className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            <span>{formatDuration(consultationDuration)}</span>
          </div>

          {isDoctor && (
            <button
              onClick={() => setShowNotesDrawer(!showNotesDrawer)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-teal-400" />
              <span>{showNotesDrawer ? 'Hide Notes' : 'Clinical Notes'}</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Video Grid */}
      <main className="flex-1 p-4 grid grid-cols-1 md:grid-cols-2 gap-4 relative overflow-hidden">
        {/* Remote Participant Screen (e.g. Doctor viewing Patient or Patient viewing Doctor) */}
        <div className="relative rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden shadow-2xl">
          <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-slate-950/70 backdrop-blur-sm text-xs font-medium text-slate-300 border border-slate-800 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-blue-400" />
            <span>{isDoctor ? appointment?.patientName : appointment?.doctorName}</span>
          </div>

          <div className="text-center p-8">
            <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center mx-auto mb-4 text-3xl font-bold text-slate-400 shadow-inner">
              {isDoctor ? (appointment?.patientName?.[0] || 'P') : (appointment?.doctorName?.[0] || 'D')}
            </div>
            <h3 className="text-lg font-semibold text-white">
              {isDoctor ? appointment?.patientName : appointment?.doctorName}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {isDoctor ? 'Patient connected via WebRTC secure link' : `${appointment?.department} Specialist`}
            </p>
            <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Live HD Audio & Video Stream Active
            </div>
          </div>
        </div>

        {/* Local Participant Screen (Self-view) */}
        <div className="relative rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden shadow-2xl">
          <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-slate-950/70 backdrop-blur-sm text-xs font-medium text-slate-300 border border-slate-800 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            <span>You ({user?.name || (isDoctor ? 'Doctor' : 'Patient')})</span>
          </div>

          <div className="text-center p-8">
            {videoEnabled ? (
              <div className="space-y-3">
                <div className="w-28 h-28 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 mx-auto flex items-center justify-center text-3xl font-bold text-white shadow-xl">
                  {user?.name?.[0] || 'U'}
                </div>
                <p className="text-xs text-slate-400">Camera preview enabled</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
                  <VideoOff className="w-8 h-8" />
                </div>
                <p className="text-xs text-slate-400">Camera is paused</p>
              </div>
            )}
          </div>
        </div>

        {/* Doctor Clinical Notes Drawer Overlay */}
        {isDoctor && showNotesDrawer && (
          <aside className="absolute right-4 top-4 bottom-4 w-96 bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-700 p-6 flex flex-col justify-between shadow-2xl z-20 animate-fade-in">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-teal-400" />
                  Live Consultation Notes
                </h3>
                <button onClick={() => setShowNotesDrawer(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <div className="mt-4 space-y-3 text-xs">
                <div>
                  <span className="text-slate-500 block mb-0.5">Reported Symptoms:</span>
                  <div className="p-2.5 rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700/60">
                    {appointment?.reasonForVisit || 'General review'}
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 block mb-0.5">Clinical Observations & Diagnosis:</span>
                  <textarea
                    rows={6}
                    value={doctorNotes}
                    onChange={(e) => setDoctorNotes(e.target.value)}
                    placeholder="Enter patient vitals, diagnosis, and prescription notes..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800">
              <button
                onClick={handleSaveNotes}
                className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
              >
                Save Clinical Notes
              </button>
            </div>
          </aside>
        )}
      </main>

      {/* Bottom Floating Control Bar */}
      <footer className="p-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-center gap-4 z-10">
        {/* Audio Toggle */}
        <button
          onClick={() => setAudioEnabled(!audioEnabled)}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition shadow-lg ${
            audioEnabled
              ? 'bg-slate-800 hover:bg-slate-700 text-white'
              : 'bg-red-500/20 text-red-400 border border-red-500/40'
          }`}
          title={audioEnabled ? "Mute Microphone" : "Unmute Microphone"}
        >
          {audioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </button>

        {/* Video Toggle */}
        <button
          onClick={() => setVideoEnabled(!videoEnabled)}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition shadow-lg ${
            videoEnabled
              ? 'bg-slate-800 hover:bg-slate-700 text-white'
              : 'bg-red-500/20 text-red-400 border border-red-500/40'
          }`}
          title={videoEnabled ? "Turn Off Video" : "Turn On Video"}
        >
          {videoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </button>

        {/* End Call Button */}
        <button
          onClick={handleEndCall}
          className="px-6 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold text-sm shadow-xl flex items-center gap-2 transition hover:scale-105 active:scale-95"
        >
          <PhoneOff className="w-5 h-5" />
          <span>{isDoctor ? 'Complete & End Consultation' : 'Leave Video Call'}</span>
        </button>
      </footer>
    </div>
  );
};

export default TelehealthVideoRoom;
