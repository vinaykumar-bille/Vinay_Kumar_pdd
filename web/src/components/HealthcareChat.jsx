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
  RefreshCw,
  Globe
} from 'lucide-react';
import api from '../utils/api';

export const HealthcareChat = ({ onSelectDepartment, patientName = "Patient" }) => {
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello ${patientName}! I am your MediFlow AI Healthcare Assistant.\n\nI can help you understand symptoms, guide your doctor appointments, explain our telehealth video rooms, or direct you to the right clinical department.\n\nHow can I help you today?`,
      source: 'MEDIFLOW_ASSISTANT'
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

  const languages = [
    { code: 'English', label: 'English' },
    { code: 'Telugu', label: 'తెలుగు (Telugu)' },
    { code: 'Tamil', label: 'தமிழ் (Tamil)' },
    { code: 'Hindi', label: 'हिन्दी (Hindi)' }
  ];

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
            message: 'Ollama local LLM is offline. Running with verified clinical engine.'
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
    { label: "How to book an appointment", query: "How do I book an appointment on MediFlow AI?" },
    { label: "Video Teleconsultations", query: "How do telehealth video consultations work?" },
    { label: "Check chest pain symptoms", query: "Patient has crushing chest pain and shortness of breath" },
    { label: "Medical records needed", query: "What medical records should I prepare for a doctor visit?" },
    { label: "Digital prescriptions", query: "How do digital prescriptions work on MediFlow AI?" }
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

      const response = await api.ai.chat(textToSend, historyPayload, selectedLanguage);

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
        source: 'MEDIFLOW_ASSISTANT'
      }
    ]);
    setError(null);
  };

  const isOllamaConnected = ollamaStatus.status === 'CONNECTED' && ollamaStatus.isModelAvailable;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col h-[650px] overflow-hidden">
      {/* 1. Header Bar */}
      <div className="p-4 px-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#15324F] text-white flex items-center justify-center shadow-xs">
            <Bot className="w-5 h-5 text-[#087F8C]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-sm">MediFlow AI Assistant</h3>
              {/* Ollama Status Pill */}
              <span 
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                  isOllamaConnected 
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}
                title={ollamaStatus.message || (isOllamaConnected ? "Ollama LLM active" : "Clinical fallback engine active")}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isOllamaConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                {isOllamaConnected ? `Ollama (${ollamaStatus.configuredModel})` : 'Clinical Engine'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">Local LLM & Clinical Specialty Guidance</p>
          </div>
        </div>

        {/* Right Header Controls: Language Selector & Reset */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2 py-1 shadow-2xs">
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="text-xs bg-transparent text-slate-700 font-semibold focus:outline-none cursor-pointer"
              title="Select Assistant Language"
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleReset}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
            title="Reset conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* 2. Chat Stream */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-white">
        {messages.map((msg, idx) => {
          const isAssistant = msg.role === 'assistant';
          const isEmergency = msg.urgency === 'CRITICAL_EMERGENCY' || msg.action === 'EMERGENCY_ALERT';

          return (
            <div
              key={idx}
              className={`flex items-start gap-3 text-sm ${isAssistant ? 'justify-start' : 'justify-end'}`}
            >
              {isAssistant && (
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 shadow-xs ${
                  isEmergency ? 'bg-rose-600 text-white animate-pulse' : 'bg-[#15324F] text-white'
                }`}>
                  {isEmergency ? <AlertTriangle className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-[#087F8C]" />}
                </div>
              )}

              <div className={`p-4 rounded-xl max-w-xl text-left shadow-2xs ${
                isAssistant
                  ? isEmergency
                    ? 'bg-rose-50 border-2 border-rose-300 text-rose-950 font-medium'
                    : 'bg-[#F5F7F9] border border-slate-200/80 text-slate-800 font-normal'
                  : 'bg-[#15324F] text-white font-medium'
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
                      className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <PhoneCall className="w-3.5 h-3.5" /> Call National Ambulance (108)
                    </a>
                    <a
                      href="tel:112"
                      className="px-3.5 py-1.5 bg-slate-800 hover:bg-black text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <PhoneCall className="w-3.5 h-3.5" /> Emergency Services (112)
                    </a>
                  </div>
                )}

                {/* Specialty Guidance Shortcut */}
                {isAssistant && msg.recommendedDepartment && !isEmergency && onSelectDepartment && (
                  <div className="mt-3 pt-2.5 border-t border-slate-200 flex flex-wrap gap-2 items-center">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Suggested Specialty:</span>
                    <button
                      onClick={() => onSelectDepartment(msg.recommendedDepartment)}
                      className="px-3 py-1 bg-[#087F8C] hover:bg-[#076f7a] text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
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
            <div className="w-8 h-8 rounded-lg bg-[#15324F] text-white flex items-center justify-center flex-shrink-0 mt-1 shadow-xs">
              <Bot className="w-4 h-4 text-[#087F8C]" />
            </div>
            <div className="p-4 rounded-xl bg-slate-100 text-slate-500 text-xs flex items-center gap-2">
              <div className="flex space-x-1.5">
                <div className="w-2 h-2 bg-[#087F8C] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-[#087F8C] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-[#087F8C] rounded-full animate-bounce"></div>
              </div>
              <span className="font-semibold text-slate-600">MediFlow AI is formulating response in {selectedLanguage}...</span>
            </div>
          </div>
        )}

        {/* Error Retry Card */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0" />
              <span>{error}</span>
            </div>
            {lastFailedMessage && (
              <button
                onClick={() => handleSend(lastFailedMessage)}
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 shadow-xs"
              >
                <RefreshCw className="w-3 h-3" /> Retry
              </button>
            )}
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* 3. Quick Suggestion Prompt Chips */}
      <div className="px-4 py-2 border-t border-slate-200 bg-slate-50 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex-shrink-0 pl-1">Suggested:</span>
        {quickPrompts.map((p, i) => (
          <button
            key={i}
            onClick={() => handleSend(p.query)}
            disabled={loading}
            className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shadow-2xs disabled:opacity-50"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* 4. Input Message Area */}
      <div className="p-4 border-t border-slate-200 bg-white">
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
            placeholder={`Ask in ${selectedLanguage} about symptoms, booking appointments, or clinic departments...`}
            disabled={loading}
            maxLength={2000}
            className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#087F8C] text-sm font-medium text-slate-800 disabled:bg-slate-50"
          />
          <button
            type="submit"
            disabled={loading || !inputValue.trim()}
            className="p-2.5 bg-[#087F8C] hover:bg-[#076f7a] disabled:bg-slate-200 text-white rounded-lg shadow-xs transition-all flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
            title="Send message (Enter)"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>

        {/* 5. Medical Safety Disclaimer */}
        <p className="mt-2 text-[10px] text-slate-500 text-center font-medium leading-relaxed">
          <strong className="text-slate-700">Medical Safety Notice:</strong> MediFlow AI assistant provides informational healthcare coordination and administrative scheduling guidance. It does not provide medical diagnosis or treatment plans. In emergencies, call <strong className="text-slate-800">108 / 112</strong> immediately.
        </p>
      </div>
    </div>
  );
};

export default HealthcareChat;
