import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  AlertTriangle, 
  PhoneCall, 
  RotateCcw, 
  Cpu, 
  CheckCircle2, 
  HelpCircle,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import api from '../utils/api';

export const HealthcareChat = ({ onSelectDepartment, patientName = "Patient" }) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello ${patientName}! I am your MediBook AI Healthcare Assistant.\n\nI can help you understand symptoms, guide your appointment bookings, explain our telehealth video rooms, or direct you to the right clinical department.\n\nHow can I help you today?`,
      source: 'MEDIBOOK_ASSISTANT'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFailedMessage, setLastFailedMessage] = useState('');
  const [ollamaStatus, setOllamaStatus] = useState({
    status: 'CHECKING',
    configuredModel: 'llama3.2:3b',
    isModelAvailable: false
  });

  const chatEndRef = useRef(null);

  // Poll / check Ollama status on mount
  useEffect(() => {
    let isMounted = true;
    const checkStatus = async () => {
      try {
        const res = await api.ai.getOllamaStatus();
        if (isMounted && res) {
          setOllamaStatus(res);
        }
      } catch (e) {
        if (isMounted) {
          setOllamaStatus({
            status: 'UNAVAILABLE',
            configuredModel: 'llama3.2:3b',
            isModelAvailable: false,
            message: 'Ollama local LLM is offline. Running with rule-based clinical engine.'
          });
        }
      }
    };
    checkStatus();
    return () => { isMounted = false; };
  }, []);

  // Auto-scroll on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const quickPrompts = [
    { label: "🩺 How to book an appointment", query: "How do I book an appointment on MediBook AI?" },
    { label: "💻 Video Teleconsultations", query: "How do telehealth video consultations work?" },
    { label: "⚠️ Check chest pain symptoms", query: "Patient has crushing chest pain and shortness of breath" },
    { label: "📋 Medical records needed", query: "What medical records should I prepare for a doctor visit?" },
    { label: "💊 Digital prescriptions", query: "How do digital prescriptions work on MediBook AI?" }
  ];

  const handleSend = async (overrideText = null) => {
    const textToSend = (overrideText !== null ? overrideText : inputValue).trim();
    if (!textToSend || loading) return;

    setError(null);
    const userMessage = { role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      // Build conversation history (excluding system prompt & limit to last 8 turns)
      const historyPayload = messages
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .slice(-8)
        .map(m => ({ role: m.role, content: m.content }));

      const response = await api.ai.chat(textToSend, historyPayload);

      const botMessage = {
        role: 'assistant',
        content: response.reply || response.content || "Thank you. Our clinic team is available to assist you.",
        recommendedDepartment: response.recommendedDepartment,
        urgency: response.urgency,
        action: response.action,
        source: response.source || 'OLLAMA_LOCAL_LLM',
        model: response.model
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      console.error("Healthcare Assistant error:", err);
      setLastFailedMessage(textToSend);
      setError(err.response?.data?.error || err.message || "Unable to reach the healthcare assistant service.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReset = () => {
    setMessages([
      {
        role: 'assistant',
        content: `Conversation refreshed. How can I assist you with your health consultations or appointment scheduling today, ${patientName}?`,
        source: 'MEDIBOOK_ASSISTANT'
      }
    ]);
    setError(null);
  };

  const isOllamaConnected = ollamaStatus.status === 'CONNECTED' && ollamaStatus.isModelAvailable;

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm flex flex-col h-[650px] overflow-hidden">
      {/* 1. Header Bar */}
      <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-hospital-600 text-white flex items-center justify-center shadow-md shadow-hospital-600/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-800 text-sm">MediBook AI Health Coordinator</h3>
              {/* Ollama Status Pill */}
              <span 
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  isOllamaConnected 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
                title={ollamaStatus.message || (isOllamaConnected ? "Ollama LLM active" : "Clinical fallback engine active")}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isOllamaConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                {isOllamaConnected ? `Ollama (${ollamaStatus.configuredModel})` : 'Clinical Fallback Engine'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">Local LLM & Clinical Triage Decision Support</p>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-1 text-xs font-semibold"
          title="Reset conversation"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* 2. Chat Stream */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-gradient-to-b from-slate-50/20 to-white">
        {messages.map((msg, idx) => {
          const isAssistant = msg.role === 'assistant';
          const isEmergency = msg.urgency === 'CRITICAL_EMERGENCY' || msg.action === 'EMERGENCY_ALERT';

          return (
            <div
              key={idx}
              className={`flex items-start gap-3 text-sm ${isAssistant ? 'justify-start' : 'justify-end'}`}
            >
              {isAssistant && (
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-1 shadow-sm ${
                  isEmergency ? 'bg-rose-600 text-white animate-pulse' : 'bg-hospital-600 text-white'
                }`}>
                  {isEmergency ? <AlertTriangle className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
              )}

              <div className={`p-4 rounded-2xl max-w-xl text-left shadow-sm ${
                isAssistant
                  ? isEmergency
                    ? 'bg-rose-50 border-2 border-rose-300 text-rose-950 rounded-tl-none font-medium'
                    : 'bg-slate-100/90 text-slate-800 rounded-tl-none font-normal'
                  : 'bg-hospital-600 text-white rounded-tr-none font-medium'
              }`}>
                {/* Emergency Header if critical */}
                {isEmergency && (
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-rose-200 text-rose-700 font-bold text-xs uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Emergency Warning Protocol Triggered</span>
                  </div>
                )}

                <div className="whitespace-pre-wrap leading-relaxed text-sm">
                  {msg.content}
                </div>

                {/* Emergency Action Dial Button */}
                {isEmergency && (
                  <div className="mt-3 pt-3 border-t border-rose-200 flex flex-wrap gap-2">
                    <a
                      href="tel:108"
                      className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <PhoneCall className="w-3.5 h-3.5" /> Call National Ambulance (108)
                    </a>
                    <a
                      href="tel:112"
                      className="px-3.5 py-1.5 bg-slate-800 hover:bg-black text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <PhoneCall className="w-3.5 h-3.5" /> Emergency Services (112)
                    </a>
                  </div>
                )}

                {/* Specialty Guidance Shortcut */}
                {isAssistant && msg.recommendedDepartment && !isEmergency && onSelectDepartment && (
                  <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex flex-wrap gap-2 items-center">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Suggested Specialty:</span>
                    <button
                      onClick={() => onSelectDepartment(msg.recommendedDepartment)}
                      className="px-3 py-1 bg-hospital-600 hover:bg-hospital-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <Sparkles className="w-3 h-3" /> Book in {msg.recommendedDepartment}
                    </button>
                  </div>
                )}

                {/* Source Badge */}
                {isAssistant && (
                  <div className="mt-2 text-[9px] text-slate-400 font-semibold flex items-center gap-1 justify-end">
                    <Cpu className="w-2.5 h-2.5" />
                    <span>{msg.source === 'OLLAMA_LOCAL_LLM' ? `Ollama (${msg.model || 'llama3.2:3b'})` : 'Clinical Knowledge Guard'}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Bubble */}
        {loading && (
          <div className="flex items-start gap-3 text-sm justify-start">
            <div className="w-8 h-8 rounded-xl bg-hospital-600 text-white flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl bg-slate-100 rounded-tl-none text-slate-500 text-xs flex items-center gap-2">
              <div className="flex space-x-1.5">
                <div className="w-2 h-2 bg-hospital-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-hospital-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-hospital-500 rounded-full animate-bounce"></div>
              </div>
              <span className="font-semibold text-slate-600">MediBook AI is formulating clinical guidance...</span>
            </div>
          </div>
        )}

        {/* Error Retry Card */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0" />
              <span>{error}</span>
            </div>
            {lastFailedMessage && (
              <button
                onClick={() => handleSend(lastFailedMessage)}
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 shadow-sm"
              >
                <RefreshCw className="w-3 h-3" /> Retry
              </button>
            )}
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* 3. Quick Suggestion Prompt Chips */}
      <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex-shrink-0 pl-1">Suggested:</span>
        {quickPrompts.map((p, i) => (
          <button
            key={i}
            onClick={() => handleSend(p.query)}
            disabled={loading}
            className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shadow-2xs hover:shadow-xs disabled:opacity-50"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* 4. Input Message Area */}
      <div className="p-4 border-t border-slate-100 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2 items-center"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about symptoms, booking appointments, or clinic departments..."
            disabled={loading}
            maxLength={2000}
            className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-hospital-500 text-sm font-medium text-slate-800 disabled:bg-slate-50"
          />
          <button
            type="submit"
            disabled={loading || !inputValue.trim()}
            className="p-3 bg-hospital-600 hover:bg-hospital-700 disabled:bg-slate-200 text-white rounded-2xl shadow-md shadow-hospital-600/10 hover:shadow-hospital-600/20 transition-all flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
            title="Send message (Enter)"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>

        {/* 5. Medical Safety Disclaimer */}
        <p className="mt-2 text-[10px] text-slate-400 text-center font-medium leading-relaxed">
          🛡️ <strong className="text-slate-500">Medical Safety Notice:</strong> MediBook AI assistant provides informational healthcare coordination and administrative scheduling guidance. It does not provide medical diagnosis or treatment plans. In emergencies, call <strong className="text-slate-600">108 / 112</strong> immediately.
        </p>
      </div>
    </div>
  );
};

export default HealthcareChat;

