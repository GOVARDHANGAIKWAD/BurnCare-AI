import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardPage } from './pages/DashboardPage';
import { NewAnalysisPage } from './pages/NewAnalysisPage';
import { ResultPage } from './pages/ResultPage';
import { HospitalsPage } from './pages/HospitalsPage';
import { HistoryPage } from './pages/HistoryPage';
import { AdminPage } from './pages/AdminPage';
import { AIDoctorChatModal } from './components/AIDoctorChatModal';
import { Stethoscope } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [activeAnalysisData, setActiveAnalysisData] = useState<any | null>(null);
  const [isDoctorChatOpen, setIsDoctorChatOpen] = useState<boolean>(false);

  const handleAnalysisComplete = (resultData: any) => {
    setActiveAnalysisData(resultData);
    setActiveTab('result');
  };

  const handleSelectAnalysis = async (analysisData: any) => {
    try {
      const res = await fetch(`/api/analyses/${analysisData.id}`);
      if (res.ok) {
        const fullData = await res.json();
        setActiveAnalysisData(fullData);
      } else {
        setActiveAnalysisData(analysisData);
      }
    } catch (e) {
      console.error(e);
      setActiveAnalysisData(analysisData);
    }
    setActiveTab('result');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-teal-500 selection:text-slate-950 relative">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenDoctorChat={() => setIsDoctorChatOpen(true)}
      />

      <main className="flex-1 pb-16">
        {activeTab === 'dashboard' && (
          <DashboardPage
            onNavigateTab={setActiveTab}
            onSelectAnalysis={handleSelectAnalysis}
          />
        )}

        {activeTab === 'new-scan' && (
          <NewAnalysisPage onAnalysisComplete={handleAnalysisComplete} />
        )}

        {activeTab === 'result' && activeAnalysisData && (
          <ResultPage
            data={activeAnalysisData}
            onNavigateTab={setActiveTab}
            onNewScan={() => setActiveTab('new-scan')}
          />
        )}

        {activeTab === 'hospitals' && <HospitalsPage />}

        {activeTab === 'history' && (
          <HistoryPage onSelectAnalysis={handleSelectAnalysis} />
        )}

        {activeTab === 'admin' && <AdminPage />}
      </main>

      {/* Floating AI Doctor Button */}
      <button
        onClick={() => setIsDoctorChatOpen(true)}
        className="fixed bottom-6 right-6 z-40 p-3.5 sm:p-4 bg-gradient-to-r from-rose-500 via-amber-500 to-teal-500 text-slate-950 rounded-2xl shadow-2xl shadow-teal-500/40 hover:scale-105 transition-all flex items-center space-x-2 font-black group border border-amber-300/40"
        title="Ask Dr. BurnCare AI Doctor Bot"
      >
        <Stethoscope className="w-6 h-6 animate-pulse text-slate-950" />
        <span className="text-xs font-black tracking-wide pr-1">Ask AI Doctor</span>
      </button>

      {/* AI Doctor Chat Modal */}
      <AIDoctorChatModal
        isOpen={isDoctorChatOpen}
        onClose={() => setIsDoctorChatOpen(false)}
        currentContext={activeAnalysisData}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-bold text-slate-400">BurnCare AI Pathway</span> — Reference paper extension (Rangaiah et al., 2025).
          </div>
          <div>
            Strict Escalate-Only Rule Safety Net | Medical Triage Support Only
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
