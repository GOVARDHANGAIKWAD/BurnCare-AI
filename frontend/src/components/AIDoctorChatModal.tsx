import React, { useState, useEffect, useRef } from 'react';
import { Stethoscope, Send, Key, X, Bot, User, Sparkles, AlertTriangle, ShieldCheck, RefreshCw, ChevronDown, MessageSquare } from 'lucide-react';

interface AIDoctorChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentContext?: any;
}

interface Message {
  id: string;
  sender: 'user' | 'doctor';
  text: string;
  timestamp: string;
  source?: string;
}

export const AIDoctorChatModal: React.FC<AIDoctorChatModalProps> = ({ isOpen, onClose, currentContext }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'doctor',
      text: `👋 **Hello! I am Dr. BurnCare AI**, your Clinical Emergency Triage & Treatment Assistant.
      
Tell me about your disease, burn condition, or symptoms (e.g. *scald burn, chemical burn, skin redness, infection signs*), and I will provide:
- ⚠️ **Essential Safety Precautions**
- 🩹 **Immediate Step-by-Step First-Aid**
- 💊 **Recommended Medications & Dressings**
- 🚨 **Red-Flag Hospital Escalation Signs**`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'Dr. BurnCare AI Doctor Bot'
    }
  ]);

  const [inputMsg, setInputMsg] = useState('');
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('openai_api_key') || '');
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const saveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('openai_api_key', key);
    setShowKeyModal(false);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputMsg;
    if (!query.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInputMsg('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          api_key: apiKey || undefined,
          history: messages.slice(-4).map((m) => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.text
          })),
          context: currentContext ? {
            triage: currentContext.triage,
            depth: currentContext.depth,
            questionnaire: currentContext.questionnaire
          } : undefined
        })
      });

      if (!response.ok) {
        throw new Error('Doctor assistant service failed.');
      }

      const data = await response.json();

      const doctorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'doctor',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: data.source || 'Dr. BurnCare AI Engine'
      };

      setMessages((prev) => [...prev, doctorMessage]);
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'doctor',
          text: `⚠️ **Clinical Connection Warning:** Unable to reach AI server.
          
**Immediate Burn Precautions:**
1. Cool burn under running tap water for 20 minutes.
2. Apply sterile gauze or paraffin wrap.
3. Take Paracetamol for pain. Call 112/108 if severe.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source: 'Offline Safety Fallback'
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const samplePrompts = [
    '🔥 2nd Degree Hot Water Scald - What medicines to apply?',
    '🚨 Facial Burn with Inhalation Risk - Emergency Precautions',
    '💊 Paracetamol & Silver Sulfadiazine dosage for burns',
    '🩹 Wound Infection & Pus - Precautions & Antibiotics'
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg h-[92vh] sm:h-[85vh] glass-panel rounded-3xl border border-teal-500/40 shadow-2xl flex flex-col overflow-hidden bg-slate-950/95">
        
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-900 to-rose-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-teal-400 p-0.5 shadow-lg shadow-teal-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-teal-300" />
                </div>
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-sm text-slate-100">Dr. BurnCare AI</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  {apiKey ? 'Live ChatGPT' : 'AI Doctor Bot'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Emergency Disease, Burn Precautions & Medication Guide</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowKeyModal(true)}
              className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 border ${
                apiKey
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-amber-300'
              }`}
              title="Configure OpenAI ChatGPT API Key"
            >
              <Key className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline text-[11px]">{apiKey ? 'Key Active' : 'Set API Key'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* API Key Modal overlay inside chat */}
        {showKeyModal && (
          <div className="p-4 bg-slate-900 border-b border-teal-500/40 text-xs space-y-3 animate-slide-down">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-300 flex items-center gap-1.5">
                <Key className="w-4 h-4 text-amber-400" />
                Configure OpenAI ChatGPT API Key
              </span>
              <button onClick={() => setShowKeyModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-slate-300 text-[11px]">
              Optional: Enter your OpenAI API key (`sk-...`) to connect live ChatGPT (GPT-3.5/GPT-4o) directly. If blank, Dr. BurnCare AI uses the built-in clinical doctor engine.
            </p>
            <div className="flex space-x-2">
              <input
                type="password"
                placeholder="sk-proj-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-teal-500 font-mono"
              />
              <button
                onClick={() => saveApiKey(apiKey)}
                className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs"
              >
                Save
              </button>
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex space-x-2.5 max-w-[88%] ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                  msg.sender === 'user' ? 'bg-teal-500 text-slate-950' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}>
                  {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-rose-400" />}
                </div>

                <div className="space-y-1">
                  <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-slate-950 font-medium rounded-tr-none'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none whitespace-pre-wrap'
                  }`}>
                    {msg.text}
                  </div>

                  <div className={`flex items-center space-x-2 text-[10px] text-slate-500 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <span>{msg.timestamp}</span>
                    {msg.source && <span className="text-teal-400/80">• {msg.source}</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center space-x-2 text-xs text-teal-400 animate-pulse p-2 bg-slate-900/50 rounded-xl w-fit border border-slate-800">
              <Sparkles className="w-4 h-4 text-teal-400 animate-spin" />
              <span>Dr. BurnCare AI is reviewing symptoms & calculating medical precautions...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 bg-slate-900/40 border-t border-slate-800/80 flex flex-wrap gap-1.5">
          {samplePrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-teal-300 px-2.5 py-1 rounded-lg border border-slate-700 transition-all text-left"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center space-x-2">
          <input
            type="text"
            placeholder="Ask Dr. BurnCare about burns, diseases, medicines, precautions..."
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputMsg.trim() || isTyping}
            className={`p-2.5 rounded-xl transition-all ${
              !inputMsg.trim() || isTyping
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-rose-500 via-amber-500 to-teal-500 text-slate-950 font-black hover:brightness-110 shadow-lg shadow-teal-500/20'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
