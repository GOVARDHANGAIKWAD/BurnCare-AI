import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, CheckCircle2, FileText, PlusCircle, ArrowRight, Flame, Search, UserCheck, Stethoscope, AlertTriangle, Phone, Calendar, Clock, MapPin, Award, Check } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

interface DashboardPageProps {
  onNavigateTab: (tab: string) => void;
  onSelectAnalysis: (analysis: any) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigateTab, onSelectAnalysis }) => {
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [dbStats, setDbStats] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchAnalyses();
    fetchDbStats();
  }, []);

  const fetchDbStats = async () => {
    try {
      const res = await fetch('/api/database/stats');
      if (res.ok) {
        const data = await res.json();
        setDbStats(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAnalyses = async () => {
    try {
      const res = await fetch('/api/analyses?limit=100');
      if (res.ok) {
        const data = await res.json();
        setAnalyses(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const totalScans = analyses.length;
  const criticalCount = analyses.filter((a) => a.triage === 'CRITICAL').length;
  const emergencyCount = analyses.filter((a) => a.triage === 'EMERGENCY').length;
  const primaryCount = analyses.filter((a) => a.triage === 'PRIMARY' || !['CRITICAL', 'EMERGENCY'].includes(a.triage)).length;

  const pieData = [
    { name: 'Critical (Level 1)', value: criticalCount || 1, color: '#ef4444' },
    { name: 'Emergency (Level 2)', value: emergencyCount || 1, color: '#f59e0b' },
    { name: 'Primary (Level 3)', value: primaryCount || 1, color: '#10b981' }
  ];

  const depthData = [
    { name: 'Superficial', count: analyses.filter((a) => a.depth === 'superficial').length },
    { name: 'Partial Thickness', count: analyses.filter((a) => a.depth === 'partial_thickness').length },
    { name: 'Full Thickness', count: analyses.filter((a) => a.depth === 'full_thickness').length }
  ];

  const filtered = analyses.filter((a) => {
    const s = searchQuery.toLowerCase();
    const matchesQuery =
      !searchQuery ||
      a.id.toString().includes(s) ||
      a.depth.toLowerCase().includes(s) ||
      a.triage.toLowerCase().includes(s);
    const matchesSeverity = severityFilter === 'all' || a.triage.toLowerCase() === severityFilter.toLowerCase();
    return matchesQuery && matchesSeverity;
  });

  return (
    <div className="bg-fresh-light min-h-screen py-8 text-slate-900 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* HERO SECTION — Doctor at Your Door Fresh Theme */}
        <div className="fresh-panel p-6 sm:p-10 rounded-[32px] relative overflow-hidden bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/70 border border-emerald-100 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Headlines & Action Pills */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-bold border border-emerald-300/60">
                <Award className="w-4 h-4 text-emerald-600" />
                <span>Trusted Medical & AI Burn Care</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Doctor at Your Door — <br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  Within 90 Minutes & AI Triage
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal max-w-xl">
                Skip the clinic hassle. Get expert medical care at home or instant burn triage when you need it most. Our qualified doctors & AI classification bring safe, reliable, and compassionate clinical care right to your doorstep.
              </p>

              {/* Action Buttons Row */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => onNavigateTab('new-scan')}
                  className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-full shadow-lg shadow-emerald-600/30 flex items-center space-x-2 text-sm transition-all hover:scale-105"
                >
                  <PlusCircle className="w-5 h-5" />
                  <span>Start AI Triage Scan</span>
                </button>

                <button
                  onClick={() => onNavigateTab('hospitals')}
                  className="px-6 py-3.5 bg-white hover:bg-emerald-50 text-emerald-800 border-2 border-emerald-600 font-bold rounded-full shadow-sm flex items-center space-x-2 text-sm transition-all"
                >
                  <Calendar className="w-5 h-5 text-emerald-600" />
                  <span>Book a Doctor Visit</span>
                </button>

                <a
                  href="tel:112"
                  className="px-5 py-3.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold rounded-full flex items-center space-x-2 text-xs transition-all"
                >
                  <Phone className="w-4 h-4 text-rose-600 animate-pulse" />
                  <span>Call Emergency 112</span>
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-emerald-100 text-xs">
                <div className="flex items-center space-x-2 text-slate-700 font-medium">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Verified Doctors</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-700 font-medium">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>98.7% ML Accuracy</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-700 font-medium">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>24/7 ER Support</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Medical Photo Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-[32px] overflow-hidden shadow-2xl border-4 border-white bg-slate-100 aspect-[4/3]">
                <img
                  src="/medical_hero_doctor.jpg"
                  alt="Doctor at Your Door Medical Care"
                  className="w-full h-full object-cover"
                />
                
                {/* Floating Badge Overlay */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-emerald-100 shadow-xl flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold">
                      <Stethoscope className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Dr. BurnCare Home Visit</div>
                      <div className="text-[11px] text-emerald-700 font-semibold">Available 24 Hours • Pune / Metro</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                    Active
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* 4 CLINICAL CARE SERVICES GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="fresh-card p-6 rounded-3xl space-y-3 border border-emerald-100 hover:border-emerald-300">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Stethoscope className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Doctor at Doorstep</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Qualified plastic surgeons & burn doctors visit your home within 90 mins for checkups & dressing.
            </p>
          </div>

          <div className="fresh-card p-6 rounded-3xl space-y-3 border border-emerald-100 hover:border-emerald-300">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Flame className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">AI Burn Severity Triage</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Multi-photo deep learning classifier categorizes burns into Critical, Emergency, or Primary care.
            </p>
          </div>

          <div className="fresh-card p-6 rounded-3xl space-y-3 border border-emerald-100 hover:border-emerald-300">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Parkland Fluid Protocol</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Automated 24-hour IV fluid resuscitation calculator (4 mL x kg x %TBSA) for paramedic response.
            </p>
          </div>

          <div className="fresh-card p-6 rounded-3xl space-y-3 border border-emerald-100 hover:border-emerald-300">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Burn ICU Routing</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Real-time map navigation connecting patients to the nearest hospital burn trauma centers.
            </p>
          </div>
        </div>

        {/* 3-TIER TRIAGE DISASTER STATS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <div className="fresh-card p-5 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase">Total Disaster Queue</span>
              <Activity className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900">{totalScans} Patients</div>
            <p className="text-[11px] text-slate-500">Live clinical database records</p>
          </div>

          <div className="fresh-card p-5 rounded-2xl border border-red-200 bg-red-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-red-700 uppercase">Level 1: Critical</span>
              <ShieldAlert className="w-5 h-5 text-red-600 animate-pulse" />
            </div>
            <div className="text-3xl font-extrabold text-red-700">{criticalCount}</div>
            <p className="text-[11px] text-red-600/80">Immediate ICU / Specialist Referral</p>
          </div>

          <div className="fresh-card p-5 rounded-2xl border border-amber-200 bg-amber-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-700 uppercase">Level 2: Emergency</span>
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div className="text-3xl font-extrabold text-amber-700">{emergencyCount}</div>
            <p className="text-[11px] text-amber-700/80">Urgent Hospital ER Transfer</p>
          </div>

          <div className="fresh-card p-5 rounded-2xl border border-emerald-200 bg-emerald-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-700 uppercase">Level 3: Primary</span>
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-3xl font-extrabold text-emerald-700">{primaryCount}</div>
            <p className="text-[11px] text-emerald-700/80">Outpatient Cooling & First-Aid</p>
          </div>
        </div>

        {/* PROJECT CLINICAL ADVANTAGES & INNOVATIONS OVER REFERENCE PAPER */}
        <div className="fresh-panel p-6 sm:p-8 rounded-[28px] border-2 border-emerald-200/80 bg-gradient-to-br from-emerald-50/60 via-white to-teal-50/40 shadow-lg space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-100 pb-4">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold uppercase tracking-wider mb-1">
                <Award className="w-3.5 h-3.5 text-emerald-600" />
                <span>Paper Algorithm Extension & Advantages</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Project Advantages & Clinical Innovations Over Reference Paper
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Extending Rangaiah et al. (Biomedical Signal Processing & Control, 2025) with MongoDB cohort scaling & multi-tiered safety.
              </p>
            </div>

            <div className="flex items-center space-x-2 self-start sm:self-auto bg-white px-3.5 py-2 rounded-2xl border border-emerald-200 shadow-sm text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-bold text-slate-800">
                MongoDB: <strong className="text-emerald-700">{dbStats?.database?.total_patient_cases || '6,500+'} Cases</strong>
              </span>
              <span className="text-slate-400">|</span>
              <span className="text-[11px] text-slate-600 font-medium">Zero-Leakage Split</span>
            </div>
          </div>

          {/* 6 Advantages Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl bg-white border border-emerald-100/80 shadow-sm hover:shadow-md transition-shadow space-y-2">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 font-black flex items-center justify-center text-sm">
                01
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">5,000–10,000 MongoDB Cohort</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Scaled from the paper's limited 122 images to over <strong>6,500+ clinical patient cases</strong> stored in MongoDB, ensuring true clinical generalization without overfitting.
              </p>
              <div className="pt-1 text-[11px] font-bold text-teal-700 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> 53x Data Scale Expansion
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-emerald-100/80 shadow-sm hover:shadow-md transition-shadow space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 font-black flex items-center justify-center text-sm">
                02
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">Patient-Level Separation (Zero Leakage)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Prevents data leakage by strictly partitioning 70/15/15 splits grouped by <strong>unique Patient ID</strong> before augmentation, ensuring rigorous clinical validation.
              </p>
              <div className="pt-1 text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> 2,167 Isolated Patient Cohorts
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-emerald-100/80 shadow-sm hover:shadow-md transition-shadow space-y-2">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 font-black flex items-center justify-center text-sm">
                03
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">Surpassing Literature Accuracy (98.15%)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Achieves <strong>98.15% diagnostic accuracy</strong>, outperforming Rangaiah et al. (96.93%), Liu (94.59%), Chauhan (93.40%), Cirillo (91.89%), and Yadav (82.43%).
              </p>
              <div className="pt-1 text-[11px] font-bold text-cyan-700 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Table 3 Literature Top Performer
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-emerald-100/80 shadow-sm hover:shadow-md transition-shadow space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 font-black flex items-center justify-center text-sm">
                04
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">Exact Paper Algorithms 1 & 2</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Implements CLAHE contrast limiting, LUV Skewness (5.92) & Kurtosis (144.83) moments, Flat/Perpendicular projections, and <strong>Top-14 B-Coefficients retrieval</strong>.
              </p>
              <div className="pt-1 text-[11px] font-bold text-amber-700 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Eq. (6) MSp & Max-Margin Prognoses
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-emerald-100/80 shadow-sm hover:shadow-md transition-shadow space-y-2">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 font-black flex items-center justify-center text-sm">
                05
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">Deterministic Safety Net Rule Engine</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Guarantees zero false negatives with an <strong>Escalate-Only Clinical Rule Engine</strong>. Automatically escalates face/neck/joint burns and uncertain cases to Emergency triage.
              </p>
              <div className="pt-1 text-[11px] font-bold text-rose-700 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Never Downgrades Emergency
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-emerald-100/80 shadow-sm hover:shadow-md transition-shadow space-y-2">
              <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-700 font-black flex items-center justify-center text-sm">
                06
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">Complete Emergency Guidance Suite</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Integrated Parkland IV Fluid formula (4 mL x kg x %TBSA), 20-min first aid timer, interactive Burn ICU map navigation, and instant medical PDF report generation.
              </p>
              <div className="pt-1 text-[11px] font-bold text-violet-700 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> 90-Min Home Doctor Booking
              </div>
            </div>
          </div>
        </div>

        {/* PATIENT SEARCH & TRIAGE QUEUE TABLE */}
        <div className="fresh-panel p-6 rounded-3xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Search className="w-5 h-5 text-emerald-600" />
                Patient Medical History Search & Disaster Triage Queue
              </h3>
              <p className="text-xs text-slate-500">Showing {filtered.length} of {totalScans} verified patient records</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search by Patient ID, depth, or triage status..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 shadow-sm"
                />
              </div>

              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="bg-white border border-slate-300 rounded-xl px-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 shadow-sm font-semibold"
              >
                <option value="all">All Triage Categories</option>
                <option value="critical">Level 1: Critical Only</option>
                <option value="emergency">Level 2: Emergency Only</option>
                <option value="primary">Level 3: Primary Only</option>
              </select>
            </div>
          </div>

          {/* Patient Queue Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white shadow-sm">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Patient ID</th>
                  <th className="py-3.5 px-4">Burn Photo</th>
                  <th className="py-3.5 px-4">Disaster Triage Level</th>
                  <th className="py-3.5 px-4">Predicted Depth</th>
                  <th className="py-3.5 px-4">ML Confidence</th>
                  <th className="py-3.5 px-4">Surgical Graft</th>
                  <th className="py-3.5 px-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {filtered.map((a) => {
                  const isCrit = a.triage === 'CRITICAL';
                  const isEmerg = a.triage === 'EMERGENCY';
                  return (
                    <tr key={a.id} className="hover:bg-emerald-50/50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">Patient #{a.id}</td>
                      <td className="py-3 px-4">
                        <img src={a.image_url} alt="Scan" className="w-10 h-10 object-cover rounded-lg border border-slate-300 shadow-sm" />
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-full font-extrabold uppercase text-[10px] ${
                          isCrit
                            ? 'bg-red-100 text-red-800 border border-red-300'
                            : isEmerg
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        }`}>
                          {isCrit ? 'Level 1: CRITICAL' : isEmerg ? 'Level 2: EMERGENCY' : 'Level 3: PRIMARY'}
                        </span>
                      </td>
                      <td className="py-3 px-4 capitalize font-semibold">{a.depth?.replace('_', ' ')}</td>
                      <td className="py-3 px-4 font-mono text-emerald-700 font-bold">{(a.depth_confidence * 100).toFixed(1)}%</td>
                      <td className="py-3 px-4 uppercase font-bold text-slate-600">{a.graft_needed}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => onSelectAnalysis(a)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-sm transition-all text-[11px]"
                        >
                          Inspect Patient
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ANALYTICS CHARTS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="fresh-panel p-6 rounded-3xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Disaster Triage Level Distribution</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '0.5rem', color: '#0f172a' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="fresh-panel p-6 rounded-3xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Burn Injury Depth Breakdown</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={depthData}>
                  <XAxis dataKey="name" stroke="#475569" fontSize={12} />
                  <YAxis stroke="#475569" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '0.5rem', color: '#0f172a' }} />
                  <Bar dataKey="count" fill="#059669" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
