import React from 'react';
import { Activity, PlusCircle, MapPin, History, BarChart3, Stethoscope, Phone, MessageCircle, HeartPulse, Award } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenDoctorChat?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenDoctorChat }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard Queue', icon: Activity },
    { id: 'new-scan', label: 'Multi-Photo Triage', icon: PlusCircle, highlight: true },
    { id: 'hospitals', label: 'Burn ICUs Map', icon: MapPin },
    { id: 'history', label: 'Medical History', icon: History },
    { id: 'admin', label: 'Doctor Benchmarks', icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Branding (Doctor@Door Style) */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 font-black">
              <Stethoscope className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-black tracking-tight text-slate-900 font-sans">
                  Doctor<span className="text-emerald-600">@Door</span>
                </span>
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase tracking-wider">
                  BurnCare AI
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block font-medium">90-Min Home Doctor Visits & Emergency AI Triage</p>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all ${
                    item.highlight
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 font-extrabold'
                      : isActive
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Action Buttons (WhatsApp & Call) */}
          <div className="flex items-center space-x-3">
            {onOpenDoctorChat && (
              <button
                onClick={onOpenDoctorChat}
                className="hidden sm:flex items-center space-x-2 px-3.5 py-2 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 transition-all"
              >
                <Stethoscope className="w-4 h-4 text-teal-600 animate-pulse" />
                <span>Ask AI Doctor</span>
              </button>
            )}

            {/* WhatsApp Icon Button */}
            <a
              href="https://wa.me/?text=BurnCare%20AI%20Doctor%20Triage"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-md hover:brightness-110 transition-all"
              title="Chat on WhatsApp"
            >
              <MessageCircle className="w-5 h-5 fill-current" />
            </a>

            {/* Call Action Button */}
            <a
              href="tel:112"
              className="px-5 py-2.5 rounded-full text-xs font-extrabold border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white transition-all shadow-sm flex items-center space-x-2"
            >
              <Phone className="w-4 h-4" />
              <span>Call 112</span>
            </a>
          </div>

        </div>
      </div>
    </header>
  );
};
